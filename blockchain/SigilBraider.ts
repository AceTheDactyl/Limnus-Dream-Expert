import { NeuralSigil, SigilGenerator } from '@/models/neural-sigil/sigilGenerator';

export interface BraidPattern {
  id: string;
  type: 'temporal' | 'causal' | 'resonant' | 'symbolic';
  strength: number;
  participants: string[];
  emergentProperties: Map<string, any>;
}

export interface BraidResult {
  id: string;
  timestamp: number;
  participantSigils: string[];
  combinedPattern: Float32Array;
  braidStrength: number;
  emergentProperties: Map<string, any>;
  patterns: BraidPattern[];
  metadata: {
    braidType: 'consciousness' | 'dream' | 'meditation';
    complexity: number;
    resonance: number;
    stability: number;
  };
}

export class SigilBraider {
  async braid(sigils: NeuralSigil[]): Promise<BraidResult> {
    if (sigils.length < 2) {
      throw new Error('At least 2 sigils required for braiding');
    }

    const timestamp = Date.now();
    const id = `braid_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Analyze braid patterns
    const patterns = this.analyzeBraidPattern(sigils);
    
    // Combine patterns using weighted average
    const combinedPattern = this.combinePatterns(sigils);
    
    // Calculate braid strength based on pattern similarities
    const braidStrength = this.calculateBraidStrength(sigils, patterns);
    
    // Extract emergent properties
    const emergentProperties = this.extractEmergentProperties(sigils, patterns);
    
    // Calculate metadata
    const metadata = {
      braidType: this.determineBraidType(sigils),
      complexity: this.calculateComplexity(sigils),
      resonance: this.calculateResonance(sigils),
      stability: this.calculateStability(patterns)
    };

    return {
      id,
      timestamp,
      participantSigils: sigils.map(s => s.id),
      combinedPattern,
      braidStrength,
      emergentProperties,
      patterns,
      metadata
    };
  }

  private combinePatterns(sigils: NeuralSigil[]): Float32Array {
    const patternLength = sigils[0].pattern.length;
    const combined = new Float32Array(patternLength);
    
    // Weighted combination based on sigil strength
    const totalWeight = sigils.reduce((sum, sigil) => sum + (sigil.metadata?.strength || 1), 0);
    
    for (let i = 0; i < patternLength; i++) {
      let weightedSum = 0;
      for (const sigil of sigils) {
        const weight = (sigil.metadata?.strength || 1) / totalWeight;
        weightedSum += sigil.pattern[i] * weight;
      }
      combined[i] = weightedSum;
    }
    
    return combined;
  }

  private calculateBraidStrength(sigils: NeuralSigil[], patterns: BraidPattern[]): number {
    // Base strength on pattern count and strength
    const patternStrength = patterns.reduce((sum, pattern) => sum + pattern.strength, 0) / patterns.length;
    
    // Factor in sigil count (more sigils = potentially stronger braid)
    const countFactor = Math.min(1, sigils.length / 5);
    
    // Factor in temporal proximity
    const timestamps = sigils.map(s => s.timestamp).sort((a, b) => a - b);
    const timeSpan = timestamps[timestamps.length - 1] - timestamps[0];
    const temporalFactor = Math.max(0.1, 1 - (timeSpan / (24 * 60 * 60 * 1000))); // Decay over 24 hours
    
    return (patternStrength * 0.5 + countFactor * 0.3 + temporalFactor * 0.2);
  }

  private extractEmergentProperties(sigils: NeuralSigil[], patterns: BraidPattern[]): Map<string, any> {
    const properties = new Map<string, any>();
    
    // Combine all emergent properties from patterns
    for (const pattern of patterns) {
      for (const [key, value] of pattern.emergentProperties) {
        if (properties.has(key)) {
          // Merge or combine existing properties
          const existing = properties.get(key);
          if (Array.isArray(existing) && Array.isArray(value)) {
            properties.set(key, [...existing, ...value]);
          } else if (typeof existing === 'number' && typeof value === 'number') {
            properties.set(key, (existing + value) / 2);
          }
        } else {
          properties.set(key, value);
        }
      }
    }
    
    // Add braid-specific properties
    properties.set('sigilCount', sigils.length);
    properties.set('brainRegions', this.extractUniqueBrainRegions(sigils));
    properties.set('emotionalSignatures', sigils.map(s => s.metadata?.emotionalFingerprint).filter(Boolean));
    properties.set('temporalSpan', this.calculateTemporalSpan(sigils));
    
    return properties;
  }

  private determineBraidType(sigils: NeuralSigil[]): 'consciousness' | 'dream' | 'meditation' {
    // Determine type based on sigil metadata
    const types = sigils.map(s => s.metadata?.type).filter(Boolean);
    const typeCounts = types.reduce((counts, type) => {
      counts[type] = (counts[type] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    // Return most common type - fix TypeScript error by properly typing the sort parameters
    const mostCommon = Object.entries(typeCounts).sort(([, a], [, b]) => (b as number) - (a as number))[0];
    return (mostCommon?.[0] as any) || 'consciousness';
  }

  private calculateComplexity(sigils: NeuralSigil[]): number {
    // Complexity based on pattern variance and metadata richness
    const patternVariance = this.calculatePatternVariance(sigils);
    const metadataRichness = sigils.reduce((sum, sigil) => {
      return sum + Object.keys(sigil.metadata || {}).length;
    }, 0) / sigils.length;
    
    return Math.min(1, (patternVariance * 0.7 + metadataRichness / 20 * 0.3));
  }

  private calculateResonance(sigils: NeuralSigil[]): number {
    // Calculate average similarity between all sigil pairs
    let totalSimilarity = 0;
    let pairCount = 0;
    
    for (let i = 0; i < sigils.length - 1; i++) {
      for (let j = i + 1; j < sigils.length; j++) {
        const similarity = this.calculateSimilarity(sigils[i], sigils[j]);
        totalSimilarity += similarity;
        pairCount++;
      }
    }
    
    return pairCount > 0 ? totalSimilarity / pairCount : 0;
  }

  private calculateStability(patterns: BraidPattern[]): number {
    // Stability based on pattern consistency and strength
    if (patterns.length === 0) return 0;
    
    const avgStrength = patterns.reduce((sum, p) => sum + p.strength, 0) / patterns.length;
    const strengthVariance = patterns.reduce((sum, p) => sum + Math.pow(p.strength - avgStrength, 2), 0) / patterns.length;
    
    // Lower variance = higher stability
    return Math.max(0, 1 - strengthVariance);
  }

  private calculatePatternVariance(sigils: NeuralSigil[]): number {
    if (sigils.length < 2) return 0;
    
    const patternLength = sigils[0].pattern.length;
    let totalVariance = 0;
    
    for (let i = 0; i < patternLength; i++) {
      const values = sigils.map(s => s.pattern[i]);
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      totalVariance += variance;
    }
    
    return totalVariance / patternLength;
  }

  private calculateSimilarity(sigil1: NeuralSigil, sigil2: NeuralSigil): number {
    // Simple cosine similarity
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < sigil1.pattern.length; i++) {
      dotProduct += sigil1.pattern[i] * sigil2.pattern[i];
      norm1 += sigil1.pattern[i] * sigil1.pattern[i];
      norm2 += sigil2.pattern[i] * sigil2.pattern[i];
    }
    
    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  private extractUniqueBrainRegions(sigils: NeuralSigil[]): string[] {
    const regions = new Set<string>();
    for (const sigil of sigils) {
      if (sigil.metadata?.brainRegions) {
        for (const region of sigil.metadata.brainRegions) {
          regions.add(region.name || region);
        }
      }
      if (sigil.brainRegion) {
        regions.add(sigil.brainRegion);
      }
    }
    return Array.from(regions);
  }

  private calculateTemporalSpan(sigils: NeuralSigil[]): number {
    const timestamps = sigils.map(s => s.timestamp);
    const min = Math.min(...timestamps);
    const max = Math.max(...timestamps);
    return max - min;
  }

  analyzeBraidPattern(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    // Temporal patterns - sigils that occur in sequence
    const temporalPatterns = this.findTemporalPatterns(sigils);
    patterns.push(...temporalPatterns);
    
    // Causal patterns - sigils that trigger other sigils
    const causalPatterns = this.findCausalPatterns(sigils);
    patterns.push(...causalPatterns);
    
    // Resonant patterns - sigils with high similarity
    const resonantPatterns = this.findResonantPatterns(sigils);
    patterns.push(...resonantPatterns);
    
    // Symbolic patterns - sigils sharing brain regions or metadata
    const symbolicPatterns = this.findSymbolicPatterns(sigils);
    patterns.push(...symbolicPatterns);
    
    return patterns;
  }
  
  private findTemporalPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    const sorted = [...sigils].sort((a, b) => a.timestamp - b.timestamp);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const timeDiff = sorted[i + 1].timestamp - sorted[i].timestamp;
      
      // If sigils occur within 5 minutes, consider them temporally linked
      if (timeDiff < 5 * 60 * 1000) {
        const emergentProperties = new Map<string, any>();
        emergentProperties.set('timeDiff', timeDiff);
        emergentProperties.set('sequence', [sorted[i].id, sorted[i + 1].id]);
        
        patterns.push({
          id: `temporal_${sorted[i].id}_${sorted[i + 1].id}`,
          type: 'temporal',
          strength: 1 - (timeDiff / (5 * 60 * 1000)),
          participants: [sorted[i].id, sorted[i + 1].id],
          emergentProperties
        });
      }
    }
    
    return patterns;
  }
  
  private findCausalPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    // Analyze metadata and content for causal relationships
    const patterns: BraidPattern[] = [];
    
    for (const sigil of sigils) {
      if (sigil.metadata?.triggeredBy) {
        const trigger = sigils.find(s => s.id === sigil.metadata?.triggeredBy);
        if (trigger) {
          const emergentProperties = new Map<string, any>();
          emergentProperties.set('cause', trigger.id);
          emergentProperties.set('effect', sigil.id);
          
          patterns.push({
            id: `causal_${trigger.id}_${sigil.id}`,
            type: 'causal',
            strength: 0.9,
            participants: [trigger.id, sigil.id],
            emergentProperties
          });
        }
      }
    }
    
    return patterns;
  }
  
  private findResonantPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    for (let i = 0; i < sigils.length - 1; i++) {
      for (let j = i + 1; j < sigils.length; j++) {
        const similarity = this.calculateSimilarity(sigils[i], sigils[j]);
        
        if (similarity > 0.8) {
          const emergentProperties = new Map<string, any>();
          emergentProperties.set('similarity', similarity);
          emergentProperties.set('resonance', 'high');
          
          patterns.push({
            id: `resonant_${sigils[i].id}_${sigils[j].id}`,
            type: 'resonant',
            strength: similarity,
            participants: [sigils[i].id, sigils[j].id],
            emergentProperties
          });
        }
      }
    }
    
    return patterns;
  }
  
  private findSymbolicPatterns(sigils: NeuralSigil[]): BraidPattern[] {
    const patterns: BraidPattern[] = [];
    
    // Group by brain region
    const regionGroups = new Map<string, NeuralSigil[]>();
    for (const sigil of sigils) {
      const group = regionGroups.get(sigil.brainRegion) || [];
      group.push(sigil);
      regionGroups.set(sigil.brainRegion, group);
    }
    
    // Create patterns for groups with multiple sigils
    for (const [region, group] of regionGroups) {
      if (group.length > 2) {
        const emergentProperties = new Map<string, any>();
        emergentProperties.set('region', region);
        emergentProperties.set('count', group.length);
        
        patterns.push({
          id: `symbolic_${region}_${Date.now()}`,
          type: 'symbolic',
          strength: group.length / sigils.length,
          participants: group.map(s => s.id),
          emergentProperties
        });
      }
    }
    
    return patterns;
  }
}