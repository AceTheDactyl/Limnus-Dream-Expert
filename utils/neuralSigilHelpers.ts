/**
 * Neural Sigil Helper Functions
 * Provides utilities for generating and analyzing neural sigils
 */

// Simple word analysis functions
const emotionalWords = ['love', 'fear', 'joy', 'anger', 'sad', 'happy', 'excited', 'calm', 'anxious', 'peaceful'];
const logicalWords = ['because', 'therefore', 'analyze', 'calculate', 'reason', 'logic', 'structure', 'system'];
const primalWords = ['survival', 'hunger', 'thirst', 'danger', 'safety', 'instinct', 'primitive', 'basic'];

function countEmotionalWords(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter((w: string) => emotionalWords.includes(w)).length;
}

function analyzeLogicalStructure(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter((w: string) => logicalWords.includes(w)).length;
}

function detectPrimalThemes(text: string): number {
  const words = text.toLowerCase().split(/\s+/);
  const primalCount = words.filter((w: string) => primalWords.includes(w)).length;
  return primalCount / Math.max(1, words.length);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude > 0 ? vector.map(val => val / magnitude) : vector;
}

/**
 * Generate a 64-dimensional vector from input data
 */
export function generateSigilVector(data: any): number[] {
  const vector = new Array(64).fill(0);
  const text = data.text || data.content || '';
  
  if (!text) {
    // Return a default vector if no text
    return vector.map(() => Math.random() * 0.5 + 0.25);
  }
  
  // Hash-based encoding for consistency
  const hash = hashString(text);
  const words = text.toLowerCase().split(/\s+/);
  
  // 0-15: Emotional tone encoding
  const emotionalCount = countEmotionalWords(text);
  for (let i = 0; i < 16; i++) {
    vector[i] = ((hash + i) % 100) / 100 * (emotionalCount + 1) / 10;
  }
  
  // 16-31: Symbolic content encoding
  const symbolicWords = ['water', 'fire', 'earth', 'air', 'light', 'dark', 'spiral', 'circle'];
  for (let i = 16; i < 32; i++) {
    const symbolIndex = i - 16;
    const hasSymbol = symbolIndex < symbolicWords.length && 
                     text.toLowerCase().includes(symbolicWords[symbolIndex]);
    vector[i] = hasSymbol ? 0.8 + Math.random() * 0.2 : Math.random() * 0.3;
  }
  
  // 32-47: Narrative structure encoding
  const logicalCount = analyzeLogicalStructure(text);
  for (let i = 32; i < 48; i++) {
    vector[i] = ((hash * (i - 31)) % 100) / 100 * (logicalCount + 1) / 5;
  }
  
  // 48-63: Consciousness depth encoding
  const primalRatio = detectPrimalThemes(text);
  const wordCount = words.length;
  for (let i = 48; i < 64; i++) {
    vector[i] = (primalRatio + (wordCount / 100) + ((hash + i) % 50) / 50) / 3;
  }
  
  // Normalize to prevent extreme values
  return normalizeVector(vector);
}

/**
 * Detect the primary brain region based on content analysis
 */
export function detectBrainRegion(data: any): string {
  const text = data.text || data.content || '';
  
  if (!text) return 'Thalamic';
  
  const emotionalWords = countEmotionalWords(text);
  const logicalStructure = analyzeLogicalStructure(text);
  const primalThemes = detectPrimalThemes(text);
  
  if (primalThemes > 0.1) return 'Brainstem';
  if (emotionalWords > logicalStructure) return 'Limbic';
  if (logicalStructure > emotionalWords * 1.5) return 'Cortical';
  return 'Thalamic'; // Integration state
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length !== vec2.length) {
    console.warn('Vector length mismatch in cosine similarity calculation');
    return 0;
  }
  
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;
  
  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i];
    norm1 += vec1[i] * vec1[i];
    norm2 += vec2[i] * vec2[i];
  }
  
  const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
  return magnitude > 0 ? dotProduct / magnitude : 0;
}

/**
 * Extract key symbols/themes from dream text
 */
export function extractKeySymbols(dreamText: string): string {
  const symbolicWords = ['water', 'fire', 'earth', 'air', 'light', 'dark', 'spiral', 'circle', 
                        'flying', 'falling', 'running', 'climbing', 'ocean', 'mountain', 
                        'forest', 'desert', 'city', 'home', 'door', 'window', 'bridge'];
  
  const words = dreamText.toLowerCase().split(/\s+/);
  const foundSymbols = symbolicWords.filter(symbol => 
    words.some(word => word.includes(symbol))
  );
  
  return foundSymbols.length > 0 ? foundSymbols.slice(0, 3).join(', ') : 'transformation, journey';
}

/**
 * Find the most common element in an array
 */
export function findMostCommon<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined;
  
  const counts = arr.reduce((acc, item) => {
    acc[String(item)] = (acc[String(item)] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommon = Object.entries(counts)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  
  return mostCommon ? arr.find(item => String(item) === mostCommon[0]) : arr[0];
}

/**
 * Calculate time span between matches
 */
export function calculateTimeSpan(matches: Array<{sigil: {timestamp: number}}>): number {
  if (matches.length < 2) return 0;
  
  const timestamps = matches.map(m => m.sigil.timestamp).sort((a, b) => a - b);
  const spanMs = timestamps[timestamps.length - 1] - timestamps[0];
  return Math.ceil(spanMs / (1000 * 60 * 60 * 24)); // Convert to days
}

/**
 * Analyze pattern connections between similar sigils
 */
export function analyzePatternConnections(
  matches: Array<{sigil: any, similarity: number}>
): string {
  if (matches.length === 0) return 'No patterns detected';
  
  const brainRegions = matches.map(m => m.sigil.brainRegion).filter(Boolean);
  const dominantRegion = findMostCommon(brainRegions) || 'unknown';
  
  const avgSimilarity = matches.reduce((sum, m) => sum + m.similarity, 0) / matches.length;
  const timeSpan = calculateTimeSpan(matches);
  
  let analysis = `Dominant brain region: ${dominantRegion}\n`;
  analysis += `Average resonance strength: ${(avgSimilarity * 100).toFixed(0)}%\n`;
  
  if (timeSpan > 0) {
    analysis += `Pattern spanning ${timeSpan} days\n`;
  }
  
  // Add insights based on brain region
  switch (dominantRegion) {
    case 'limbic':
      analysis += 'Strong emotional processing patterns detected';
      break;
    case 'cortical':
      analysis += 'Analytical and cognitive processing patterns detected';
      break;
    case 'brainstem':
      analysis += 'Primal and survival-oriented patterns detected';
      break;
    case 'thalamic':
      analysis += 'Integrative consciousness patterns detected';
      break;
    default:
      analysis += 'Mixed consciousness patterns detected';
  }
  
  return analysis;
}