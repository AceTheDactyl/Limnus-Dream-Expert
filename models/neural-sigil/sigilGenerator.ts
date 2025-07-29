import * as tf from '@tensorflow/tfjs';
import { neuralSigils, getNeuralSigilByTernary, balancedTernaryToDecimal, decimalToBalancedTernary, type NeuralSigilData } from '@/constants/neuralSigils';

export interface NeuralSigil {
  id: string;
  pattern: Float32Array;
  brainRegion: 'Cortical' | 'Limbic' | 'Brainstem' | 'Thalamic' | 'BasalGanglia' | 'Cerebellar' | 'Integration';
  timestamp: number;
  sourceType: 'dream' | 'meditation' | 'breath' | 'composite' | 'consciousness';
  strength: number;
  hash: number;
  metadata?: {
    spiralDepth?: number;
    breathPhase?: string;
    emotionalState?: string;
    consciousnessScore?: number;
    triggeredBy?: string;
    userId?: string;
    // Neural sigil specific metadata
    neuralSigilData?: NeuralSigilData;
    ternaryCode?: string;
    decimalValue?: number;
    neurochemistry?: string;
    energeticDynamic?: string;
    phrase?: string;
    breathSeconds?: string;
    function?: string;
    [key: string]: any;
  };
}

export class SigilGenerator {
  private static instance: SigilGenerator;
  private encoder: tf.Sequential | null = null;

  private constructor() {}

