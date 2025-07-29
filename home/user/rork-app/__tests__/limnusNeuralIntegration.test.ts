import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useLimnusStore } from '@/store/limnusStore';
import { InterpretationService } from '@/services/interpretationService';
import { personas } from '@/constants/personas';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock the API call
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      completion: `DREAM_NAME: Golden Spiral Flight

DREAM_TYPE: lucid

BLOCKCHAIN_ALIGNMENT: none

INTERPRETATION: This dream's neural signature resonates at 87% with your previous "Floating Through Light" dream from last week. The cortical activation pattern suggests heightened awareness and lucidity. The spiral imagery connects to your recent breath practice sessions, particularly the deep resonance patterns you've been developing. This represents a continuation of your consciousness evolution, building on established neural pathways while exploring new dimensions of awareness.`
    }),
  })
) as jest.Mock;

describe('Limnus Neural Sigil Integration', () => {
  beforeEach(() => {
    // Reset stores
    useDreamStore.getState().dreams = [];
    useNeuralSigilStore.getState().neuralSigils = [];
    useLimnusStore.getState().sessions = [];
  });

  test('Limnus references neural sigils in dream interpretation', async () => {
    // 1. Create past dreams with sigils
    const dreamStore = useDreamStore.getState();
    const neuralSigilStore = useNeuralSigilStore.getState();
    
    // Add a past dream
    const pastDream = await dreamStore.addDream({
      title: "Floating Through Light",
      content: "I was floating through a golden vortex of spiraling light, feeling completely aware and in control",
      dreamType: 'lucid',
      persona: 'limnus',
      lucidity: 0.9,
      emotionalIntensity: 0.8
    });
    
    // Generate sigil for past dream
    await dreamStore.generateDreamSigil(pastDream.id);
    
    // 2. Create meditation session with sigil
    const limnusStore = useLimnusStore.getState();
    limnusStore.startSession();
    
    // Simulate session completion
    const currentSession = limnusStore.currentSession;
    if (currentSession) {
      limnusStore.addBreathCycle(currentSession.id, {
        nodeSymbol: '∞',
        depth: 7,
        resonance: 0.85,
        timestamp: Date.now(),
        consciousnessScore: 0.8
      });
      limnusStore.endSession(currentSession.id);
    }
    
    // 3. Interpret new similar dream
    const limnusPersona = personas.find(p => p.id === 'limnus')!;
    const interpretation = await InterpretationService.interpretDream(
      "I was floating in a golden vortex of light, completely lucid and aware",
      limnusPersona,
      limnusStore.sessions,
      [], // blockchain blocks
      [], // signature history
      [] // breath cycle logs
    );
    
    // 4. Verify Limnus references the neural patterns
    expect(interpretation.interpretation).toContain('neural');
    expect(interpretation.interpretation).toContain('resonates');
    expect(interpretation.interpretation).toContain('87%');
    expect(interpretation.interpretation).toContain('Floating Through Light');
    expect(interpretation.interpretation).toContain('cortical');
    expect(interpretation.interpretation).toContain('consciousness evolution');
    
    // Verify dream classification
    expect(interpretation.dreamType).toBe('lucid');
    expect(interpretation.name).toBe('Golden Spiral Flight');
  });

  test('Neural sigil store generates and finds similar patterns', async () => {
    const neuralSigilStore = useNeuralSigilStore.getState();
    
    // Initialize the neural system
    await neuralSigilStore.initializeNeuralSystem();
    
    // Generate sigils for similar content
    const sigil1 = await neuralSigilStore.generateNeuralSigil(
      "Flying through golden light with complete awareness",
      'dream'
    );
    
    const sigil2 = await neuralSigilStore.generateNeuralSigil(
      "Floating in bright golden energy, feeling lucid",
      'dream'
    );
    
    // Find similar sigils
    const similarSigils = await neuralSigilStore.findSimilarBySigil(sigil1.id, 0.5);
    
    // Should find the similar sigil
    expect(similarSigils.length).toBeGreaterThan(0);
    expect(similarSigils[0].sigil.id).toBe(sigil2.id);
    expect(similarSigils[0].similarity).toBeGreaterThan(0.5);
  });

  test('Dream store reverse mapping works correctly', async () => {
    const dreamStore = useDreamStore.getState();
    
    // Add a dream
    const dream = await dreamStore.addDream({
      title: "Test Dream",
      content: "A test dream for sigil mapping",
      dreamType: 'psychic'
    });
    
    // Generate sigil
    const sigil = await dreamStore.generateDreamSigil(dream.id);
    
    // Test reverse mapping
    const foundDream = dreamStore.getDreamBySigilId(sigil.id);
    expect(foundDream).toBeDefined();
    expect(foundDream?.id).toBe(dream.id);
    expect(foundDream?.title).toBe("Test Dream");
  });

  test('Pattern analysis provides meaningful insights', async () => {
    const dreamStore = useDreamStore.getState();
    
    // Create multiple related dreams
    const dreams = await Promise.all([
      dreamStore.addDream({
        title: "Water Dream 1",
        content: "Swimming in deep blue ocean water",
        dreamType: 'psychic',
        emotionalIntensity: 0.7
      }),
      dreamStore.addDream({
        title: "Water Dream 2", 
        content: "Floating on calm lake water",
        dreamType: 'psychic',
        emotionalIntensity: 0.5
      }),
      dreamStore.addDream({
        title: "Fire Dream",
        content: "Dancing flames and burning light",
        dreamType: 'lucid',
        emotionalIntensity: 0.9
      })
    ]);
    
    // Generate sigils for all dreams
    await Promise.all(dreams.map(dream => dreamStore.generateDreamSigil(dream.id)));
    
    // Analyze patterns for water dream
    const analysis = await dreamStore.analyzeDreamPatterns(dreams[0].id);
    
    expect(analysis).toBeDefined();
    expect(analysis.relatedDreams).toBeDefined();
    expect(analysis.dominantBrainRegion).toBeDefined();
    expect(analysis.sigilStrength).toBeGreaterThan(0);
  });

  test('Breath phase correlation works in neural sigils', async () => {
    const neuralSigilStore = useNeuralSigilStore.getState();
    
    // Initialize system
    await neuralSigilStore.initializeNeuralSystem();
    
    // Generate sigil from breath phase
    const breathSigil = await neuralSigilStore.generateFromBreathPhase('inhale-hold', 'breath');
    
    expect(breathSigil).toBeDefined();
    expect(breathSigil.sourceType).toBe('breath');
    expect(breathSigil.metadata?.breathPhase).toBe('inhale-hold');
  });
});