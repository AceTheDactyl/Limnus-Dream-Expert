import { NeuralSigil } from './sigilGenerator';

export interface PatternCluster {
  id: string;
  centroid: number[];
  members: string[];
  strength: number;
  label: string;
}

export interface SimilarPattern {
  patternId: string;
  similarity: number;
  instances: number;
  lastSeen: number;
}

export interface ClusterResult {
  clusters: PatternCluster[];
  dominantPatterns: string[];
  temporalFlow: TemporalPattern[];
}

export interface TemporalPattern {
  timeRange: { start: number; end: number };
  dominantBrainRegion: string;
  averageStrength: number;
  transitionProbabilities: Map<string, number>;
}

export class PatternRecognizer {
  private patterns: Map<string, PatternData> = new Map();
  
  async findSimilarPatterns(
    sigil: NeuralSigil, 
    threshold: number = 0.7
  ): Promise<SimilarPattern[]> {
    const similar: SimilarPattern[] = [];
    
    for (const [id, pattern] of this.patterns) {
      const similarity = this.cosineSimilarity(sigil.pattern, pattern.centroid);
      if (similarity >= threshold) {
        similar.push({
          patternId: id,
          similarity,
          instances: pattern.instances.length,
          lastSeen: pattern.lastSeen
        });
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }
  
  async clusterSigils(sigils: NeuralSigil[]): Promise<ClusterResult> {
    const k = Math.min(10, Math.floor(sigils.length / 5));
    const clusters = await this.kMeansClustering(sigils, k);
    
    return {
      clusters,
      dominantPatterns: this.extractDominantPatterns(clusters),
      temporalFlow: this.analyzeTemporalFlow(sigils)
    };
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
  
  private async kMeansClustering(sigils: NeuralSigil[], k: number): Promise<PatternCluster[]> {
    // Simplified k-means implementation
    const clusters: PatternCluster[] = [];
    // ... k-means logic
    return clusters;
  }
  
  private extractDominantPatterns(clusters: PatternCluster[]): string[] {
    return clusters
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3)
      .map(c => c.id);
  }
  
  private analyzeTemporalFlow(sigils: NeuralSigil[]): TemporalPattern[] {
    // Analyze how patterns change over time
    const patterns: TemporalPattern[] = [];
    // ... temporal analysis logic
    return patterns;
  }
}

interface PatternData {
  id: string;
  centroid: number[];
  instances: NeuralSigil[];
  firstSeen: number;
  lastSeen: number;
}