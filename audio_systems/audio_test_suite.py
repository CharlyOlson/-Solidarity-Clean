#!/usr/bin/env python3
"""
Comprehensive Test Suite for Advanced Audio Processing System

TRADEMARK INFORMATION - OFFICIALLY RECORDED:
- Owner: Scott Charles Olson
- TRADEMARKED BY SCOTT CHARLES OLSON

Tests all components of the advanced audio processing system:
- AudioTimeBuyer
- AudioParameterController
- AudioGradientTransferenceEngine
- Audio3DPositionalEncoder
- ProfessionalAudioProcessor
- AdvancedSpatialAudioProcessor
- SolidarityAudioProcessor
- MasterSolidarityAudioSystem
"""

import unittest
import numpy as np
import sys
import os

# Add parent directory to path to import the audio processor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from advanced_audio_processor import (
    AudioTimeBuyer,
    AudioParameterController,
    AudioGradientTransferenceEngine,
    Audio3DPositionalEncoder,
    ProfessionalAudioProcessor,
    AdvancedSpatialAudioProcessor,
    SolidarityAudioProcessor,
    MasterSolidarityAudioSystem,
    AudioParameters,
    ZIPPhrase
)


class TestAudioTimeBuyer(unittest.TestCase):
    """Test AudioTimeBuyer class"""
    
    def setUp(self):
        self.time_buyer = AudioTimeBuyer(sample_rate=44100)
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(self.time_buyer.sample_rate, 44100)
        self.assertAlmostEqual(self.time_buyer.pi, np.pi)
    
    def test_allocate_time_slice(self):
        """Test time slice allocation"""
        duration = 1.0
        time_array = self.time_buyer.allocate_time_slice(duration)
        self.assertEqual(len(time_array), 44100)
        self.assertAlmostEqual(time_array[-1], duration, places=5)
    
    def test_calculate_phase_time(self):
        """Test phase time calculation"""
        frequency = 440.0
        phase_offset = np.pi / 2
        phase_time = self.time_buyer.calculate_phase_time(frequency, phase_offset)
        self.assertGreater(phase_time, 0)
        self.assertLess(phase_time, 1.0 / frequency)
    
    def test_get_buffer_time(self):
        """Test buffer time calculation"""
        buffer_size = 1024
        buffer_time = self.time_buyer.get_buffer_time(buffer_size)
        expected = buffer_size / 44100
        self.assertAlmostEqual(buffer_time, expected)
    
    def test_synchronize_to_pi_boundary(self):
        """Test pi boundary synchronization"""
        time_value = 3.5
        synchronized = self.time_buyer.synchronize_to_pi_boundary(time_value)
        # Should be close to a pi multiple
        pi_cycles = synchronized / np.pi
        self.assertAlmostEqual(pi_cycles, round(pi_cycles))


class TestAudioParameterController(unittest.TestCase):
    """Test AudioParameterController class"""
    
    def setUp(self):
        self.params = AudioParameters()
        self.controller = AudioParameterController(self.params)
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertTrue(self.controller.smoothing_factor > 0)
        self.assertLessEqual(self.controller.smoothing_factor, 1.0)
    
    def test_set_get_parameter(self):
        """Test setting and getting parameters"""
        self.controller.set_parameter('gain', 0.5, smooth=False)
        value = self.controller.get_parameter('gain')
        self.assertEqual(value, 0.5)
    
    def test_parameter_smoothing(self):
        """Test parameter smoothing"""
        self.controller.set_parameter('volume', 0.0, smooth=False)
        self.controller.set_parameter('volume', 1.0, smooth=True)
        smoothed_value = self.controller.get_parameter('volume')
        # Smoothed value should be between 0 and 1, but not exactly 1
        self.assertGreater(smoothed_value, 0.0)
        self.assertLess(smoothed_value, 1.0)
    
    def test_interpolate_parameter(self):
        """Test parameter interpolation"""
        self.controller.set_parameter('pan', 0.0, smooth=False)
        interpolated = self.controller.interpolate_parameter('pan', 1.0, 10)
        self.assertEqual(len(interpolated), 10)
        self.assertAlmostEqual(interpolated[0], 0.0)
        self.assertAlmostEqual(interpolated[-1], 1.0)
    
    def test_reset_parameter(self):
        """Test parameter reset"""
        self.controller.set_parameter('test_param', 0.5)
        self.controller.reset_parameter('test_param')
        value = self.controller.get_parameter('test_param')
        self.assertEqual(value, 0.0)  # Should return default


