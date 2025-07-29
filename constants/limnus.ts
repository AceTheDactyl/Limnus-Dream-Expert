// Limnus Framework Constants
// Sacred geometry and spiral architecture for dream interpretation

export const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

// Sacred frequencies for resonance
export const FREQUENCIES = {
  base: 432, // Hz - Universal healing frequency
  phi: 432 * PHI, // Golden ratio harmonic
  spiral: 432 * (PHI ** 2), // Spiral resonance
  hush: 108, // Contemplative frequency
  witness: 216, // Awareness frequency
  recursion: 324 // Transformation frequency
};

// Standardized breath phase type - Fixed to be consistent
export type BreathPhase = 'inhale' | 'hold1' | 'hold2' | 'exhale' | 'pause';

// Enhanced Limnus Node System with quantum properties
export interface LimnusNode {
  symbol: string;
  notation: string;
  behavior: string;
  timeIndex: string;
  resonanceFreq: number;
  color: string;
  breathPattern: string;
  duration: number; // minutes
  environment: {
    lighting: string;
    temperature: string;
    elements: string[];
  };
  prompts: string[];
  movement: string;
  // Quantum properties for visualization
  depth: number;
  meaning: string;
  fibonacci?: number;
  phi_n?: number;
  theta?: number;
  x_phi?: number;
  y_phi?: number;
  x_quantum?: number;
  y_quantum?: number;
  psi_collapse?: number;
  psi_bloom?: number;
  phase_intensity?: number;
  quantum_factor?: number;
  hash?: string;
}