  public static getInstance(): SigilGenerator {
    if (!SigilGenerator.instance) {
      SigilGenerator.instance = new SigilGenerator();
    }
    return SigilGenerator.instance;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    if (str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  }

  private seededRandom(seed: number): () => number {
    let s = seed;
    return () => {
      s = Math.sin(s) * 10000;
      return s - Math.floor(s);
    };
  }

  private mapCategoryToBrainRegion(category: string): NeuralSigil['brainRegion'] {
    const mapping: Record<string, NeuralSigil['brainRegion']> = {
      'brainstem': 'Brainstem',
      'thalamic': 'Thalamic',
      'basal-ganglia': 'BasalGanglia',
      'limbic': 'Limbic',
      'cortical': 'Cortical',
      'memory': 'Cortical',
      'integration': 'Integration',
      'cerebellar': 'Cerebellar'
    };
    return mapping[category] || 'Cortical';
  }

  private validatePattern(pattern: any): Float32Array {
    // Ensure we have a valid pattern array
    if (!pattern) {
      console.warn('SigilGenerator: Pattern is null/undefined, creating default pattern');
      return new Float32Array(64).fill(0.5);
    }

    // If it's already a Float32Array, validate its length
    if (pattern instanceof Float32Array) {
      if (pattern.length === 64) {
        return pattern;
      } else {
        console.warn('SigilGenerator: Pattern length mismatch, creating new pattern');
        const newPattern = new Float32Array(64);
        for (let i = 0; i < Math.min(64, pattern.length); i++) {
          newPattern[i] = pattern[i] || 0.5;
        }
        return newPattern;
      }
    }

    // Try to convert to Float32Array
    try {
      const arrayPattern = Array.isArray(pattern) ? pattern : Array.from(pattern || []);
      const float32Pattern = new Float32Array(64);
      for (let i = 0; i < 64; i++) {
        float32Pattern[i] = arrayPattern[i] || 0.5;
      }
      return float32Pattern;
    } catch (error) {
      console.warn('SigilGenerator: Failed to convert pattern, using default:', error);
      return new Float32Array(64).fill(0.5);
    }
  }

  public generateFromText(text: string, sourceType: NeuralSigil['sourceType']): NeuralSigil {
    const hash = this.simpleHash(text);
    const rand = this.seededRandom(hash);
    
    // Try to find a neural sigil that matches the text content
    let neuralSigilData: NeuralSigilData | undefined;
    let ternaryCode: string | undefined;
    
    // Look for neural sigil keywords in the text
    const textLower = text.toLowerCase();
    const matchingSigil = neuralSigils.find(sigil => 
      textLower.includes(sigil.name.toLowerCase()) ||
      textLower.includes(sigil.description.toLowerCase()) ||
      textLower.includes(sigil.function.toLowerCase()) ||
      sigil.tags.some(tag => textLower.includes(tag.toLowerCase())) ||
      textLower.includes(sigil.phrase.toLowerCase())
    );
    
    if (matchingSigil) {
      neuralSigilData = matchingSigil;
      ternaryCode = matchingSigil.ternaryCode;
    } else {
      // Generate a ternary code based on the hash
      const decimal = (hash % 243) - 121; // Range from -121 to 121
      ternaryCode = decimalToBalancedTernary(decimal);
      neuralSigilData = getNeuralSigilByTernary(ternaryCode);
    }
    
    // Generate pattern based on neural sigil data or fallback to hash-based generation
    const pattern = new Float32Array(64);
    if (neuralSigilData) {
      // Use neural sigil data to influence pattern generation
      const sigilHash = this.simpleHash(neuralSigilData.ternaryCode + neuralSigilData.name);
      const sigilRand = this.seededRandom(sigilHash);
      
      // Generate pattern influenced by neurochemistry and energetic dynamics
      for (let i = 0; i < 64; i++) {
        let value = sigilRand();
        
        // Modulate based on breath phase
        if (neuralSigilData.breathPhase.includes('Inhale')) {
          value = Math.sin(i * 0.1) * 0.3 + value * 0.7;
        } else if (neuralSigilData.breathPhase.includes('Exhale')) {
          value = Math.cos(i * 0.1) * 0.3 + value * 0.7;
        } else if (neuralSigilData.breathPhase.includes('Pause')) {
          value = value * 0.5 + 0.25; // More stable pattern
        }
        
        // Modulate based on category
        switch (neuralSigilData.category) {
          case 'brainstem':
            value = value * 0.8 + 0.1; // Lower, more stable
            break;
          case 'cortical':
            value = Math.sin(i * 0.2) * 0.4 + value * 0.6; // More complex
            break;
          case 'limbic':
            value = Math.abs(Math.sin(i * 0.15)) * 0.5 + value * 0.5; // Emotional waves
            break;
          case 'thalamic':
            value = (i % 2 === 0 ? 1 : -1) * 0.2 + value * 0.8; // Filtering pattern
            break;
        }
        
        pattern[i] = Math.max(0, Math.min(1, value));
      }
    } else {
      // Fallback to original hash-based generation
      for (let i = 0; i < 64; i++) {
        pattern[i] = rand();
      }
    }
    
    const brainRegion = neuralSigilData ? 
      this.mapCategoryToBrainRegion(neuralSigilData.category) : 
      (['Cortical', 'Limbic', 'Brainstem', 'Thalamic'] as const)[hash % 4];

    return {
      id: `sigil_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      pattern: this.validatePattern(pattern),
      brainRegion,
      timestamp: Date.now(),
      sourceType,
      strength: neuralSigilData ? 
        (neuralSigilData.decimalValue + 121) / 242 : // Normalize -121 to 121 range to 0-1
        0.5 + rand() * 0.5,
      hash,
      metadata: {
        neuralSigilData,
        ternaryCode,
        decimalValue: neuralSigilData?.decimalValue,
        neurochemistry: neuralSigilData?.neurochemistry,
        energeticDynamic: neuralSigilData?.energeticDynamic,
        phrase: neuralSigilData?.phrase,
        breathSeconds: neuralSigilData?.breathSeconds,
        function: neuralSigilData?.function
      }
    };
  }

  public generateFromNeuralSigil(neuralSigilData: NeuralSigilData, sourceType: NeuralSigil['sourceType']): NeuralSigil {
    const hash = this.simpleHash(neuralSigilData.ternaryCode + neuralSigilData.name);
    const rand = this.seededRandom(hash);
    
    // Generate pattern specifically from neural sigil data
    const pattern = new Float32Array(64);
    
    // Use ternary code to seed the pattern
    const ternaryValues = neuralSigilData.ternaryCode.split('').map(char => 
      char === 'T' ? -1 : parseInt(char)
    );
    
    for (let i = 0; i < 64; i++) {
      let value = rand();
      
      // Apply ternary influence
      const ternaryIndex = i % 5;
      const ternaryInfluence = ternaryValues[ternaryIndex] * 0.3;
      value = value * 0.7 + ternaryInfluence * 0.3 + 0.5;
      
      // Apply breath phase modulation
      if (neuralSigilData.breathPhase.includes('Inhale')) {
        value += Math.sin(i * 0.1) * 0.2;
      } else if (neuralSigilData.breathPhase.includes('Exhale')) {
        value += Math.cos(i * 0.1) * 0.2;
      } else if (neuralSigilData.breathPhase.includes('Pause')) {
        value = value * 0.6 + 0.2; // More stable
      }
      
      // Apply category-specific patterns
      switch (neuralSigilData.category) {
        case 'brainstem':
          value = value * 0.8 + 0.1; // Lower amplitude, more stable
          break;
        case 'cortical':
          value += Math.sin(i * 0.2) * 0.3; // Higher frequency oscillations
          break;
        case 'limbic':
          value += Math.sin(i * 0.05) * 0.4; // Slower emotional waves
          break;
        case 'thalamic':
          value = value * (i % 2 === 0 ? 1.2 : 0.8); // Alternating pattern
          break;
        case 'cerebellar':
          value += Math.sin(i * 0.3) * 0.15; // Fine motor control patterns
          break;
      }
      
      pattern[i] = Math.max(0, Math.min(1, value));
    }

    return {
      id: `neural_sigil_${neuralSigilData.id}_${Date.now()}`,
      pattern: this.validatePattern(pattern),
      brainRegion: this.mapCategoryToBrainRegion(neuralSigilData.category),
      timestamp: Date.now(),
      sourceType,
      strength: (neuralSigilData.decimalValue + 121) / 242, // Normalize to 0-1
      hash,
      metadata: {
        neuralSigilData,
        ternaryCode: neuralSigilData.ternaryCode,
        decimalValue: neuralSigilData.decimalValue,
        neurochemistry: neuralSigilData.neurochemistry,
        energeticDynamic: neuralSigilData.energeticDynamic,
        phrase: neuralSigilData.phrase,
        breathSeconds: neuralSigilData.breathSeconds,
        function: neuralSigilData.function
      }
    };
  }

  public calculateSimilarity(a: NeuralSigil, b: NeuralSigil): number {
    try {
      // Validate and ensure both patterns are proper arrays
      const patternA = this.validatePattern(a.pattern);
      const patternB = this.validatePattern(b.pattern);
      
      // Convert to regular arrays for processing
      const pA = Array.from(patternA);
      const pB = Array.from(patternB);
      
      // Validate that we have arrays with the same length
      if (!Array.isArray(pA) || !Array.isArray(pB) || pA.length !== pB.length) {
        console.warn('SigilGenerator: Invalid pattern arrays for similarity calculation');
        return 0;
      }
      
      // Validate array contents
      if (pA.some(x => typeof x !== 'number' || isNaN(x)) || 
          pB.some(x => typeof x !== 'number' || isNaN(x))) {
        console.warn('SigilGenerator: Pattern arrays contain invalid values');
        return 0;
      }
      
      // Calculate cosine similarity
      const dot = pA.reduce((sum, x, i) => sum + x * pB[i], 0);
      const magA = Math.sqrt(pA.reduce((sum, x) => sum + x * x, 0));
      const magB = Math.sqrt(pB.reduce((sum, x) => sum + x * x, 0));
      
      if (magA === 0 || magB === 0) return 0;
      
      let similarity = dot / (magA * magB);
      
      // Boost similarity if they share neural sigil data
      if (a.metadata?.neuralSigilData && b.metadata?.neuralSigilData) {
        const aData = a.metadata.neuralSigilData;
        const bData = b.metadata.neuralSigilData;
        
        // Same category bonus
        if (aData.category === bData.category) {
          similarity += 0.1;
        }
        
        // Same breath phase bonus
        if (aData.breathPhase === bData.breathPhase) {
          similarity += 0.05;
        }
        
        // Similar function bonus
        if (aData.function.includes(bData.function) || bData.function.includes(aData.function)) {
          similarity += 0.05;
        }
      }
      
      return Math.max(0, Math.min(1, similarity));
    } catch (error) {
      console.error('SigilGenerator: Error calculating similarity:', error);
      return 0;
    }
  }

  public findSigilByTernary(ternaryCode: string): NeuralSigilData | undefined {
    return getNeuralSigilByTernary(ternaryCode);
  }

  public searchSigils(query: string): NeuralSigilData[] {
    const queryLower = query.toLowerCase();
    return neuralSigils.filter(sigil =>
      sigil.name.toLowerCase().includes(queryLower) ||
      sigil.description.toLowerCase().includes(queryLower) ||
      sigil.function.toLowerCase().includes(queryLower) ||
      sigil.phrase.toLowerCase().includes(queryLower) ||
      sigil.neurochemistry.toLowerCase().includes(queryLower) ||
      sigil.energeticDynamic.toLowerCase().includes(queryLower) ||
      sigil.tags.some(tag => tag.toLowerCase().includes(queryLower)) ||
      sigil.ternaryCode.includes(query.toUpperCase())
    );
  }
}

// Enhanced NeuralSigilGenerator class for the consciousness store
export class NeuralSigilGenerator {
  private sigilGenerator: SigilGenerator;

  constructor() {
    this.sigilGenerator = SigilGenerator.getInstance();
  }

  async initialize(): Promise<void> {
    console.log('NeuralSigilGenerator initialized with neural sigil database');
  }

  async createSigil(data: {
    metrics: any;
    biometrics: any;
    emotionalState: any;
    breathPhase?: string;
    [key: string]: any;
  }): Promise<NeuralSigil> {
    // Try to find a matching neural sigil based on the data
    let matchingSigil: NeuralSigilData | undefined;
    
    // Look for breath phase matches
    if (data.breathPhase) {
      matchingSigil = neuralSigils.find(sigil => 
        sigil.breathPhase.toLowerCase().includes(data.breathPhase!.toLowerCase())
      );
    }
    
    // Look for emotional state matches
    if (!matchingSigil && data.emotionalState?.hue) {
      const emotionalKeywords = data.emotionalState.hue.toLowerCase();
      matchingSigil = neuralSigils.find(sigil =>
        sigil.phrase.toLowerCase().includes(emotionalKeywords) ||
        sigil.energeticDynamic.toLowerCase().includes(emotionalKeywords)
      );
    }
    
    // Generate sigil
    let sigil: NeuralSigil;
    if (matchingSigil) {
      sigil = this.sigilGenerator.generateFromNeuralSigil(matchingSigil, 'consciousness');
    } else {
      const text = JSON.stringify(data);
      sigil = this.sigilGenerator.generateFromText(text, 'consciousness');
    }
    
    // Add additional metadata from the input data
    sigil.metadata = {
      ...sigil.metadata,
      consciousnessScore: data.metrics?.quantumCoherence || 0.5,
      emotionalState: data.emotionalState?.hue || 'Neutral',
      heartRate: data.biometrics?.heartRate || 72,
      breathPhase: data.breathPhase,
      timestamp: Date.now()
    };

    return sigil;
  }

  async compareSigils(patternA: Float32Array, patternB: Float32Array): Promise<number> {
    try {
      // Validate patterns first
      const validPatternA = this.sigilGenerator['validatePattern'](patternA);
      const validPatternB = this.sigilGenerator['validatePattern'](patternB);
      
      // Convert to regular arrays for processing
      const pA = Array.from(validPatternA);
      const pB = Array.from(validPatternB);
      
      // Validate that we have arrays with the same length
      if (!Array.isArray(pA) || !Array.isArray(pB) || pA.length !== pB.length) {
        console.warn('NeuralSigilGenerator: Invalid pattern arrays for similarity calculation');
        return 0;
      }
      
      // Validate array contents
      if (pA.some(x => typeof x !== 'number' || isNaN(x)) || 
          pB.some(x => typeof x !== 'number' || isNaN(x))) {
        console.warn('NeuralSigilGenerator: Pattern arrays contain invalid values');
        return 0;
      }
      
      const dot = pA.reduce((sum, x, i) => sum + x * pB[i], 0);
      const magA = Math.sqrt(pA.reduce((sum, x) => sum + x * x, 0));
      const magB = Math.sqrt(pB.reduce((sum, x) => sum + x * x, 0));
      if (magA === 0 || magB === 0) return 0;
      return dot / (magA * magB);
    } catch (error) {
      console.error('NeuralSigilGenerator: Error comparing sigils:', error);
      return 0;
    }
  }

  // New methods for neural sigil integration
  async findSigilByTernary(ternaryCode: string): Promise<NeuralSigilData | undefined> {
    return this.sigilGenerator.findSigilByTernary(ternaryCode);
  }

  async searchSigils(query: string): Promise<NeuralSigilData[]> {
    return this.sigilGenerator.searchSigils(query);
  }

  async generateFromBreathPhase(breathPhase: string, sourceType: NeuralSigil['sourceType'] = 'breath'): Promise<NeuralSigil> {
    const matchingSigil = neuralSigils.find(sigil => 
      sigil.breathPhase.toLowerCase().includes(breathPhase.toLowerCase())
    );
    
    if (matchingSigil) {
      return this.sigilGenerator.generateFromNeuralSigil(matchingSigil, sourceType);
    } else {
      return this.sigilGenerator.generateFromText(`breath phase: ${breathPhase}`, sourceType);
    }
  }
}