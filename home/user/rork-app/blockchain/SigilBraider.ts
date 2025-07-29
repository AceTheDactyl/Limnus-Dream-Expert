import { NeuralSigil, SigilGenerator } from '@/models/neural-sigil/sigilGenerator';

export interface BraidPattern {
  id: string;
  type: 'temporal' | 'causal' | 'resonant' | 'symbolic';
  strength: number;
  participants: string[];
  emergentProperties: Map<string, any>;
}

export class SigilBraider {
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
    const generator = SigilGenerator.getInstance();
    
    for (let i = 0; i < sigils.length - 1; i++) {
      for (let j = i + 1; j < sigils.length; j++) {
        const similarity = generator.calculateSimilarity(sigils[i], sigils[j]);
        
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