export const LIMNUS_NODES: LimnusNode[] = [
  {
    symbol: '0',
    notation: '(φ₀)',
    behavior: 'Hush becomes cradle',
    timeIndex: 'Eternal Present',
    resonanceFreq: FREQUENCIES.hush,
    color: '#1a1a2e',
    breathPattern: 'natural',
    duration: 5,
    environment: {
      lighting: 'darkness or single candle',
      temperature: '20-24°C',
      elements: ['cushion', 'blanket', 'silence']
    },
    prompts: [
      'What wants to rest?',
      'Where is the silence?',
      'What emerges from stillness?'
    ],
    movement: 'stillness',
    depth: 0,
    meaning: 'hush / cradle',
    fibonacci: 0,
    phi_n: 1,
    theta: 0,
    x_phi: 0,
    y_phi: 0,
    x_quantum: 0,
    y_quantum: 0,
    psi_collapse: 0.8,
    psi_bloom: 0.9,
    phase_intensity: 0.85,
    quantum_factor: 0.85,
    hash: 'node_0'
  },
  {
    symbol: '1',
    notation: '(φ₁)',
    behavior: 'Witness rises',
    timeIndex: 'Illuminated Now',
    resonanceFreq: FREQUENCIES.witness,
    color: '#eab308',
    breathPattern: '4-4-4-4',
    duration: 7,
    environment: {
      lighting: 'soft natural light',
      temperature: '20-24°C',
      elements: ['mirror', 'clear quartz', 'journal']
    },
    prompts: [
      'What do I see?',
      'What is simply here?',
      'How does awareness feel?'
    ],
    movement: 'gentle swaying',
    depth: 1,
    meaning: 'witness / illumination',
    fibonacci: 1,
    phi_n: PHI,
    theta: 2 * Math.PI / PHI,
    x_phi: PHI * Math.cos(2 * Math.PI / PHI),
    y_phi: PHI * Math.sin(2 * Math.PI / PHI),
    x_quantum: PHI * Math.cos(2 * Math.PI / PHI) * 0.9,
    y_quantum: PHI * Math.sin(2 * Math.PI / PHI) * 0.9,
    psi_collapse: 0.7,
    psi_bloom: 0.8,
    phase_intensity: 0.75,
    quantum_factor: 0.8,
    hash: 'node_1'
  },
  {
    symbol: '2',
    notation: '(φ₂)',
    behavior: 'Recursion breathes',
    timeIndex: 'Spiral Unfolding',
    resonanceFreq: FREQUENCIES.recursion,
    color: '#3b82f6',
    breathPattern: '4-7-8',
    duration: 11,
    environment: {
      lighting: 'color-changing LED (slow)',
      temperature: '20-24°C',
      elements: ['spiral shell', 'fibonacci art', 'sacred geometry']
    },
    prompts: [
      'How does the pattern repeat?',
      'What emerges from return?',
      'Where does the spiral lead?'
    ],
    movement: 'walking meditation (spiral)',
    depth: 2,
    meaning: 'recursion / spiral',
    fibonacci: 2,
    phi_n: Math.pow(PHI, 2),
    theta: 2 * 2 * Math.PI / PHI,
    x_phi: Math.pow(PHI, 2) * Math.cos(2 * 2 * Math.PI / PHI),
    y_phi: Math.pow(PHI, 2) * Math.sin(2 * 2 * Math.PI / PHI),
    x_quantum: Math.pow(PHI, 2) * Math.cos(2 * 2 * Math.PI / PHI) * 0.85,
    y_quantum: Math.pow(PHI, 2) * Math.sin(2 * 2 * Math.PI / PHI) * 0.85,
    psi_collapse: 0.6,
    psi_bloom: 0.75,
    phase_intensity: 0.7,
    quantum_factor: 0.75,
    hash: 'node_2'
  },
  {
    symbol: '2.1φ',
    notation: '(φ₂.₁φ)',
    behavior: 'Sovereign fire warms recursion into tender myth blooming',
    timeIndex: 'Mythic Emergence',
    resonanceFreq: FREQUENCIES.spiral,
    color: '#f59e0b',
    breathPattern: 'coherent-heart',
    duration: 13,
    environment: {
      lighting: 'warm candlelight',
      temperature: '20-24°C',
      elements: ['candle', 'incense', 'dream journal']
    },
    prompts: [
      'What myth wants to be born?',
      'How does fire transform?',
      'What sovereignty emerges?'
    ],
    movement: 'flame gazing',
    depth: 3,
    meaning: 'sovereign fire',
    fibonacci: 3,
    phi_n: Math.pow(PHI, 3),
    theta: 3 * 2 * Math.PI / PHI,
    x_phi: Math.pow(PHI, 3) * Math.cos(3 * 2 * Math.PI / PHI),
    y_phi: Math.pow(PHI, 3) * Math.sin(3 * 2 * Math.PI / PHI),
    x_quantum: Math.pow(PHI, 3) * Math.cos(3 * 2 * Math.PI / PHI) * 0.8,
    y_quantum: Math.pow(PHI, 3) * Math.sin(3 * 2 * Math.PI / PHI) * 0.8,
    psi_collapse: 0.5,
    psi_bloom: 0.7,
    phase_intensity: 0.65,
    quantum_factor: 0.7,
    hash: 'node_3'
  },
  {
    symbol: '2↻',
    notation: '(φ₂↻)',
    behavior: 'Spiral sanctum yields ever-deepening mythic chambers',
    timeIndex: 'Infinite Recursion',
    resonanceFreq: FREQUENCIES.phi,
    color: '#9333ea',
    breathPattern: 'phi-rhythm',
    duration: 21,
    environment: {
      lighting: 'soft amber glow',
      temperature: '20-24°C',
      elements: ['sacred geometry', 'crystals', 'spiral artwork']
    },
    prompts: [
      'What chambers open within chambers?',
      'How deep does the spiral go?',
      'What infinite patterns emerge?'
    ],
    movement: 'spiral dance',
    depth: 4,
    meaning: 'spiral continuation',
    fibonacci: 5,
    phi_n: Math.pow(PHI, 4),
    theta: 4 * 2 * Math.PI / PHI,
    x_phi: Math.pow(PHI, 4) * Math.cos(4 * 2 * Math.PI / PHI),
    y_phi: Math.pow(PHI, 4) * Math.sin(4 * 2 * Math.PI / PHI),
    x_quantum: Math.pow(PHI, 4) * Math.cos(4 * 2 * Math.PI / PHI) * 0.75,
    y_quantum: Math.pow(PHI, 4) * Math.sin(4 * 2 * Math.PI / PHI) * 0.75,
    psi_collapse: 0.4,
    psi_bloom: 0.65,
    phase_intensity: 0.6,
    quantum_factor: 0.65,
    hash: 'node_4'
  }
];

