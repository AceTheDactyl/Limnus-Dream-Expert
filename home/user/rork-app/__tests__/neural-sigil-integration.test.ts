import { SigilGenerator } from '@/models/neural-sigil/sigilGenerator';
import { PatternRecognizer } from '@/models/neural-sigil/patternRecognition';
import { ConsciousnessEncoder } from '@/models/neural-sigil/consciousnessEncoder';
import { SigilBraider } from '@/blockchain/SigilBraider';

describe('Neural Sigil Integration Tests', () => {
  let generator: SigilGenerator;
  let recognizer: PatternRecognizer;
  let encoder: ConsciousnessEncoder;
  let braider: SigilBraider;

  beforeAll(() => {
    generator = SigilGenerator.getInstance();
    recognizer = new PatternRecognizer();
    encoder = new ConsciousnessEncoder();
    braider = new SigilBraider();
  });

  describe('SigilGenerator', () => {
    it('should be a singleton', () => {
      const g2 = SigilGenerator.getInstance();
      expect(generator).toBe(g2);
    });

    it('generates deterministic sigils for same input', () => {
      const text = 'A vivid dream of cosmic spirals';
      const s1 = generator.generateFromText(text, 'dream');
      const s2 = generator.generateFromText(text, 'dream');
      
      expect(s1.hash).toBe(s2.hash);
      expect(s1.pattern).toEqual(s2.pattern);
      expect(s1.brainRegion).toBe(s2.brainRegion);
    });

    it('generates different sigils for different inputs', () => {
      const s1 = generator.generateFromText('Dream A', 'dream');
      const s2 = generator.generateFromText('Dream B', 'dream');
      
      expect(s1.hash).not.toBe(s2.hash);
      expect(s1.pattern).not.toEqual(s2.pattern);
    });

    it('calculates similarity correctly', () => {
      const identical = generator.generateFromText('test', 'dream');
      const similar = generator.generateFromText('test', 'dream');
      const different = generator.generateFromText('completely different', 'dream');
      
      expect(generator.calculateSimilarity(identical, similar)).toBe(1);
      expect(generator.calculateSimilarity(identical, different)).toBeLessThan(0.5);
    });

    it('generates 64-dimensional patterns', () => {
      const sigil = generator.generateFromText('test', 'dream');
      expect(sigil.pattern.length).toBe(64);
    });
  });

  describe('ConsciousnessEncoder', () => {
    it('encodes consciousness snapshots to 64 dimensions', () => {
      const snapshot = {
        timestamp: Date.now(),
        biometrics: {
          heartRate: 72,
          brainwaves: { alpha: 0.3, beta: 0.4, theta: 0.2, delta: 0.1 },
          breathingRate: 16,
          skinConductance: 0.5
        },
        emotional: {
          hue: 'peace',
          intensity: 0.7,
          polarity: 0.8,
          emoji: '🕊️'
        },
        coherence: 0.85,
        depth: 3
      };
      
      const encoded = encoder.encodeSnapshot(snapshot);
      expect(encoded.length).toBe(64);
      expect(encoded.every(v => typeof v === 'number')).toBe(true);
    });

    it('can partially decode vectors', () => {
      const vector = new Array(64).fill(0).map(() => Math.random());
      const decoded = encoder.decodeVector(vector);
      
      expect(decoded.biometrics).toBeDefined();
      expect(decoded.coherence).toBeDefined();
      expect(decoded.depth).toBeDefined();
    });
  });

  describe('SigilBraider', () => {
    it('finds temporal patterns in sequential sigils', () => {
      const sigils = [
        generator.generateFromText('Dream 1', 'dream'),
        generator.generateFromText('Dream 2', 'dream'),
        generator.generateFromText('Dream 3', 'dream')
      ];
      
      // Set timestamps to be 1 minute apart
      sigils[0].timestamp = Date.now() - 120000;
      sigils[1].timestamp = Date.now() - 60000;
      sigils[2].timestamp = Date.now();
      
      const patterns = braider.analyzeBraidPattern(sigils);
      const temporalPatterns = patterns.filter(p => p.type === 'temporal');
      
      expect(temporalPatterns.length).toBeGreaterThan(0);
      expect(temporalPatterns[0].participants.length).toBe(2);
    });

    it('finds resonant patterns in similar sigils', () => {
      const sigils = [
        generator.generateFromText('cosmic dream', 'dream'),
        generator.generateFromText('cosmic dream', 'dream'),
        generator.generateFromText('different content', 'dream')
      ];
      
      const patterns = braider.analyzeBraidPattern(sigils);
      const resonantPatterns = patterns.filter(p => p.type === 'resonant');
      
      expect(resonantPatterns.length).toBeGreaterThan(0);
      expect(resonantPatterns[0].strength).toBe(1);
    });
  });

  describe('Integration Flow', () => {
    it('completes full dream-to-pattern flow', async () => {
      // 1. Generate dream sigil
      const dreamText = 'Flying through spiral galaxies';
      const dreamSigil = generator.generateFromText(dreamText, 'dream');
      
      // 2. Simulate consciousness state
      const snapshot = {
        timestamp: Date.now(),
        biometrics: {
          heartRate: 65,
          brainwaves: { alpha: 0.6, beta: 0.2, theta: 0.15, delta: 0.05 },
          breathingRate: 12,
          skinConductance: 0.4
        },
        emotional: { hue: 'peace', intensity: 0.8, polarity: 0.9, emoji: '🌌' },
        coherence: 0.9,
        depth: 5
      };
      
      // 3. Encode consciousness
      const encodedState = encoder.encodeSnapshot(snapshot);
      expect(encodedState.length).toBe(64);
      
      // 4. Create meditation sigil
      const meditationSigil = generator.generateFromText(
        `Meditation - coherence: ${snapshot.coherence}`,
        'meditation'
      );
      
      // 5. Check similarity
      const similarity = generator.calculateSimilarity(dreamSigil, meditationSigil);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
      
      // 6. Find braid patterns
      const patterns = braider.analyzeBraidPattern([dreamSigil, meditationSigil]);
      expect(patterns.length).toBeGreaterThan(0);
    });
  });
});