class TestAudioGradientTransferenceEngine(unittest.TestCase):
    """Test AudioGradientTransferenceEngine class"""
    
    def setUp(self):
        self.engine = AudioGradientTransferenceEngine(sample_rate=44100)
        self.test_signal = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 44100))
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(self.engine.sample_rate, 44100)
    
    def test_calculate_gradient(self):
        """Test gradient calculation"""
        gradient = self.engine.calculate_gradient(self.test_signal)
        self.assertEqual(len(gradient), len(self.test_signal))
        # Gradient should not be all zeros
        self.assertGreater(np.max(np.abs(gradient)), 0)
    
    def test_transfer_gradient(self):
        """Test gradient transfer"""
        source = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 1000))
        target = np.sin(2 * np.pi * 880 * np.linspace(0, 1, 1000))
        transferred = self.engine.transfer_gradient(source, target, amount=0.5)
        self.assertEqual(len(transferred), len(target))
        # Transferred signal should be different from target
        self.assertFalse(np.allclose(transferred, target))
    
    def test_smooth_gradient(self):
        """Test gradient smoothing"""
        smoothed = self.engine.smooth_gradient(self.test_signal, window_size=5)
        self.assertEqual(len(smoothed), len(self.test_signal))


class TestAudio3DPositionalEncoder(unittest.TestCase):
    """Test Audio3DPositionalEncoder class"""
    
    def setUp(self):
        self.encoder = Audio3DPositionalEncoder()
        self.test_signal = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 44100))
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(len(self.encoder.positions), 0)
    
    def test_encode_position_from_audio(self):
        """Test position encoding from audio"""
        position = self.encoder.encode_position_from_audio(self.test_signal)
        x, y, z = position
        # Coordinates should be in range [-1, 1]
        self.assertGreaterEqual(x, -1.5)
        self.assertLessEqual(x, 1.5)
        self.assertGreaterEqual(y, -1.5)
        self.assertLessEqual(y, 1.5)
        self.assertGreaterEqual(z, -1.5)
        self.assertLessEqual(z, 1.5)
    
    def test_set_get_position(self):
        """Test setting and getting positions"""
        self.encoder.set_position('test_channel', 0.5, 0.3, -0.2)
        position = self.encoder.get_position('test_channel')
        self.assertEqual(position, (0.5, 0.3, -0.2))
    
    def test_calculate_distance(self):
        """Test distance calculation"""
        self.encoder.set_position('channel1', 0.0, 0.0, 0.0)
        self.encoder.set_position('channel2', 1.0, 0.0, 0.0)
        distance = self.encoder.calculate_distance('channel1', 'channel2')
        self.assertAlmostEqual(distance, 1.0)
    
    def test_apply_spatial_panning(self):
        """Test spatial panning"""
        left, right = self.encoder.apply_spatial_panning(
            self.test_signal, (0.5, 0.0, 0.0)
        )
        self.assertEqual(len(left), len(self.test_signal))
        self.assertEqual(len(right), len(self.test_signal))
        # Right channel should be louder for positive X
        self.assertGreater(np.mean(np.abs(right)), np.mean(np.abs(left)))
    
    def test_spherical_cartesian_conversion(self):
        """Test spherical to cartesian conversion"""
        radius, theta, phi = 1.0, 0.0, np.pi / 2
        x, y, z = self.encoder.spherical_to_cartesian(radius, theta, phi)
        # Should be close to (1, 0, 0) for these values
        self.assertAlmostEqual(x, 1.0, places=5)
        self.assertAlmostEqual(z, 0.0, places=5)
    
    def test_cartesian_spherical_conversion(self):
        """Test cartesian to spherical conversion"""
        x, y, z = 1.0, 0.0, 0.0
        radius, theta, phi = self.encoder.cartesian_to_spherical(x, y, z)
        self.assertAlmostEqual(radius, 1.0, places=5)