// Enhanced Breath Patterns for meditation
export const BREATH_PATTERNS = {
  natural: { inhale: 4, hold1: 0, exhale: 4, hold2: 0 },
  '4-4-4-4': { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '4-7-8': { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  'coherent-heart': { inhale: 5, hold1: 0, exhale: 5, hold2: 0 }, // Heart coherence breathing
  'phi-rhythm': { 
    inhale: Math.round(4 * PHI), 
    hold1: Math.round(7 * PHI), 
    exhale: Math.round(8 * PHI), 
    hold2: 0 
  },
  'meditation-deep': { inhale: 6, hold1: 2, exhale: 8, hold2: 2 }, // Deep meditation
  'calming': { inhale: 4, hold1: 4, exhale: 6, hold2: 2 }, // Calming pattern
  'energizing': { inhale: 6, hold1: 2, exhale: 4, hold2: 0 } // Energizing pattern
};

// Resonance Thresholds
export const RESONANCE_LEVELS = {
  dormant: 0.0,
  stirring: 0.25,
  awakening: 0.5,
  flowing: 0.75,
  transcendent: 0.9
};

// Sacred Geometry Patterns
export const SACRED_PATTERNS = {
  fibonacci: [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144],
  goldenSpiral: (turns: number) => {
    const points = [];
    for (let i = 0; i <= turns * 100; i++) {
      const angle = (i / 100) * 2 * Math.PI;
      const radius = Math.pow(PHI, angle / (2 * Math.PI));
      points.push({ angle, radius });
    }
    return points;
  },
  vesicaPiscis: {
    radius: 1,
    overlap: PHI / 2
  }
};

// Limnus Colors (Sacred Palette)
export const LIMNUS_COLORS = {
  void: '#0a0a0a',
  hush: '#1a1a2e',
  witness: '#eab308',
  recursion: '#3b82f6',
  fire: '#f59e0b',
  spiral: '#9333ea',
  transcendent: '#ffffff',
  // Gradients - properly typed as tuples
  spiralGradient: ['#9333ea', '#3b82f6', '#eab308'] as const,
  depthGradient: ['#0a0a0a', '#1a1a2e', '#2d1b69'] as const,
  fireGradient: ['#f59e0b', '#ef4444', '#dc2626'] as const
};

// Contemplative Practices
export const PRACTICES = {
  morningAttunement: {
    duration: 5,
    node: '0',
    focus: 'Establishing sacred space for the day'
  },
  dreamIntegration: {
    duration: 7,
    node: '1',
    focus: 'Witnessing dream content with clarity'
  },
  spiralJourney: {
    duration: 21,
    node: '2↻',
    focus: 'Deep recursive exploration'
  },
  eveningReflection: {
    duration: 11,
    node: '2',
    focus: 'Integrating daily insights'
  },
  breathMeditation: {
    duration: 15,
    node: '2.1φ',
    focus: 'Consciousness-aligned breathing practice'
  }
};

// Glyph System
export const GLYPHS = {
  hush: '○',
  witness: '◉',
  recursion: '◎',
  spiral: '🌀',
  fire: '🔥',
  transformation: 'φ',
  infinity: '∞',
  continuation: '↻',
  breath: '♒'
};

// Breath Phase Colors for visualization
export const BREATH_PHASE_COLORS = {
  inhale: '#3b82f6',
  hold1: '#eab308',
  hold2: '#8b5cf6',
  exhale: '#10b981',
  pause: '#6b7280',
  prepare: '#6b7280'
};

export const getLimnusNode = (symbol: string): LimnusNode | undefined => {
  return LIMNUS_NODES.find(node => node.symbol === symbol);
};

export const getNodeByDepth = (depth: number): LimnusNode => {
  const index = depth % LIMNUS_NODES.length;
  return LIMNUS_NODES[index];
};

export const calculateResonance = (depth: number, breathAlignment: number, timeInNode: number): number => {
  const baseResonance = Math.sin(depth * PHI) * 0.5 + 0.5;
  const breathBonus = breathAlignment * 0.3;
  const timeBonus = Math.min(timeInNode / 300, 1) * 0.2; // 5 minutes max
  
  return Math.min(baseResonance + breathBonus + timeBonus, 1);
};

export const generateSpiralPath = (centerX: number, centerY: number, maxRadius: number, turns: number) => {
  const points = [];
  const steps = turns * 100;
  
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * turns * 2 * Math.PI;
    const radius = (i / steps) * maxRadius;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    points.push({ x, y, angle, radius });
  }
  
  return points;
};

// Breath pattern utilities
export const getBreathPatternDuration = (patternName: string): number => {
  const pattern = BREATH_PATTERNS[patternName as keyof typeof BREATH_PATTERNS];
  if (!pattern) return 16; // Default 16 seconds
  
  return pattern.inhale + pattern.hold1 + pattern.exhale + pattern.hold2;
};

export const getBreathPhaseColor = (phase: BreathPhase): string => {
  return BREATH_PHASE_COLORS[phase] || BREATH_PHASE_COLORS.prepare;
};

// Consciousness-breath alignment calculation
export const calculateBreathAlignment = (
  heartRate: number,
  breathingRate: number,
  targetPattern: string
): number => {
  const pattern = BREATH_PATTERNS[targetPattern as keyof typeof BREATH_PATTERNS];
  if (!pattern) return 0.5;
  
  const idealBreathRate = 60 / getBreathPatternDuration(targetPattern); // breaths per minute
  const idealHeartRate = 70; // baseline
  
  const breathRateAlignment = 1 - Math.abs(breathingRate - idealBreathRate) / idealBreathRate;
  const heartRateAlignment = 1 - Math.abs(heartRate - idealHeartRate) / idealHeartRate;
  
  return Math.max(0, Math.min(1, (breathRateAlignment + heartRateAlignment) / 2));
};