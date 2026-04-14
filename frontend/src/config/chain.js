/*
 * SOLIDARITY PLATFORM - CHAIN CONFIGURATION
 * ==========================================
 *
 * Sepolia testnet connection config, contract addresses, and ABIs
 * for read-only blockchain data access.
 *
 * TRADEMARKED BY SCOTT CHARLES OLSON
 */

// Sepolia testnet
export const CHAIN_ID = 11155111;
export const CHAIN_NAME = 'Sepolia';

// RPC endpoint (Alchemy)
export const RPC_URL =
  process.env.REACT_APP_RPC_URL ||
  'https://eth-sepolia.g.alchemy.com/v2/ut6qssWCGtO7zbAvLiG0h';

// Deployed contract addresses
export const TREASURY_ADDRESS = '0x362DC26b4b084778DB9525DF5A1d4A344C9E0C64';
export const TOKEN_ADDRESS = process.env.REACT_APP_TOKEN_ADDRESS || '0xe12A8C0386429Eb6Db0101c358A8cc4b10e09d86';

// TreasuryManager ABI (human-readable for ethers.js v6)
export const TREASURY_ABI = [
  'function owner() view returns (address)',
  'function scott() view returns (address)',
  'function hank() view returns (address)',
  'function infrastructureReserveBP() view returns (uint256)',
  'function totalDistributed() view returns (uint256)',
  'function distributionCount() view returns (uint256)',
  'function infrastructureReserveSet() view returns (bool)',
  'function hankChoice1() view returns (address)',
  'function hankChoice2() view returns (address)',
  'function hankChoice3() view returns (address)',
  'function hankChoice4() view returns (address)',
  'function hankCause1() view returns (address)',
  'function hankCause2() view returns (address)',
  'function hankCause3() view returns (address)',
  'function scottsMotherAddr() view returns (address)',
  'function sophieJones() view returns (address)',
  'function mariah() view returns (address)',
  'function colombiaFund() view returns (address)',
  'function openSlotA() view returns (address)',
  'function openSlotB() view returns (address)',
];

// SolidarityToken (SLDRT) ABI — ERC-20 + coherence reads
export const TOKEN_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function coherenceScore() view returns (uint256)',
  'function getCoherenceLevel() view returns (string)',
  'function getCoherenceHistoryLength() view returns (uint256)',
  'function treasuryManager() view returns (address)',
  'function coherenceGatingEnabled() view returns (bool)',
  'function CRITICAL_THRESHOLD() view returns (uint256)',
  'function STABLE_THRESHOLD() view returns (uint256)',
  'function ELEVATED_THRESHOLD() view returns (uint256)',
];

// Treasury slot labels for display
export const TREASURY_SLOTS = [
  { key: 'owner', label: 'Owner (Deployer)' },
  { key: 'scott', label: 'Scott' },
  { key: 'hank', label: 'Hank' },
  { key: 'hankChoice1', label: 'Hank Choice 1' },
  { key: 'hankChoice2', label: 'Hank Choice 2' },
  { key: 'hankChoice3', label: 'Hank Choice 3' },
  { key: 'hankChoice4', label: 'Hank Choice 4' },
  { key: 'hankCause1', label: 'Hank Cause 1' },
  { key: 'hankCause2', label: 'Hank Cause 2' },
  { key: 'hankCause3', label: 'Hank Cause 3' },
  { key: 'scottsMotherAddr', label: "Scott's Mother" },
  { key: 'sophieJones', label: 'Sophie Jones' },
  { key: 'mariah', label: 'Mariah' },
  { key: 'colombiaFund', label: 'Colombia Fund' },
  { key: 'openSlotA', label: 'Open Slot A' },
  { key: 'openSlotB', label: 'Open Slot B' },
];