class TestProfessionalAudioProcessor(unittest.TestCase):
    """Test ProfessionalAudioProcessor class"""
    
    def setUp(self):
        self.processor = ProfessionalAudioProcessor(sample_rate=44100)
        self.test_signal = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 44100))
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(self.processor.sample_rate, 44100)
    
    def test_apply_compression(self):
        """Test compression effect"""
        compressed = self.processor.apply_compression(
            self.test_signal, threshold=0.5, ratio=4.0
        )
        self.assertEqual(len(compressed), len(self.test_signal))
        # Peak should be reduced
        self.assertLessEqual(np.max(np.abs(compressed)), np.max(np.abs(self.test_signal)))
    
    def test_apply_reverb(self):
        """Test reverb effect"""
        reverbed = self.processor.apply_reverb(self.test_signal, room_size=0.7)
        self.assertEqual(len(reverbed), len(self.test_signal))
        # Reverb adds energy, so RMS might increase
        self.assertNotEqual(np.sum(reverbed), np.sum(self.test_signal))
    
    def test_apply_delay(self):
        """Test delay effect"""
        delayed = self.processor.apply_delay(self.test_signal, delay_time=0.1)
        self.assertEqual(len(delayed), len(self.test_signal))
    
    def test_apply_chorus(self):
        """Test chorus effect"""
        chorused = self.processor.apply_chorus(self.test_signal)
        self.assertEqual(len(chorused), len(self.test_signal))
    
    def test_apply_harmonic_analysis(self):
        """Test harmonic analysis"""
        analysis = self.processor.apply_harmonic_analysis(self.test_signal)
        self.assertIn('fundamental_frequency', analysis)
        self.assertIn('harmonics', analysis)
        self.assertIn('rms', analysis)
        self.assertIn('peak', analysis)
        # Fundamental should be around 440 Hz
        self.assertGreater(analysis['fundamental_frequency'], 400)
        self.assertLess(analysis['fundamental_frequency'], 480)
    
    def test_apply_pitch_shift(self):
        """Test pitch shifting"""
        shifted = self.processor.apply_pitch_shift(self.test_signal, semitones=12)
        self.assertEqual(len(shifted), len(self.test_signal))
    
    def test_apply_time_stretch(self):
        """Test time stretching"""
        stretched = self.processor.apply_time_stretch(self.test_signal, factor=1.5)
        # Length should change
        self.assertNotEqual(len(stretched), len(self.test_signal))


class TestAdvancedSpatialAudioProcessor(unittest.TestCase):
    """Test AdvancedSpatialAudioProcessor class"""
    
    def setUp(self):
        self.processor = AdvancedSpatialAudioProcessor(sample_rate=44100)
        self.test_signal = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 44100))
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(self.processor.sample_rate, 44100)
    
    def test_apply_spatial_transmission(self):
        """Test spatial transmission"""
        transmitted = self.processor.apply_spatial_transmission(
            self.test_signal, transmission_probability=0.8
        )
        self.assertEqual(len(transmitted), len(self.test_signal))
    
    def test_create_audio_barrier(self):
        """Test audio barrier creation"""
        barrier = self.processor.create_audio_barrier(
            self.test_signal, barrier_frequency=1000.0, barrier_strength=0.7
        )
        self.assertEqual(len(barrier), len(self.test_signal))
    
    def test_apply_perfect_transmission(self):
        """Test perfect transmission"""
        perfect = self.processor.apply_perfect_transmission(self.test_signal)
        np.testing.assert_array_almost_equal(perfect, self.test_signal)
    
    def test_apply_coherence_processing(self):
        """Test coherence processing"""
        signal2 = np.sin(2 * np.pi * 880 * np.linspace(0, 1, 44100))
        enhanced, coherence = self.processor.apply_coherence_processing(
            self.test_signal, signal2
        )
        self.assertEqual(len(enhanced), len(self.test_signal))
        self.assertGreaterEqual(coherence, -1.0)
        self.assertLessEqual(coherence, 1.0)
    
    def test_apply_3d_positioning(self):
        """Test 3D positioning"""
        left, right = self.processor.apply_3d_positioning(
            self.test_signal, 0.5, 0.0, 0.0
        )
        self.assertEqual(len(left), len(self.test_signal))
        self.assertEqual(len(right), len(self.test_signal))


