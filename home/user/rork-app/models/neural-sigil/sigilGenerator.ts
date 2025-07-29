// This file is a duplicate - using the main model at /models/neural-sigil/sigilGenerator.ts
export * from '@/models/neural-sigil/sigilGenerator';

/*
export interface NeuralSigil {
  id: string;
  pattern: number[];
  brainRegion: 'Cortical' | 'Limbic' | 'Brainstem' | 'Thalamic';
  timestamp: number;
  sourceType: 'dream' | 'meditation' | 'breath' | 'composite';
  strength: number;
  hash: number;
  metadata?: {
    spiralDepth?: number;
    breathPhase?: string;
    emotionalState?: string;
    consciousnessScore?: number;
    userId?: string;
    triggeredBy?: string;
  };
}

export class SigilGenerator {
  private static instance: SigilGenerator;

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

  public generateFromText(text: string, sourceType: NeuralSigil['sourceType']): NeuralSigil {
    const hash = this.simpleHash(text);
    const rand = this.seededRandom(hash);
    const pattern = Array(64).fill(0).map(() => rand());
    const regions: NeuralSigil['brainRegion'][] = ['Cortical', 'Limbic', 'Brainstem', 'Thalamic'];
    const region = regions[hash % regions.length];

    return {
      id: `sigil_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      pattern,
      brainRegion: region,
      timestamp: Date.now(),
      sourceType,
      strength: 0.5 + rand() * 0.5,
      hash,
      metadata: {}
    };
  }

  public calculateSimilarity(a: NeuralSigil, b: NeuralSigil): number {
    const pA = a.pattern;
    const pB = b.pattern;
    const dot = pA.reduce((sum, x, i) => sum + x * pB[i], 0);
    const magA = Math.sqrt(pA.reduce((sum, x) => sum + x * x, 0));
    const magB = Math.sqrt(pB.reduce((sum, x) => sum + x * x, 0));
    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
  }
}
*/