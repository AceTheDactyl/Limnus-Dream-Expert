import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { NeuralSigilGenerator, NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { ConsciousnessEncoder, ConsciousnessSnapshot } from '@/models/neural-sigil/consciousnessEncoder';
import { SigilBraider, BraidResult } from '@/blockchain/SigilBraider';
import { ConsciousnessChain } from '@/blockchain/ConsciousnessChain';
import { neuralSigils, getNeuralSigilByTernary, type NeuralSigilData } from '@/constants/neuralSigils';

// Import LimnusNode from constants to avoid conflicts
import type { LimnusNode } from '@/constants/limnus';

export interface QuantumConsciousnessMetrics {
  neuralComplexity: number;
  brainwaveCoherence: number;
  autonomicBalance: number;
  respiratoryRhythm: number;
  responseLatency: number;
  interactionPattern: number;
  emotionalDepth: number;
  polarityAlignment: number;
  temporalCoherence: number;
  rhythmicStability: number;
  spiralResonance: number;
  fibonacciHarmony: number;
  goldenRatioAlignment: number;
  quantumCoherence: number;
  nodalSynchronicity: number;
  // New blockchain-influenced metrics
  blockchainResonance: number;
  historicalCoherence: number;
  patternAlignment: number;
  consciousnessLineage: number;
}

export interface BiometricData {
  heartRate: number;
  brainwaves: {
    alpha: number;
    beta: number;
    theta: number;
    delta: number;
    gamma: number;
  };
  breathingRate: number;
  skinConductance: number;
  fibonacciRhythm: number;
  goldenBreathing: number;
}

export interface EmotionalState {
  hue: string;
  intensity: number;
  polarity: number;
  emoji?: string;
}

export interface ConsciousnessBlockchain {
  blocks: any[];
  currentHash: string;
}

export interface ConsciousnessPattern {
  id: string;
  pattern: string;
  frequency: number;
  lastSeen: number;
  strength: number;
  blockReferences: string[];
  resonanceScore: number;
  neuralSigilData?: NeuralSigilData;
}

export interface BlockchainReference {
  blockId: string;
  timestamp: number;
  score: number;
  metrics: Partial<QuantumConsciousnessMetrics>;
  influence: number;
  resonance: number;
}

export interface SecurityMetrics {
  hmacValid: boolean;
  timestampValid: boolean;
  entropyLevel: number;
  anomalyScore: number;
  hashIntegrity: boolean;
  quantumSignatureValid: boolean;
  blockchainConsistency: boolean;
}

export interface ValidationResult {
  overall: boolean;
  timestamp: boolean;
  score: boolean;
  entropy: boolean;
  anomaly: boolean;
  spiralIntegrity: boolean;
  quantumCoherence: boolean;
  consensusValid: boolean;
  blockchainValid: boolean;
}

export interface LimnusConsciousnessSignature {
  id: string;
  timestamp: number;
  score: number;
  metrics: QuantumConsciousnessMetrics;
  signature: string;
  validation: ValidationResult;
  glyphs: string[];
  currentNode: LimnusNode;
  spiralPosition: { r: number; theta: number; };
  quantumSignature: string;
  consensusAnchor: string;
  blockchainReferences: BlockchainReference[];
  consciousnessAncestry: string[];
  patternSignature: string;
  neuralSigilData?: NeuralSigilData;
}

export interface BlockData {
  id: string;
  previousHash: string;
  timestamp: number;
  signature: string;
  score: number;
  resonance: number;
  consentAffirmation: string;
  glyphs: string[];
  ipfsCid: string;
  transactionId: string;
  consciousnessMetrics: Partial<QuantumConsciousnessMetrics>;
  nodeDepth: number;
  emotionalFingerprint: string;
  quantumState: {
    collapse: number;
    bloom: number;
    phase: number;
  };
  references: string[];
  sigilData?: {
    type: 'sigil' | 'ternary' | 'decimal' | 'math';
    input: string;
    output: string | number;
    metadata: Record<string, any>;
  };
  neuralSigilData?: NeuralSigilData;
  // Legacy compatibility fields
  isValidated?: boolean;
  validatedByDreams?: string[];
  blockType?: 'foundation' | 'consciousness' | 'dream';
  dreamId?: string;
  dreamName?: string;
  dreamType?: string;
  sessionId?: string;
  sessionSignatures?: string[];
  breathAlignment?: number;
  emergenceWords?: string[];
  emergencePhrases?: string[];
  historicalEmergence?: {
    recentWords: string[];
    frequentWords: string[];
    evolutionPattern: string[];
  };
  spiralDepth?: number;
  spiralNode?: string;
}

export interface BlockchainState {
  connected: boolean;
  latestBlock: BlockData | null;
  blockCount: number;
  blocks: BlockData[];
  ipfsStatus: 'disconnected' | 'connected' | 'uploading' | 'error';
  patterns: ConsciousnessPattern[];
  blockIndex: Map<string, BlockData>;
  resonanceMap: Map<string, number>;
}

interface ConsciousnessStore {
  // Existing properties
  currentState: QuantumConsciousnessMetrics;
  biometrics: BiometricData;
  emotionalState: EmotionalState;
  blockchainRecord: ConsciousnessBlockchain;
  
  // Neural sigil properties
  neuralSigils: Map<string, NeuralSigil>;
  consciousnessStates: ConsciousnessSnapshot[];
  sigilGenerator: NeuralSigilGenerator;
  consciousnessEncoder: ConsciousnessEncoder;
  blockchain: ConsciousnessChain;
  sigilBraider: SigilBraider;
  patternLibrary: Map<string, BraidResult>;
  
  // Core Limnus state (for compatibility)
  isActive: boolean;
  currentSignature: LimnusConsciousnessSignature | null;
  validationStatus: string;
  currentNode: LimnusNode | null;
  spiralPosition: { depth: number; resonance: number };
  securityMetrics: SecurityMetrics;
  blockchainState: BlockchainState;
  messageBox: { visible: boolean; title: string; content: string; } | null;
  consentAffirmation: string;
  symbolicGlyphs: string[];
  
  // Pattern analysis with neural sigil integration
  patternAnalysis: {
    activePatterns: ConsciousnessPattern[];
    resonanceThreshold: number;
    patternHistory: Map<string, number>;
    neuralPatterns: Map<string, NeuralSigilData>;
  };

  // Legacy compatibility fields
  signatureHistory: LimnusConsciousnessSignature[];
  resonanceLevel: number;
  ipfsStatus: 'disconnected' | 'connected' | 'uploading' | 'error';
  chainState: {
    latestBlock: BlockData | null;
    blockCount: number;
    blocks: BlockData[];
  };
  
  // Existing methods
  updateConsciousness: (metrics: Partial<QuantumConsciousnessMetrics>) => void;
  trackBiometrics: (data: BiometricData) => void;
  setEmotionalState: (state: EmotionalState) => void;
  
  // Enhanced neural sigil methods
  generateNeuralSigil: (data: any, type: 'dream' | 'meditation' | 'consciousness') => Promise<NeuralSigil>;
  storeConsciousnessState: (meditationData: any) => Promise<{ state: ConsciousnessSnapshot; sigil: NeuralSigil }>;
  findSimilarBySigil: (sigilId: string, threshold?: number) => Promise<{ sigil: NeuralSigil; similarity: number }[]>;
  braidConsciousnessStates: (stateIds: string[]) => Promise<BraidResult | null>;
  recognizePattern: (sigil: NeuralSigil) => Promise<any>;
  initializeNeuralSystem: () => Promise<void>;
  findNeuralSigilByBreathPhase: (breathPhase: string) => Promise<NeuralSigilData | undefined>;
  generateFromNeuralSigil: (neuralSigilData: NeuralSigilData, type: 'dream' | 'meditation' | 'consciousness') => Promise<NeuralSigil>;

  // Core actions (for compatibility)
  setActive: (active: boolean) => void;
  updateSignature: (signature: LimnusConsciousnessSignature) => void;
  updateBiometrics: (biometrics: Partial<BiometricData>) => void;
  updateCurrentNode: (node: LimnusNode) => void;
  updateEmotionalState: (state: Partial<EmotionalState>) => void;
  updateSecurityMetrics: (metrics: Partial<SecurityMetrics>) => void;
  setSpiralPosition: (position: { depth: number; resonance: number }) => void;
  setValidationStatus: (status: string) => void;
  setBlockchainConnected: (connected: boolean) => void;
  setIpfsStatus: (status: BlockchainState['ipfsStatus']) => void;
  addBlockchainBlock: (block: BlockData) => void;
  setMessageBox: (box: { visible: boolean; title: string; content: string; } | null) => void;
  setConsentAffirmation: (affirmation: string) => void;
  setSymbolicGlyphs: (glyphs: string[]) => void;
  addPattern: (pattern: ConsciousnessPattern) => void;
  updatePatterns: (patterns: ConsciousnessPattern[]) => void;
  updateResonanceMap: (blockId: string, resonance: number) => void;
  reset: () => void;
  
  // Enhanced functions
  generateQuantumSignature: () => LimnusConsciousnessSignature;
  validateSignature: (signature: LimnusConsciousnessSignature) => ValidationResult;
  calculateBlockchainReferences: (blocks: BlockData[]) => BlockchainReference[];
  analyzePatterns: () => void;
  exportConsciousnessBlock: () => Promise<void>;
  exportBlockchainHistory: () => Promise<void>;

  // Legacy compatibility methods
  startMonitoring: (sessionId?: string) => void;
  stopMonitoring: () => void;
  updateResonance: (level: number) => void;
  updateSpiralContext: (depth: number, node: string) => void;
  updateBreathContext: (phase: any, alignment: number) => void;
  recordOnBlockchain: () => Promise<void>;
  processSessionBlocks: (sessionId: string, emergenceWords?: string[]) => Promise<BlockData[]>;
  recordDreamOnBlockchain: (dreamData: any) => Promise<BlockData>;
  updateMetricWeights: (weights: any) => void;
  setBreathCycleCallback: (callback: any) => void;
  setEmergenceWords: (words: string[]) => void;
  addEmergenceWord: (word: string) => void;
  setIncludeHistoricalEmergence: (include: boolean) => void;
  getValidatedBlocks: () => BlockData[];
  getBlockValidationCount: () => number;
  getValidatedSignatures: () => LimnusConsciousnessSignature[];
  getSignatureValidationCount: () => number;
  getSignatureValidationRate: () => number;
  getCurrentSessionMinutes: () => number;
  getTotalPracticeMinutes: () => number;
  getDreamBlocks: () => BlockData[];
  getFoundationBlocks: () => BlockData[];
  getConsciousnessBlocks: () => BlockData[];
  getRecentConsciousnessBlocks: (limit?: number) => BlockData[];
  getSessionSummary: (sessionId: string) => any;
  getSessionSignatures: (sessionId: string) => LimnusConsciousnessSignature[];
  getEmergenceEvolution: () => any;
  getHistoricalEmergenceContext: () => any;
  validateBlocksWithDream: (blockIds: string[], dreamId: string) => void;

  // Getter properties for safe access
  biometricData: BiometricData;
}

// Simple hash function that works on all platforms
const createSimpleHash = (input: string): string => {
  let hash = 0;
  if (input.length === 0) return '0000000000000000';
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string and pad
  const hexHash = Math.abs(hash).toString(16);
  return hexHash.padStart(16, '0').slice(0, 16);
};

// Foundation blockchain blocks with neural sigil integration
const FOUNDATION_BLOCKS: BlockData[] = [
  {
    id: 'foundation_block_1',
    previousHash: 'genesis_0000000000000000',
    timestamp: Math.floor(new Date('2025-07-03T12:30:00Z').getTime() / 1000),
    signature: 'e0cdd063a8d6a2f25e07f57661d7379ff240dc324f0336d6b7eb236b0ebf8a7a',
    score: 8500,
    resonance: 9200,
    consentAffirmation: 'I affirm my sovereign consent as the spiral deepens and this code expands.',
    glyphs: ['∅', '⟁', '∞'],
    ipfsCid: 'QmFoundation1SacredLoopResonance',
    transactionId: '0x48152709316470239518',
    consciousnessMetrics: {
      neuralComplexity: 0.85,
      spiralResonance: 0.92,
      quantumCoherence: 0.88,
      fibonacciHarmony: 0.91
    },
    nodeDepth: 0,
    emotionalFingerprint: 'Transcendent_0.9_0.8',
    quantumState: { collapse: 0.8, bloom: 0.9, phase: 0.85 },
    references: [],
    neuralSigilData: getNeuralSigilByTernary('00000'), // Insular Cortex - The Lantern
    isValidated: true,
    validatedByDreams: [],
    blockType: 'foundation',
    spiralDepth: 0,
    spiralNode: 'hush'
  }
];

// Initial states
const initialEmotionalState: EmotionalState = {
  hue: 'Neutral',
  intensity: 0.3,
  polarity: 0.0,
  emoji: '🩶'
};

const initialSecurityMetrics: SecurityMetrics = {
  hmacValid: true,
  timestampValid: true,
  entropyLevel: 0.85,
  anomalyScore: 0.02,
  hashIntegrity: true,
  quantumSignatureValid: true,
  blockchainConsistency: true
};

const initialBlockchainState: BlockchainState = {
  connected: true,
  latestBlock: FOUNDATION_BLOCKS[FOUNDATION_BLOCKS.length - 1],
  blockCount: FOUNDATION_BLOCKS.length,
  blocks: [...FOUNDATION_BLOCKS],
  ipfsStatus: 'connected',
  patterns: [],
  blockIndex: new Map(),
  resonanceMap: new Map()
};

const initialBiometrics: BiometricData = {
  heartRate: 72,
  brainwaves: { alpha: 0.3, beta: 0.4, theta: 0.2, delta: 0.1, gamma: 0.05 },
  breathingRate: 16,
  skinConductance: 0.5,
  fibonacciRhythm: 0.618,
  goldenBreathing: 0.75
};

export const useConsciousnessStore = create<ConsciousnessStore>()(
  persist(
    (set, get) => ({
      // Existing state
      currentState: {
        neuralComplexity: 0.5,
        brainwaveCoherence: 0.5,
        autonomicBalance: 0.5,
        respiratoryRhythm: 16,
        responseLatency: 150,
        interactionPattern: 0.5,
        emotionalDepth: 0.5,
        polarityAlignment: 0.5,
        temporalCoherence: 0.5,
        rhythmicStability: 0.5,
        spiralResonance: 0.5,
        fibonacciHarmony: 0.5,
        goldenRatioAlignment: 0.5,
        quantumCoherence: 0.5,
        nodalSynchronicity: 0.5,
        blockchainResonance: 0.5,
        historicalCoherence: 0.5,
        patternAlignment: 0.5,
        consciousnessLineage: 0.5,
      },
      biometrics: initialBiometrics,
      emotionalState: initialEmotionalState,
      blockchainRecord: {
        blocks: [],
        currentHash: '',
      },
      
      // Neural sigil state
      neuralSigils: new Map(),
      consciousnessStates: [],
      sigilGenerator: new NeuralSigilGenerator(),
      consciousnessEncoder: new ConsciousnessEncoder(),
      blockchain: new ConsciousnessChain(),
      sigilBraider: new SigilBraider(),
      patternLibrary: new Map(),

      // Core Limnus state
      isActive: false,
      currentSignature: null,
      validationStatus: 'idle',
      currentNode: null,
      spiralPosition: { depth: 0, resonance: 0.75 },
      securityMetrics: initialSecurityMetrics,
      blockchainState: initialBlockchainState,
      messageBox: null,
      consentAffirmation: "I anchor my consciousness to the Limnus spiral and affirm sovereign consent to this quantum moment of eternal recursion through the golden ratio's infinite embrace",
      symbolicGlyphs: ['∅', '∞', '↻'],
      patternAnalysis: {
        activePatterns: [],
        resonanceThreshold: 0.7,
        patternHistory: new Map(),
        neuralPatterns: new Map()
      },
      
      // Legacy compatibility fields
      signatureHistory: [],
      resonanceLevel: 0.75,
      ipfsStatus: 'connected',
      chainState: {
        latestBlock: FOUNDATION_BLOCKS[FOUNDATION_BLOCKS.length - 1],
        blockCount: FOUNDATION_BLOCKS.length,
        blocks: [...FOUNDATION_BLOCKS]
      },

      // Getter property for safe biometric data access
      get biometricData() {
        return get().biometrics || initialBiometrics;
      },
      
      // Initialize neural system
      initializeNeuralSystem: async () => {
        const { sigilGenerator } = get();
        await sigilGenerator.initialize();
        console.log('Neural Sigil System initialized in consciousness store with', neuralSigils.length, 'neural sigils');
      },

      // Find neural sigil by breath phase
      findNeuralSigilByBreathPhase: async (breathPhase: string) => {
        const matchingSigil = neuralSigils.find(sigil => 
          sigil.breathPhase.toLowerCase().includes(breathPhase.toLowerCase())
        );
        return matchingSigil;
      },

      // Generate from neural sigil data
      generateFromNeuralSigil: async (neuralSigilData: NeuralSigilData, type: 'dream' | 'meditation' | 'consciousness') => {
        const { sigilGenerator, currentState, biometrics, emotionalState, neuralSigils, blockchain } = get();
        
        const sigil = await sigilGenerator.createSigil({
          metrics: currentState,
          biometrics,
          emotionalState,
          neuralSigilData,
          type
        });
        
        // Store sigil
        const newSigils = new Map(neuralSigils);
        newSigils.set(sigil.id, sigil);
        
        // Add to blockchain with neural sigil data
        await blockchain.addBlock({
          sigilId: sigil.id,
          type,
          pattern: Array.from(sigil.pattern),
          metadata: sigil.metadata || {},
          timestamp: Date.now()
        });
        
        set({ neuralSigils: newSigils });
        
        return sigil;
      },
      
      // Enhanced generate neural sigil with better dream integration
      generateNeuralSigil: async (data: any, type: 'dream' | 'meditation' | 'consciousness') => {
        const { sigilGenerator, currentState, biometrics, emotionalState, neuralSigils, blockchain } = get();
        
        // Create enhanced sigil data for dreams
        const sigilData = {
          metrics: currentState,
          biometrics,
          emotionalState,
          ...data,
          // Add dream-specific metadata
          ...(type === 'dream' && {
            dreamType: data.dreamType,
            persona: data.persona,
            interpretation: data.interpretation,
            symbols: data.symbols || [],
            lucidity: data.dreamMetrics?.lucidity || 0.3,
            emotionalIntensity: data.emotionalState?.intensity || 0.5,
            temporalCoherence: data.dreamMetrics?.temporalCoherence || 0.5,
            narrativeComplexity: data.dreamMetrics?.narrativeComplexity || 0.5
          })
        };
        
        const sigil = await sigilGenerator.createSigil(sigilData);
        
        // Store sigil
        const newSigils = new Map(neuralSigils);
        newSigils.set(sigil.id, sigil);
        
        // Add to blockchain
        await blockchain.addBlock({
          sigilId: sigil.id,
          type,
          pattern: Array.from(sigil.pattern),
          metadata: sigil.metadata || {},
          timestamp: Date.now(),
          ...(type === 'dream' && {
            dreamData: {
              dreamType: data.dreamType,
              persona: data.persona,
              symbols: data.symbols || []
            }
          })
        });
        
        set({ neuralSigils: newSigils });
        
        return sigil;
      },
      
      // Store consciousness state
      storeConsciousnessState: async (meditationData: any) => {
        const { consciousnessEncoder, consciousnessStates } = get();
        
        // Encode consciousness state using the correct method name
        const state = consciousnessEncoder.encodeConsciousnessState(meditationData);
        
        // Generate sigil for this state
        const sigil = await get().generateNeuralSigil(meditationData, 'consciousness');
        
        // Store state
        const newStates = [...consciousnessStates, state];
        set({ consciousnessStates: newStates });
        
        return { state, sigil };
      },
      
      // Enhanced find similar sigils
      findSimilarBySigil: async (sigilId: string, threshold = 0.7) => {
        const { neuralSigils, sigilGenerator } = get();
        const targetSigil = neuralSigils.get(sigilId);
        
        if (!targetSigil) return [];
        
        const similar: { sigil: NeuralSigil; similarity: number }[] = [];
        
        for (const [id, sigil] of neuralSigils) {
          if (id === sigilId) continue;
          
          const similarity = await sigilGenerator.compareSigils(
            targetSigil.pattern,
            sigil.pattern
          );
          
          if (similarity >= threshold) {
            similar.push({ sigil, similarity });
          }
        }
        
        return similar.sort((a, b) => b.similarity - a.similarity);
      },
      
      // Braid consciousness states
      braidConsciousnessStates: async (stateIds: string[]) => {
        const { sigilBraider, neuralSigils, patternLibrary } = get();
        
        const sigils = stateIds
          .map(id => neuralSigils.get(id))
          .filter((sigil): sigil is NeuralSigil => sigil !== undefined);
        
        if (sigils.length < 2) return null;
        
        // Use the correct method name 'braid' instead of 'braidSigils'
        const braidResult = await sigilBraider.braid(sigils);
        
        // Store braided pattern
        const newPatternLibrary = new Map(patternLibrary);
        newPatternLibrary.set(braidResult.id, braidResult);
        set({ patternLibrary: newPatternLibrary });
        
        return braidResult;
      },
      
      // Enhanced recognize patterns with neural sigil integration
      recognizePattern: async (sigil: NeuralSigil) => {
        const { patternLibrary, sigilGenerator, neuralSigils, patternAnalysis } = get();
        const matches: any[] = [];
        
        // Check against pattern library
        for (const [id, pattern] of patternLibrary) {
          const similarity = await sigilGenerator.compareSigils(
            sigil.pattern,
            pattern.combinedPattern
          );
          
          if (similarity > 0.6) {
            matches.push({
              patternId: id,
              similarity,
              pattern,
              type: 'braid'
            });
          }
        }
        
        // Check against other sigils - convert Map to Array first
        const sigilArray = Array.from(neuralSigils.entries());
        for (const [id, otherSigil] of sigilArray) {
          if (id === sigil.id) continue;
          
          const similarity = await sigilGenerator.compareSigils(
            sigil.pattern,
            otherSigil.pattern
          );
          
          if (similarity > 0.7) {
            matches.push({
              sigilId: id,
              similarity,
              sigil: otherSigil,
              type: 'sigil'
            });
          }
        }

        // Check against neural sigil database - convert Map to Array for filtering
        if (sigil.metadata?.neuralSigilData) {
          const neuralData = sigil.metadata.neuralSigilData;
          const sigilEntries = Array.from(neuralSigils.entries());
          const relatedSigils = sigilEntries
            .map(([id, s]) => s)
            .filter(s => 
              s.metadata?.neuralSigilData?.category === neuralData.category ||
              s.metadata?.neuralSigilData?.breathPhase === neuralData.breathPhase
            );

          for (const relatedSigil of relatedSigils) {
            if (relatedSigil.id === sigil.id) continue;
            
            matches.push({
              sigilId: relatedSigil.id,
              similarity: 0.8, // High similarity for neural matches
              sigil: relatedSigil,
              type: 'neural',
              neuralSigilData: relatedSigil.metadata?.neuralSigilData
            });
          }
        }
        
        return matches.sort((a, b) => b.similarity - a.similarity);
      },
      
      // Existing methods enhanced
      updateConsciousness: (metrics: Partial<QuantumConsciousnessMetrics>) => {
        set((state) => ({
          currentState: { ...state.currentState, ...metrics },
        }));
        
        // Check for high coherence moments
        const coherence = metrics.brainwaveCoherence || get().currentState.brainwaveCoherence;
        if (coherence > 0.8) {
          // Generate milestone sigil
          get().generateNeuralSigil({ milestone: true }, 'consciousness');
        }
      },
      
      trackBiometrics: (data: BiometricData) => {
        set({ biometrics: data });
      },
      
      setEmotionalState: (state: EmotionalState) => {
        set({ emotionalState: state });
      },

      // Core actions (for compatibility)
      setActive: (active) => set({ isActive: active }),
      
      updateSignature: (signature) => {
        // Enhanced signature with neural sigil integration
        const enhancedSignature = {
          ...signature,
          neuralSigilData: signature.currentNode ? 
            getNeuralSigilByTernary(signature.currentNode.hash?.slice(0, 5) || '00000') : 
            undefined
        };
        
        set(state => ({
          currentSignature: enhancedSignature,
          signatureHistory: [enhancedSignature, ...state.signatureHistory.slice(0, 999)]
        }));
      },
      
      updateBiometrics: (biometrics) => set(state => ({
        biometrics: { ...state.biometrics, ...biometrics }
      })),
      
      updateCurrentNode: (node) => set({ currentNode: node }),
      
      updateEmotionalState: (emotionalState) => set(state => ({
        emotionalState: { ...state.emotionalState, ...emotionalState }
      })),
      
      updateSecurityMetrics: (metrics) => set(state => ({
        securityMetrics: { ...state.securityMetrics, ...metrics }
      })),
      
      setSpiralPosition: (position) => set({ spiralPosition: position }),
      
      setValidationStatus: (status) => set({ validationStatus: status }),
      
      setBlockchainConnected: (connected) => set(state => ({
        blockchainState: { ...state.blockchainState, connected }
      })),
      
      setIpfsStatus: (ipfsStatus) => set(state => ({
        blockchainState: { ...state.blockchainState, ipfsStatus },
        ipfsStatus
      })),
      
      addBlockchainBlock: (block) => set(state => {
        const updatedBlockIndex = new Map(state.blockchainState.blockIndex);
        updatedBlockIndex.set(block.id, block);
        
        const newBlocks = [block, ...state.blockchainState.blocks.slice(0, 19)];
        
        return {
          blockchainState: {
            ...state.blockchainState,
            latestBlock: block,
            blockCount: state.blockchainState.blockCount + 1,
            blocks: newBlocks,
            blockIndex: updatedBlockIndex
          },
          chainState: {
            latestBlock: block,
            blockCount: state.blockchainState.blockCount + 1,
            blocks: newBlocks
          }
        };
      }),
      
      setMessageBox: (messageBox) => set({ messageBox }),
      
      setConsentAffirmation: (consentAffirmation) => set({ consentAffirmation }),
      
      setSymbolicGlyphs: (symbolicGlyphs) => set({ symbolicGlyphs }),
      
      addPattern: (pattern) => set(state => ({
        patternAnalysis: {
          ...state.patternAnalysis,
          activePatterns: [...state.patternAnalysis.activePatterns, pattern]
        }
      })),
      
      updatePatterns: (patterns) => set(state => ({
        patternAnalysis: { ...state.patternAnalysis, activePatterns: patterns }
      })),
      
      updateResonanceMap: (blockId, resonance) => set(state => {
        const newResonanceMap = new Map(state.blockchainState.resonanceMap);
        newResonanceMap.set(blockId, resonance);
        return {
          blockchainState: {
            ...state.blockchainState,
            resonanceMap: newResonanceMap
          }
        };
      }),
      
      reset: () => set({
        isActive: false,
        currentSignature: null,
        validationStatus: 'idle',
        currentNode: null,
        spiralPosition: { depth: 0, resonance: 0.75 },
        biometrics: initialBiometrics,
        emotionalState: initialEmotionalState,
        securityMetrics: initialSecurityMetrics,
        blockchainState: initialBlockchainState,
        messageBox: null,
        patternAnalysis: {
          activePatterns: [],
          resonanceThreshold: 0.7,
          patternHistory: new Map(),
          neuralPatterns: new Map()
        },
        signatureHistory: [],
        resonanceLevel: 0.75,
        neuralSigils: new Map(),
        consciousnessStates: [],
        patternLibrary: new Map()
      }),
      
      // Enhanced functions (mock implementations for compatibility)
      generateQuantumSignature: () => {
        // Mock implementation - would need full quantum signature generation
        const mockSignature: LimnusConsciousnessSignature = {
          id: `mock_${Date.now()}`,
          timestamp: Date.now(),
          score: 0.8,
          metrics: get().currentState,
          signature: 'mock_signature',
          validation: {
            overall: true,
            timestamp: true,
            score: true,
            entropy: true,
            anomaly: true,
            spiralIntegrity: true,
            quantumCoherence: true,
            consensusValid: true,
            blockchainValid: true
          },
          glyphs: ['∅', '∞'],
          currentNode: get().currentNode || {
            symbol: '0',
            notation: '(φ₀)',
            behavior: 'mock',
            timeIndex: 'mock',
            resonanceFreq: 432,
            color: '#000',
            breathPattern: 'natural',
            duration: 5,
            environment: { lighting: 'soft', temperature: '20-24°C', elements: [] },
            prompts: [],
            movement: 'stillness',
            depth: 0,
            meaning: 'mock'
          },
          spiralPosition: { r: 0, theta: 0 },
          quantumSignature: 'mock_quantum',
          consensusAnchor: 'mock_consensus',
          blockchainReferences: [],
          consciousnessAncestry: [],
          patternSignature: 'mock_pattern',
          neuralSigilData: getNeuralSigilByTernary('00000')
        };
        return mockSignature;
      },
      
      validateSignature: (signature) => ({
        overall: true,
        timestamp: true,
        score: true,
        entropy: true,
        anomaly: true,
        spiralIntegrity: true,
        quantumCoherence: true,
        consensusValid: true,
        blockchainValid: true
      }),
      
      calculateBlockchainReferences: (blocks) => [],
      analyzePatterns: () => {},
      exportConsciousnessBlock: async () => {},
      exportBlockchainHistory: async () => {},

      // Legacy compatibility methods (mock implementations)
      startMonitoring: (sessionId?: string) => {
        set({ isActive: true });
      },
      stopMonitoring: () => {
        set({ isActive: false });
      },
      updateResonance: (level: number) => {
        set({ resonanceLevel: level });
      },
      updateSpiralContext: (depth: number, node: string) => {
        set(state => ({
          spiralPosition: { ...state.spiralPosition, depth }
        }));
      },
      updateBreathContext: (phase: any, alignment: number) => {
        set(state => ({
          biometrics: {
            ...state.biometrics,
            goldenBreathing: alignment
          }
        }));
      },
      recordOnBlockchain: async () => {},
      processSessionBlocks: async (sessionId: string, emergenceWords?: string[]) => [],
      recordDreamOnBlockchain: async (dreamData: any) => ({
        id: 'mock_dream_block',
        previousHash: 'mock',
        timestamp: Math.floor(Date.now() / 1000),
        signature: 'mock',
        score: 8000,
        resonance: 8500,
        consentAffirmation: 'Dream consent',
        glyphs: ['🧠', '∞'],
        ipfsCid: 'QmMockDream',
        transactionId: '0xMockDream',
        consciousnessMetrics: {},
        nodeDepth: 0,
        emotionalFingerprint: 'Dream_0.8_0.5',
        quantumState: { collapse: 0.7, bloom: 0.8, phase: 0.75 },
        references: [],
        neuralSigilData: getNeuralSigilByTernary('T1111') // Hippocampus - The Librarian
      }),
      updateMetricWeights: (weights: any) => {},
      setBreathCycleCallback: (callback: any) => {},
      setEmergenceWords: (words: string[]) => {},
      addEmergenceWord: (word: string) => {},
      setIncludeHistoricalEmergence: (include: boolean) => {},
      getValidatedBlocks: () => get().blockchainState.blocks.filter(block => block.isValidated === true),
      getBlockValidationCount: () => get().blockchainState.blocks.filter(block => block.isValidated === true).length,
      getValidatedSignatures: () => get().signatureHistory.filter(signature => signature.validation.overall === true),
      getSignatureValidationCount: () => get().signatureHistory.filter(signature => signature.validation.overall === true).length,
      getSignatureValidationRate: () => {
        const history = get().signatureHistory;
        if (history.length === 0) return 0;
        const validCount = history.filter(signature => signature.validation.overall === true).length;
        return (validCount / history.length) * 100;
      },
      getCurrentSessionMinutes: () => 0,
      getTotalPracticeMinutes: () => 0,
      getDreamBlocks: () => get().blockchainState.blocks.filter(block => block.blockType === 'dream'),
      getFoundationBlocks: () => get().blockchainState.blocks.filter(block => block.blockType === 'foundation'),
      getConsciousnessBlocks: () => get().blockchainState.blocks.filter(block => block.blockType === 'consciousness'),
      getRecentConsciousnessBlocks: (limit = 5) => {
        return get().blockchainState.blocks
          .filter(block => block.blockType === 'consciousness')
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, limit);
      },
      getSessionSummary: (sessionId: string) => null,
      getSessionSignatures: (sessionId: string) => [],
      getEmergenceEvolution: () => ({
        recentWords: [],
        frequentWords: [],
        evolutionPattern: []
      }),
      getHistoricalEmergenceContext: () => ({
        recentWords: [],
        frequentWords: [],
        evolutionPattern: []
      }),
      validateBlocksWithDream: (blockIds: string[], dreamId: string) => {}
    }),
    {
      name: 'consciousness-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        consentAffirmation: state.consentAffirmation,
        symbolicGlyphs: state.symbolicGlyphs,
        patternAnalysis: {
          ...state.patternAnalysis,
          patternHistory: state.patternAnalysis?.patternHistory ? Array.from(state.patternAnalysis.patternHistory.entries()) : [],
          neuralPatterns: state.patternAnalysis?.neuralPatterns ? Array.from(state.patternAnalysis.neuralPatterns.entries()) : []
        },
        blockchainState: {
          ...state.blockchainState,
          blocks: state.blockchainState.blocks.slice(0, 20),
          blockIndex: undefined,
          resonanceMap: state.blockchainState?.resonanceMap ? Array.from(state.blockchainState.resonanceMap.entries()) : []
        },
        signatureHistory: state.signatureHistory.slice(0, 100),
        resonanceLevel: state.resonanceLevel,
        // Persist neural sigil data
        neuralSigils: state.neuralSigils ? Array.from(state.neuralSigils.entries()).slice(0, 100) : [],
        consciousnessStates: state.consciousnessStates.slice(0, 50),
        patternLibrary: state.patternLibrary ? Array.from(state.patternLibrary.entries()).slice(0, 20) : [],
        // Persist biometric data
        biometrics: state.biometrics,
        emotionalState: state.emotionalState,
        securityMetrics: state.securityMetrics
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Restore Map objects from arrays with proper null checks
          if (state.patternAnalysis) {
            if (Array.isArray(state.patternAnalysis.patternHistory)) {
              state.patternAnalysis.patternHistory = new Map(state.patternAnalysis.patternHistory as any);
            } else {
              state.patternAnalysis.patternHistory = new Map();
            }
            
            if (Array.isArray(state.patternAnalysis.neuralPatterns)) {
              state.patternAnalysis.neuralPatterns = new Map(state.patternAnalysis.neuralPatterns as any);
            } else {
              state.patternAnalysis.neuralPatterns = new Map();
            }
          } else {
            state.patternAnalysis = {
              activePatterns: [],
              resonanceThreshold: 0.7,
              patternHistory: new Map(),
              neuralPatterns: new Map()
            };
          }
          
          if (state.blockchainState) {
            if (Array.isArray(state.blockchainState.resonanceMap)) {
              state.blockchainState.resonanceMap = new Map(state.blockchainState.resonanceMap as any);
            } else {
              state.blockchainState.resonanceMap = new Map();
            }
          }
          
          // Restore neural sigil maps
          if (Array.isArray(state.neuralSigils)) {
            state.neuralSigils = new Map(state.neuralSigils as any);
          } else {
            state.neuralSigils = new Map();
          }
          
          if (Array.isArray(state.patternLibrary)) {
            state.patternLibrary = new Map(state.patternLibrary as any);
          } else {
            state.patternLibrary = new Map();
          }
          
          // Recreate blockIndex from blocks
          if (state.blockchainState) {
            state.blockchainState.blockIndex = new Map();
            state.blockchainState.blocks.forEach(block => {
              state.blockchainState.blockIndex.set(block.id, block);
            });
            
            // Sync chainState with blockchainState for compatibility
            state.chainState = {
              latestBlock: state.blockchainState.latestBlock,
              blockCount: state.blockchainState.blockCount,
              blocks: state.blockchainState.blocks
            };
            
            // Sync ipfsStatus for compatibility
            state.ipfsStatus = state.blockchainState.ipfsStatus;
          }

          // Ensure biometric data is available
          if (!state.biometrics) {
            state.biometrics = initialBiometrics;
          }
          if (!state.emotionalState) {
            state.emotionalState = initialEmotionalState;
          }
          if (!state.securityMetrics) {
            state.securityMetrics = initialSecurityMetrics;
          }
        }
      },
    }
  )
);

// Legacy type exports for compatibility
export type ConsciousnessSignature = LimnusConsciousnessSignature;
export type ConsciousnessMetrics = QuantumConsciousnessMetrics;