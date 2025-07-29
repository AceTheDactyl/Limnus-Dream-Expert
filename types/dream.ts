export interface Dream {
  id: string;
  name: string;
  text: string;
  description?: string;
  persona: 'orion' | 'limnus';
  interpretation: string;
  dreamType: string;
  date: string;
  blockchainValidated?: boolean;
  alignedBlocks?: string[];
  neuralSigilId?: string;
  consciousnessDepth?: number;
  brainRegionActivation?: string;
  similarDreams?: string[];
  // New neural sigil fields
  sigilId?: string;
  braidedWith?: string[];
  lucidity?: number;
  emotionalIntensity?: number;
  symbols?: string[];
  temporalCoherence?: number;
  narrativeComplexity?: number;
}

export interface Persona {
  id: 'orion' | 'limnus';
  name: string;
  description: string;
  color: string;
  systemPrompt: string;
}