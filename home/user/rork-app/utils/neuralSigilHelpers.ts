// This file is a duplicate - using the main utils at /utils/neuralSigilHelpers.ts
export * from '@/utils/neuralSigilHelpers';

/*
/**
 * Neural Sigil Helper Functions
 * Provides utilities for generating and analyzing neural sigils
 */

export function generateSigilVector(data: any): number[] {
  // Generate 64-dimensional vector based on content
  const vector = new Array(64).fill(0);
  
  const text = data.text || data.content || '';
  const words = text.toLowerCase().split(/\s+/).filter((w: string) => w.length > 0);
  
  // Encode different aspects into vector dimensions
  // 0-15: Emotional tone
  const emotionalWords = ['fear', 'joy', 'anger', 'love', 'peace', 'anxiety', 'excitement', 'calm'];
  emotionalWords.forEach((word, i) => {
    if (i < 16) {
      vector[i] = words.filter((w: string) => w.includes(word)).length / Math.max(1, words.length);
    }
  });
  
  // 16-31: Symbolic content
  const symbols = ['water', 'fire', 'earth', 'air', 'light', 'dark', 'spiral', 'circle', 'tree', 'mountain'];
  symbols.forEach((symbol, i) => {
    if (i + 16 < 32) {
      vector[i + 16] = words.filter((w: string) => w.includes(symbol)).length / Math.max(1, words.length);
    }
  });
  
  // 32-47: Narrative structure
  const narrativeMarkers = ['then', 'suddenly', 'after', 'before', 'while', 'during', 'next', 'finally'];
  narrativeMarkers.forEach((marker, i) => {
    if (i + 32 < 48) {
      vector[i + 32] = words.filter((w: string) => w.includes(marker)).length / Math.max(1, words.length);
    }
  });
  
  // 48-63: Consciousness depth indicators
  const consciousnessWords = ['dream', 'lucid', 'aware', 'conscious', 'reality', 'vision', 'insight', 'awakening'];
  consciousnessWords.forEach((word, i) => {
    if (i + 48 < 64) {
      vector[i + 48] = words.filter((w: string) => w.includes(word)).length / Math.max(1, words.length);
    }
  });
  
  // Normalize vector to prevent all zeros
  const sum = vector.reduce((a, b) => a + b, 0);
  if (sum === 0) {
    // Create a basic hash-based vector if no patterns found
    for (let i = 0; i < 64; i++) {
      vector[i] = (text.charCodeAt(i % text.length) % 100) / 100;
    }
  }
  
  return vector;
}

export function detectBrainRegion(data: any): string {
  const text = (data.text || data.content || '').toLowerCase();
  
  // Analyze content to determine primary brain region
  const emotionalWords = ['fear', 'anger', 'love', 'joy', 'sadness', 'excitement', 'passion'];
  const logicalWords = ['think', 'analyze', 'understand', 'reason', 'logic', 'plan', 'calculate'];
  const primalWords = ['survival', 'hunger', 'thirst', 'danger', 'instinct', 'reflex', 'automatic'];
  const integrationWords = ['balance', 'harmony', 'connection', 'unity', 'synthesis', 'integration'];
  
  const emotionalCount = emotionalWords.filter(word => text.includes(word)).length;
  const logicalCount = logicalWords.filter(word => text.includes(word)).length;
  const primalCount = primalWords.filter(word => text.includes(word)).length;
  const integrationCount = integrationWords.filter(word => text.includes(word)).length;
  
  // Determine dominant brain region
  const scores = {
    limbic: emotionalCount,
    cortical: logicalCount,
    brainstem: primalCount,
    thalamic: integrationCount
  };
  
  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'limbic'; // Default to limbic
  
  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] || 'limbic';
}

export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    console.warn('Vector lengths do not match, padding shorter vector');
    const maxLength = Math.max(vec1.length, vec2.length);
    vec1 = [...vec1, ...new Array(maxLength - vec1.length).fill(0)];
    vec2 = [...vec2, ...new Array(maxLength - vec2.length).fill(0)];
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

