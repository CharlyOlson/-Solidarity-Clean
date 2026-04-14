/*
 * SOLIDARITY PLATFORM - CHAIN DATA HOOK
 * ======================================
 *
 * React hook for read-only blockchain state from Sepolia.
 * Connects to TreasuryManager and (optionally) the token contract.
 * Auto-refreshes every 30 seconds. Handles RPC failures gracefully.
 *
 * TRADEMARKED BY SCOTT CHARLES OLSON
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  RPC_URL,
  TREASURY_ADDRESS,
  TOKEN_ADDRESS,
  TREASURY_ABI,
  TOKEN_ABI,
  TREASURY_SLOTS,
} from '../config/chain';

const REFRESH_INTERVAL = 30_000; // 30 seconds

function deriveCoherenceLevel(score) {
  // score is 0-100 integer from chain (basis-point style)
  if (score >= 80) return 'elevated';
  if (score >= 50) return 'stable';
  if (score >= 25) return 'degraded';
  return 'critical';
}

function deriveSystemStatus(level) {
  if (level === 'elevated' || level === 'stable') return 'Online';
  if (level === 'degraded') return 'Degraded';
  return 'Critical';
}

export function useChainData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Treasury state
  const [treasuryState, setTreasuryState] = useState({
    distributionCount: 0,
    totalDistributed: '0',
    infrastructureReserveBP: 0,
    infrastructureReserveSet: false,
    ownerAddress: '',
    slotAddresses: {},
  });

  // Token / coherence state
  const [tokenState, setTokenState] = useState({
    name: '',
    symbol: '',
    totalSupply: '0',
  });
  const [coherenceScore, setCoherenceScore] = useState(0);
  const [coherenceLevel, setCoherenceLevel] = useState('stable');
  const [systemStatus, setSystemStatus] = useState('Online');

  // Deployer balance
  const [deployerBalance, setDeployerBalance] = useState('0');

  const providerRef = useRef(null);
  const treasuryRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      // Lazily create provider and contract
      if (!providerRef.current) {
        providerRef.current = new ethers.JsonRpcProvider(RPC_URL);
      }
      if (!treasuryRef.current) {
        treasuryRef.current = new ethers.Contract(
          TREASURY_ADDRESS,
          TREASURY_ABI,
          providerRef.current
        );
      }

      const provider = providerRef.current;
      const treasury = treasuryRef.current;

      // --- Treasury reads (batched) ---
      const [
        distCount,
        totalDist,
        reserveBP,
        reserveSet,
        ownerAddr,
      ] = await Promise.all([
        treasury.distributionCount(),
        treasury.totalDistributed(),
        treasury.infrastructureReserveBP(),
        treasury.infrastructureReserveSet(),
        treasury.owner(),
      ]);

      // Read treasury slot addresses
      const slotAddresses = {};
      const slotResults = await Promise.all(
        TREASURY_SLOTS.filter((s) => s.key !== 'owner').map((slot) =>
          treasury[slot.key]().catch(() => ethers.ZeroAddress)
        )
      );
      TREASURY_SLOTS.filter((s) => s.key !== 'owner').forEach((slot, i) => {
        slotAddresses[slot.key] = slotResults[i];
      });
      slotAddresses.owner = ownerAddr;

      // Deployer ETH balance
      const deployerBal = await provider.getBalance(ownerAddr);

      if (!mountedRef.current) return;

      setTreasuryState({
        distributionCount: Number(distCount),
        totalDistributed: ethers.formatEther(totalDist),
        infrastructureReserveBP: Number(reserveBP),
        infrastructureReserveSet: reserveSet,
        ownerAddress: ownerAddr,
        slotAddresses,
      });
      setDeployerBalance(ethers.formatEther(deployerBal));

      // --- Token reads (only if address is set) ---
      if (TOKEN_ADDRESS) {
        try {
          const token = new ethers.Contract(
            TOKEN_ADDRESS,
            TOKEN_ABI,
            provider
          );
          const [name, symbol, supply, score, level] = await Promise.all([
            token.name(),
            token.symbol(),
            token.totalSupply(),
            token.coherenceScore().catch(() => 0),
            token.coherenceLevel().catch(() => ''),
          ]);

          if (!mountedRef.current) return;

          setTokenState({
            name,
            symbol,
            totalSupply: ethers.formatEther(supply),
          });

          const scoreNum = Number(score);
          setCoherenceScore(scoreNum);
          const lvl = level || deriveCoherenceLevel(scoreNum);
          setCoherenceLevel(lvl);
          setSystemStatus(deriveSystemStatus(lvl));
        } catch {
          // Token not deployed yet — use defaults
          if (!mountedRef.current) return;
          setCoherenceScore(0);
          setCoherenceLevel('stable');
          setSystemStatus('Online');
        }
      } else {
        // No token address configured
        if (!mountedRef.current) return;
        setCoherenceLevel('stable');
        setSystemStatus('Online');
      }

      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setError('Chain offline — ' + (err.message || 'RPC unreachable'));
      setSystemStatus('Offline');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const id = setInterval(fetchData, REFRESH_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData]);

  return {
    loading,
    error,
    treasuryState,
    tokenState,
    coherenceScore,
    coherenceLevel,
    systemStatus,
    deployerBalance,
    refresh: fetchData,
  };
}
