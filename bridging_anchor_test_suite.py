#!/usr/bin/env python3
"""
Bridging Anchor Test Suite
===========================

TRADEMARK INFORMATION:
Owner: Scott Charles Olson
Trademark: TRADEMARKED BY SCOTT CHARLES OLSON

Comprehensive test suite for the Bridging Anchor Processor system.
Tests all functionality including bridging transformations, anchor detection,
quantum tunneling, and Henry 7 Step 14 Trott Waltz sequencing.
"""

import sys
import os
import numpy as np
import json
from typing import Dict, List

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from bridging_anchor_processor import BridgingAnchorProcessor
except ImportError:
    print("⚠️ Could not import BridgingAnchorProcessor")
    sys.exit(1)


class BridgingAnchorTestSuite:
    """Comprehensive test suite for Bridging Anchor Processor."""
    
    def __init__(self):
        self.processor = None
        self.test_results = {
            'passed': 0,
            'failed': 0,
            'tests': []
        }
    
    def setup(self):
        """Setup test environment."""
        print("\n" + "="*70)
        print("BRIDGING ANCHOR TEST SUITE")
        print("="*70 + "\n")
        
        try:
            self.processor = BridgingAnchorProcessor()
            print("✓ Processor initialized successfully\n")
            return True
        except Exception as e:
            print(f"✗ Failed to initialize processor: {e}\n")
            return False
    
    def run_test(self, test_name: str, test_func) -> bool:
        """Run a single test and record results."""
        print(f"Testing: {test_name}...")
        try:
            test_func()
            print(f"  ✓ PASSED\n")
            self.test_results['passed'] += 1
            self.test_results['tests'].append({'name': test_name, 'status': 'PASSED'})
            return True
        except AssertionError as e:
            print(f"  ✗ FAILED: {e}\n")
            self.test_results['failed'] += 1
            self.test_results['tests'].append({'name': test_name, 'status': 'FAILED', 'error': str(e)})
            return False
        except Exception as e:
            print(f"  ✗ ERROR: {e}\n")
            self.test_results['failed'] += 1
            self.test_results['tests'].append({'name': test_name, 'status': 'ERROR', 'error': str(e)})
            return False
    
    def test_initialization(self):
        """Test processor initialization."""
        assert self.processor is not None, "Processor not initialized"
        assert self.processor.base_ratio == 1.618033988749, "Base ratio incorrect"
        assert self.processor.bridging_baseline == 0.618, "Bridging baseline incorrect"
        assert self.processor.henry_base == 7, "Henry base incorrect"
        assert self.processor.henry_double == 14, "Henry double incorrect"
        assert self.processor.henry_square == 49, "Henry square incorrect"
    
    def test_bridging_transform(self):
        """Test bridging transformation."""
        # Create test signal
        signal = np.ones(1000)
        
        # Apply bridging transform
        result = self.processor.apply_bridging_transform(signal, intensity=1.0)
        
        assert len(result) == len(signal), "Output length mismatch"
        assert not np.array_equal(result, signal), "Transform had no effect"
        assert np.isfinite(result).all(), "Transform produced invalid values"
    
    def test_anchor_detection(self):
        """Test anchor point detection."""
        # Create signal with clear peaks
        signal = np.zeros(1000)
        signal[100] = 1.0
        signal[500] = 1.0
        signal[900] = 1.0
        
        # Detect anchors
        anchors = self.processor.detect_anchor_points(signal, threshold=0.5)
        
        assert len(anchors) > 0, "No anchor points detected"
        assert 100 in anchors, "Expected anchor at index 100"
        assert 500 in anchors, "Expected anchor at index 500"
        assert 900 in anchors, "Expected anchor at index 900"
    
    def test_stabilization(self):
        """Test anchor stabilization."""
        # Create test signal
        signal = np.random.randn(1000)
        anchor_points = [100, 500, 900]
        
        # Apply stabilization
        result = self.processor.stabilize_at_anchors(signal, anchor_points)
        
        assert len(result) == len(signal), "Output length mismatch"
        assert not np.array_equal(result, signal), "Stabilization had no effect"
        assert np.isfinite(result).all(), "Stabilization produced invalid values"
    
    def test_quantum_tunneling(self):
        """Test quantum tunneling effect."""
        # Create test signal
        signal = np.sin(2 * np.pi * np.linspace(0, 1, 1000))
        
        # Apply quantum tunneling
        result = self.processor.apply_quantum_tunneling(signal, depth=14)
        
        assert len(result) == len(signal), "Output length mismatch"
        assert np.isfinite(result).all(), "Quantum tunneling produced invalid values"
        
        # Test with different depths
        result_shallow = self.processor.apply_quantum_tunneling(signal, depth=7)
        result_deep = self.processor.apply_quantum_tunneling(signal, depth=21)
        
        assert not np.array_equal(result_shallow, result_deep), "Depth parameter has no effect"
    
    def test_henry_sequence_processing(self):
        """Test Henry 7 Step 14 Trott Waltz sequence processing."""
        # Create test signal
        signal = np.ones(1000)
        
        # Process with different nodes
        result_7 = self.processor.process_with_henry_sequence(signal, node_id=7)
        result_14 = self.processor.process_with_henry_sequence(signal, node_id=14)
        
        assert len(result_7) == len(signal), "Output length mismatch"
        assert len(result_14) == len(signal), "Output length mismatch"
        assert not np.array_equal(result_7, result_14), "Node ID has no effect"
        assert np.isfinite(result_7).all(), "Processing produced invalid values"
    
    def test_full_pipeline(self):
        """Test complete bridging anchor processing pipeline."""
        # Create test signal
        duration = 0.1
        sample_rate = 44100
        t = np.linspace(0, duration, int(sample_rate * duration))
        signal = np.sin(2 * np.pi * 440 * t)
        
        # Run full pipeline
        results = self.processor.full_bridging_anchor_process(signal, apply_quantum=True, node_id=7)
        
        # Verify all stages present
        assert 'original' in results, "Original signal missing"
        assert 'bridged' in results, "Bridged signal missing"
        assert 'stabilized' in results, "Stabilized signal missing"
        assert 'quantum' in results, "Quantum processed signal missing"
        assert 'final' in results, "Final signal missing"
        assert 'anchor_points' in results, "Anchor points missing"
        
        # Verify signal lengths
        for key, value in results.items():
            if key != 'anchor_points':
                assert len(value) == len(signal), f"Length mismatch in {key}"
    
    def test_base_ratio_calculations(self):
        """Test base ratio and bridging baseline calculations."""
        # Verify base ratio
        assert abs(self.processor.base_ratio - 1.618033988749) < 1e-10, "Base ratio precision issue"
        
        # Verify bridging baseline
        assert abs(self.processor.bridging_baseline - 0.618) < 1e-3, "Bridging baseline incorrect"
        
        # Verify control ratio
        assert abs(self.processor.control_ratio - 3.5) < 1e-10, "Control ratio incorrect"
    
    def test_config_loading(self):
        """Test configuration file loading."""
        config_path = os.path.join(os.path.dirname(__file__), 'bridging_anchor_config.json')
        
        if os.path.exists(config_path):
            processor_with_config = BridgingAnchorProcessor(config_path)
            assert processor_with_config.sample_rate == 44100, "Config sample rate not loaded"
            assert processor_with_config.precision_bits == 16, "Config precision not loaded"
        else:
            print("    ⚠️ Config file not found, skipping detailed config test")
    
    def test_henry_framework_constants(self):
        """Test Henry 7 Step 14 Trott Waltz framework constants."""
        assert self.processor.henry_base == 7, "Henry base should be 7"
        assert self.processor.henry_double == 14, "Henry double should be 14"
        assert self.processor.henry_square == 49, "Henry square should be 49"
        assert self.processor.control_ratio == 3.5, "Control ratio should be 3.5 (49÷14)"
    
    def run_all_tests(self):
        """Run all tests in the suite."""
        if not self.setup():
            return False
        
        # Run each test
        self.run_test("Processor Initialization", self.test_initialization)
        self.run_test("Bridging Transform", self.test_bridging_transform)
        self.run_test("Anchor Point Detection", self.test_anchor_detection)
        self.run_test("Anchor Stabilization", self.test_stabilization)
        self.run_test("Quantum Tunneling", self.test_quantum_tunneling)
        self.run_test("Henry Sequence Processing", self.test_henry_sequence_processing)
        self.run_test("Full Processing Pipeline", self.test_full_pipeline)
        self.run_test("Base Ratio Calculations", self.test_base_ratio_calculations)
        self.run_test("Configuration Loading", self.test_config_loading)
        self.run_test("Henry Framework Constants", self.test_henry_framework_constants)
        
        # Print summary
        self.print_summary()
        
        return self.test_results['failed'] == 0
    
    def print_summary(self):
        """Print test results summary."""
        print("\n" + "="*70)
        print("TEST SUMMARY")
        print("="*70)
        print(f"Total Tests: {self.test_results['passed'] + self.test_results['failed']}")
        print(f"Passed: {self.test_results['passed']}")
        print(f"Failed: {self.test_results['failed']}")
        
        if self.test_results['failed'] > 0:
            print("\nFailed Tests:")
            for test in self.test_results['tests']:
                if test['status'] != 'PASSED':
                    print(f"  - {test['name']}: {test['status']}")
                    if 'error' in test:
                        print(f"    Error: {test['error']}")
        
        print("="*70 + "\n")
        
        if self.test_results['failed'] == 0:
            print("✓ ALL TESTS PASSED!")
        else:
            print("✗ SOME TESTS FAILED")
        print()


def main():
    """Run the test suite."""
    suite = BridgingAnchorTestSuite()
    success = suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