export function extractKeySymbols(dreamText: string): string {
  const text = dreamText.toLowerCase();
  const symbolCategories = {
    elements: ['water', 'fire', 'earth', 'air', 'wind', 'rain', 'snow'],
    nature: ['tree', 'forest', 'mountain', 'ocean', 'river', 'flower', 'animal'],
    structures: ['house', 'building', 'bridge', 'door', 'window', 'stairs'],
    people: ['mother', 'father', 'child', 'friend', 'stranger', 'teacher'],
    emotions: ['fear', 'love', 'anger', 'joy', 'peace', 'anxiety'],
    actions: ['flying', 'falling', 'running', 'climbing', 'swimming', 'dancing'],
    mystical: ['light', 'darkness', 'spiral', 'circle', 'crystal', 'energy']
  };
  
  const foundSymbols: string[] = [];
  
  Object.entries(symbolCategories).forEach(([category, symbols]) => {
    symbols.forEach(symbol => {
      if (text.includes(symbol)) {
        foundSymbols.push(symbol);
      }
    });
  });
  
  return foundSymbols.slice(0, 5).join(', ') || 'abstract, symbolic';
}

export function analyzePatternConnections(
  matches: Array<{sigil: any, similarity: number}>
): string {
  if (matches.length === 0) return 'No pattern connections found';
  
  const brainRegions = matches.map(m => m.sigil.brainRegion).filter(Boolean);
  const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
  
  const regionCounts = brainRegions.reduce((acc, region) => {
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const dominantRegion = Object.entries(regionCounts)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown';
  
  const timeSpan = calculateTimeSpan(matches);
  
  return `Dominant brain region: ${dominantRegion}\n` +
         `Average resonance strength: ${(avgSimilarity * 100).toFixed(0)}%\n` +
         `Pattern spanning ${timeSpan} days\n` +
         `Total connections: ${matches.length}`;
}

export function calculateTimeSpan(matches: Array<{sigil: any}>): number {
  if (matches.length === 0) return 0;
  
  const timestamps = matches
    .map(m => m.sigil.timestamp)
    .filter(t => typeof t === 'number')
    .sort((a, b) => a - b);
  
  if (timestamps.length < 2) return 0;
  
  const spanMs = timestamps[timestamps.length - 1] - timestamps[0];
  return Math.ceil(spanMs / (1000 * 60 * 60 * 24)); // Convert to days
}

export function findMostCommon<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  
  const counts = array.reduce((acc, item) => {
    acc[String(item)] = (acc[String(item)] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const maxCount = Math.max(...Object.values(counts));
  const mostCommon = Object.entries(counts).find(([, count]) => count === maxCount)?.[0];
  
  return array.find(item => String(item) === mostCommon);
}

export function countEmotionalWords(text: string): number {
  const emotionalWords = [
    'fear', 'anger', 'love', 'joy', 'sadness', 'excitement', 'passion',
    'anxiety', 'peace', 'happiness', 'worry', 'hope', 'despair', 'bliss'
  ];
  
  const lowerText = text.toLowerCase();
  return emotionalWords.filter(word => lowerText.includes(word)).length;
}

export function analyzeLogicalStructure(text: string): number {
  const logicalMarkers = [
    'because', 'therefore', 'however', 'although', 'since', 'thus',
    'consequently', 'furthermore', 'moreover', 'nevertheless'
  ];
  
  const lowerText = text.toLowerCase();
  return logicalMarkers.filter(marker => lowerText.includes(marker)).length;
}

export function detectPrimalThemes(text: string): number {
  const primalWords = [
    'survival', 'danger', 'threat', 'escape', 'hunt', 'prey', 'predator',
    'instinct', 'reflex', 'automatic', 'primitive', 'basic', 'fundamental'
  ];
  
  const lowerText = text.toLowerCase();
  const primalCount = primalWords.filter(word => lowerText.includes(word)).length;
  const totalWords = text.split(/\s+/).length;
  
  return totalWords > 0 ? primalCount / totalWords : 0;
}