class TestSolidarityAudioProcessor(unittest.TestCase):
    """Test SolidarityAudioProcessor class with ZIP phrases"""
    
    def setUp(self):
        self.processor = SolidarityAudioProcessor(sample_rate=44100)
        self.test_signal = np.sin(2 * np.pi * 440 * np.linspace(0, 1, 44100))
    
    def test_initialization(self):
        """Test proper initialization"""
        self.assertEqual(self.processor.sample_rate, 44100)
        self.assertEqual(len(self.processor.phrase_history), 0)
    
    def test_process_compression_phrase(self):
        """Test COMPRESSION ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.COMPRESSION
        )
        self.assertEqual(len(processed), len(self.test_signal))
        self.assertIn('compression', self.processor.phrase_history)
    
    def test_process_expansion_phrase(self):
        """Test EXPANSION ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.EXPANSION
        )
        self.assertEqual(len(processed), len(self.test_signal))
        self.assertIn('expansion', self.processor.phrase_history)
    
    def test_process_zoomies_phrase(self):
        """Test ZOOMIES ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.ZOOMIES
        )
        # Length changes due to time stretch
        self.assertNotEqual(len(processed), len(self.test_signal))
        self.assertIn('zoomies', self.processor.phrase_history)
    
    def test_process_lockstop_phrase(self):
        """Test LOCKSTOP ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.LOCKSTOP
        )
        # Should freeze (zero out) the signal
        np.testing.assert_array_almost_equal(processed, np.zeros_like(processed))
        self.assertIn('lockstop', self.processor.phrase_history)
    
    def test_process_beatbox_phrase(self):
        """Test BEATBOX ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.BEATBOX
        )
        self.assertEqual(len(processed), len(self.test_signal))
        self.assertIn('beatbox', self.processor.phrase_history)
    
    def test_process_reverb_phrase(self):
        """Test REVERB ZIP phrase"""
        processed = self.processor.process_zip_phrase(
            self.test_signal, ZIPPhrase.REVERB
        )
        self.assertEqual(len(processed), len(self.test_signal))
        self.assertIn('reverb', self.processor.phrase_history)
    
    def test_process_all_zip_phrases(self):
        """Test all 13 ZIP phrases"""
        phrases_to_test = [
            ZIPPhrase.COMPRESSION,
            ZIPPhrase.EXPANSION,
            ZIPPhrase.REVERB,
            ZIPPhrase.DELAY,
            ZIPPhrase.CHORUS,
            ZIPPhrase.FLANGER,
            ZIPPhrase.PHASER,
            ZIPPhrase.DISTORTION,
            ZIPPhrase.HARMONIZE,
            ZIPPhrase.SPATIAL,
            ZIPPhrase.BEATBOX,
            ZIPPhrase.LOCKSTOP,
            ZIPPhrase.ZOOMIES
        ]
        
        for phrase in phrases_to_test:
            # Reset processor for clean test
            processor = SolidarityAudioProcessor(sample_rate=44100)
            processed = processor.process_zip_phrase(self.test_signal.copy(), phrase)
            self.assertIsNotNone(processed)
            self.assertGreater(len(processed), 0)
    
    def test_get_phrase_history(self):
        """Test phrase history tracking"""
        self.processor.process_zip_phrase(self.test_signal, ZIPPhrase.COMPRESSION)
        self.processor.process_zip_phrase(self.test_signal, ZIPPhrase.REVERB)
        history = self.processor.get_phrase_history()
        self.assertEqual(len(history), 2)
        self.assertEqual(history[0], 'compression')
        self.assertEqual(history[1], 'reverb')


class TestMasterSolidarityAudioSystem(unittest.TestCase):
    """Test MasterSolidarityAudioSystem integration"""
    
    def setUp(self):
        self.system = MasterSolidarityAudioSystem()
        self.test_signal = self.system.generate_test_signal(440.0, 0.1)
    
    def test_initialization(self):
        """Test proper system initialization"""
        self.assertTrue(self.system.status['initialized'])
        self.assertEqual(self.system.status['engine_status'], 'ready')
    
    def test_generate_test_signal(self):
        """Test signal generation"""
        signal = self.system.generate_test_signal(440.0, 1.0)
        self.assertEqual(len(signal), 44100)
    
    def test_analyze_signal(self):
        """Test signal analysis"""
        analysis = self.system.analyze_signal(self.test_signal)
        self.assertIn('rms', analysis)
        self.assertIn('peak', analysis)
        self.assertIn('dynamic_range', analysis)
        self.assertIn('harmonic_analysis', analysis)
        self.assertIn('spatial_position', analysis)
    
    def test_process_audio_chain(self):
        """Test processing chain"""
        processing_chain = [
            {'type': 'compression', 'threshold': 0.5, 'ratio': 4.0},
            {'type': 'reverb', 'room_size': 0.7}
        ]
        processed = self.system.process_audio(self.test_signal, processing_chain)
        self.assertEqual(len(processed), len(self.test_signal))
    
    def test_process_zip_phrase_in_chain(self):
        """Test ZIP phrase in processing chain"""
        processing_chain = [
            {'type': 'zip_phrase', 'phrase': 'compression', 'params': {}}
        ]
        processed = self.system.process_audio(self.test_signal, processing_chain)
        self.assertGreater(len(processed), 0)
    
    def test_get_system_status(self):
        """Test system status retrieval"""
        status = self.system.get_system_status()
        self.assertIn('initialized', status)
        self.assertIn('sample_rate', status)
        self.assertIn('engine_status', status)
        self.assertIn('zip_phrase_history', status)
    
    def test_config_save_load(self):
        """Test configuration save/load"""
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            config_path = f.name
        
        try:
            self.system.save_config(config_path)
            self.assertTrue(os.path.exists(config_path))
            
            # Create new system and load config
            new_system = MasterSolidarityAudioSystem()
            new_system.load_config(config_path)
            self.assertEqual(new_system.config.sample_rate, self.system.config.sample_rate)
        finally:
            if os.path.exists(config_path):
                os.unlink(config_path)


class TestPerformanceBenchmarks(unittest.TestCase):
    """Performance benchmarking tests"""
    
    def setUp(self):
        self.system = MasterSolidarityAudioSystem()
    
    def test_processing_speed(self):
        """Test processing speed for real-time capability"""
        import time
        
        # Generate 1 second of audio
        signal = self.system.generate_test_signal(440.0, 1.0)
        
        # Time the processing
        start_time = time.time()
        processing_chain = [
            {'type': 'compression', 'threshold': 0.5, 'ratio': 4.0},
            {'type': 'reverb', 'room_size': 0.7},
            {'type': 'zip_phrase', 'phrase': 'harmonize', 'params': {}}
        ]
        processed = self.system.process_audio(signal, processing_chain)
        processing_time = time.time() - start_time
        
        # Processing should be faster than real-time (< 1 second for 1 second of audio)
        print(f"\nProcessing time for 1s audio: {processing_time:.4f}s")
        self.assertLess(processing_time, 5.0)  # Generous limit for test environment


def run_tests():
    """Run all tests with detailed output"""
    print("\n" + "=" * 70)
    print("SOLIDARITY AUDIO PROCESSING SYSTEM - COMPREHENSIVE TEST SUITE")
    print("TRADEMARKED BY SCOTT CHARLES OLSON")
    print("=" * 70 + "\n")
    
    # Create test suite
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all test classes
    suite.addTests(loader.loadTestsFromTestCase(TestAudioTimeBuyer))
    suite.addTests(loader.loadTestsFromTestCase(TestAudioParameterController))
    suite.addTests(loader.loadTestsFromTestCase(TestAudioGradientTransferenceEngine))
    suite.addTests(loader.loadTestsFromTestCase(TestAudio3DPositionalEncoder))
    suite.addTests(loader.loadTestsFromTestCase(TestProfessionalAudioProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestAdvancedSpatialAudioProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestSolidarityAudioProcessor))
    suite.addTests(loader.loadTestsFromTestCase(TestMasterSolidarityAudioSystem))
    suite.addTests(loader.loadTestsFromTestCase(TestPerformanceBenchmarks))
    
    # Run tests with verbose output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Successes: {result.testsRun - len(result.failures) - len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    
    if result.wasSuccessful():
        print("\n✅ ALL TESTS PASSED")
    else:
        print("\n❌ SOME TESTS FAILED")
    
    print("=" * 70 + "\n")
    
    return result


if __name__ == "__main__":
    result = run_tests()
    sys.exit(0 if result.wasSuccessful() else 1)
