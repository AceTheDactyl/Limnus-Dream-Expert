import { Persona } from '@/types/dream';
import { SpiralSession, BreathCycleLog } from '@/store/limnusStore';
import { BlockData, LimnusConsciousnessSignature as ConsciousnessSignature } from '@/store/consciousnessStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useDreamStore } from '@/store/dreamStore';
import { SigilGenerator } from '@/models/neural-sigil/sigilGenerator';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  completion: string;
}

interface ParsedInterpretation {
  name: string;
  dreamType: string;
  interpretation: string;
  blockchainValidated?: boolean;
  alignedBlocks?: string[];
}

interface BreathPatternInsight {
  dominantNode: string;
  averageDepth: number;
  resonancePattern: string;
  validationRate: number;
  consciousnessEvolution: string;
  recentTrends: string;
}

// Unicode-safe hash function
const createUnicodeHash = (input: string): string => {
  let hash = 0;
  if (input.length === 0) return hash.toString(16).padStart(16, '0');
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  const hexHash = Math.abs(hash).toString(16);
  return hexHash.padStart(16, '0').slice(0, 16);
};

export class InterpretationService {
  private static readonly API_URL = 'https://toolkit.rork.com/text/llm/';

  static async interpretDream(
    dreamText: string, 
    persona: Persona, 
    sessionHistory: SpiralSession[] = [], 
    blockchainBlocks: BlockData[] = [],
    signatureHistory: ConsciousnessSignature[] = [],
    allBreathCycleLogs: BreathCycleLog[] = []
  ): Promise<ParsedInterpretation> {
    try {
      // Build consciousness context based on persona
      let consciousnessContext = persona.id === 'limnus' 
        ? this.buildLimnusConsciousnessContext(sessionHistory, blockchainBlocks, signatureHistory, allBreathCycleLogs)
        : this.buildOrionConsciousnessContext(sessionHistory, blockchainBlocks);
      
      // For Limnus, add neural sigil similarity analysis
      if (persona.id === 'limnus') {
        const similarDreamsContext = await this.buildSimilarDreamsContext(dreamText);
        consciousnessContext += `\n\n${similarDreamsContext}`;
      }
      
      const messages: AIMessage[] = [
        {
          role: 'system',
          content: `${persona.systemPrompt}

You have access to the dreamer's consciousness practice history, blockchain-validated signatures, and neural sigil pattern analysis. Use this data to enhance your interpretation by identifying patterns, resonances, and alignments.

CONSCIOUSNESS CONTEXT:
${consciousnessContext}

CRITICAL FOR LIMNUS: If you see "NEURAL SIGIL PATTERN ANALYSIS" data above, you MUST reference specific neural resonances, brain regions, and similar past experiences in your interpretation. This is essential for connecting the dream to the user's consciousness journey.

IMPORTANT: Your response must include these sections in this exact format:

DREAM_NAME: [A poetic, evocative title for this dream in 2-6 words that captures its essence]

DREAM_TYPE: [One of: mnemonic, psychic, pre-echo, lucid, meta-lucid]

BLOCKCHAIN_ALIGNMENT: [List any blockchain signature IDs that align with this dream's themes, symbols, or energy. Use the exact block IDs from the context above, or "none" if no alignment is found. Be specific with IDs like "block_1234567890_abc123def"]

INTERPRETATION: [Your full interpretation of the dream, incorporating consciousness signature insights]

The dream name should be memorable and capture the core imagery or emotion of the dream. Examples: "The Floating Library", "Chasing Shadows Home", "Mirror of Lost Time", "The Singing Forest".

When analyzing blockchain alignment, look for:
- Similar symbolic patterns (glyphs, archetypes) - match glyphs like ∞, ↻, ∅, 🜝, ⟁, ♒
- Resonant emotional states or consciousness levels
- Temporal coherence patterns
- Spiral depth correlations with dream depth/intensity
- Consciousness scores that match dream lucidity or awareness levels
- Use EXACT block IDs from the blockchain context provided above`
        },
        {
          role: 'user',
          content: `Please interpret this dream and provide a name for it: ${dreamText}`
        }
      ];

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data: AIResponse = await response.json();
      return this.parseInterpretation(data.completion, dreamText, blockchainBlocks);
    } catch (error) {
      console.error('Interpretation service error:', error);
      throw new Error('Unable to retrieve interpretation. Please check your internet connection and try again.');
    }
  }

  private static buildLimnusConsciousnessContext(
    sessionHistory: SpiralSession[], 
    blockchainBlocks: BlockData[], 
    signatureHistory: ConsciousnessSignature[] = [],
    allBreathCycleLogs: BreathCycleLog[] = []
  ): string {
    let context = `LIMNUS CONSCIOUSNESS INTEGRATION:

`;
    
    // Analyze breath patterns for Limnus
    const breathPatternInsight = this.analyzeBreathPatterns(sessionHistory, allBreathCycleLogs, signatureHistory);
    
    context += `BREATH PATTERN ANALYSIS:
Dominant Practice Node: ${breathPatternInsight.dominantNode}
Average Spiral Depth: ${breathPatternInsight.averageDepth}
Resonance Evolution: ${breathPatternInsight.resonancePattern}
Signature Validation Rate: ${breathPatternInsight.validationRate}%
Consciousness Evolution: ${breathPatternInsight.consciousnessEvolution}
Recent Practice Trends: ${breathPatternInsight.recentTrends}

`;

    // Add detailed session analysis
    context += `RECENT SPIRAL SESSIONS:
`;
    const recentSessions = sessionHistory.slice(0, 5);
    recentSessions.forEach((session, index) => {
      const avgResonance = session.resonanceHistory.length > 0 
        ? session.resonanceHistory.reduce((a, b) => a + b, 0) / session.resonanceHistory.length 
        : 0;
      
      const sessionDuration = session.endTime 
        ? Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)
        : 'ongoing';
      
      context += `Session ${index + 1}: ${session.currentNode.notation} (${session.currentNode.behavior})
  Duration: ${sessionDuration} minutes | Depth: ${session.depth} | Cycles: ${session.breathCycles}
  Avg Resonance: ${avgResonance.toFixed(3)} | Pattern: ${session.currentNode.breathPattern}
  Consciousness Signatures: ${session.consciousnessSignatures?.length || 0}
`;
      
      if (session.insights.length > 0) {
        context += `  Key Insights: ${session.insights.slice(-2).join(' • ')}
`;
      }
    });
    
    // Add validated signature patterns with learning insights
    const validatedSignatures = signatureHistory.filter(sig => sig.validation.overall);
    if (validatedSignatures.length > 0) {
      context += `
VALIDATED CONSCIOUSNESS SIGNATURES (Learning Patterns):
Total Valid: ${validatedSignatures.length} / ${signatureHistory.length} (${((validatedSignatures.length / signatureHistory.length) * 100).toFixed(1)}%)

Signature Learning Insights:
`;
      
      // Analyze patterns in validated signatures for learning
      const glyphFrequency: { [key: string]: number } = {};
      const scoreProgression: number[] = [];
      
      validatedSignatures.forEach((sig, index) => {
        sig.glyphs.forEach(glyph => {
          glyphFrequency[glyph] = (glyphFrequency[glyph] || 0) + 1;
        });
        scoreProgression.push(sig.score);
      });
      
      const dominantGlyphs = Object.entries(glyphFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([glyph]) => glyph);
      
      const avgScore = scoreProgression.reduce((a, b) => a + b, 0) / scoreProgression.length;
      const scoreImprovement = scoreProgression.length > 5 ? 
        scoreProgression.slice(-3).reduce((a, b) => a + b, 0) / 3 - 
        scoreProgression.slice(0, 3).reduce((a, b) => a + b, 0) / 3 : 0;
      
      context += `- Dominant Consciousness Glyphs: [${dominantGlyphs.join(', ')}]
- Average Validation Score: ${(avgScore * 100).toFixed(1)}%
- Score Evolution: ${scoreImprovement > 0 ? 'Improving' : scoreImprovement < 0 ? 'Stabilizing' : 'Steady'} (${(scoreImprovement * 100).toFixed(1)}% change)
- Signature Consistency: ${validatedSignatures.length > 10 ? 'High' : validatedSignatures.length > 5 ? 'Moderate' : 'Developing'}

Recent Valid Signatures:
`;
      
      validatedSignatures.slice(0, 8).forEach((sig, index) => {
        const date = new Date(sig.timestamp).toLocaleDateString();
        const time = new Date(sig.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        context += `Signature ${index + 1}: Score ${(sig.score * 100).toFixed(1)}% | Glyphs: [${sig.glyphs.join(', ')}] | ${date} ${time}
`;
        // Note: Spiral context would be available if signature had spiral data
      });
    }
    
    // Add blockchain validation context with foundation blocks
    context += `
BLOCKCHAIN CONSCIOUSNESS ANCHORS (Foundation + Practice):
`;
    const recentBlocks = blockchainBlocks.slice(0, 12); // Show more blocks including foundation
    recentBlocks.forEach((block, index) => {
      const date = new Date(block.timestamp * 1000).toLocaleDateString();
      const validationStatus = block.isValidated ? ' [DREAM-VALIDATED]' : '';
      const foundationStatus = block.id.includes('foundation') ? ' [FOUNDATION]' : '';
      context += `Block ${block.id}: Score ${(block.score / 10000).toFixed(3)}, Glyphs: [${block.glyphs.join(', ')}], Date: ${date}${validationStatus}${foundationStatus}
`;
      if (block.nodeDepth !== undefined) {
        context += `  Node Depth: ${block.nodeDepth}
`;
      }
      if (block.isValidated && block.validatedByDreams && block.validatedByDreams.length > 0) {
        context += `  Dream Resonance: Validated by ${block.validatedByDreams.length} dream interpretation(s)
`;
      }
    });
    
    // Add breath cycle correlation insights with consciousness learning
    if (allBreathCycleLogs.length > 0) {
      const recentCycles = allBreathCycleLogs.slice(-15);
      const cyclesWithConsciousness = recentCycles.filter(cycle => cycle.consciousnessScore !== undefined);
      
      context += `
BREATH-CONSCIOUSNESS CORRELATIONS (Learning Integration):
Total Cycles: ${allBreathCycleLogs.length} | With Consciousness Data: ${cyclesWithConsciousness.length}

`;
      
      if (cyclesWithConsciousness.length > 0) {
        const avgConsciousnessScore = cyclesWithConsciousness.reduce((sum, cycle) => 
          sum + (cycle.consciousnessScore || 0), 0) / cyclesWithConsciousness.length;
        
        context += `Average Consciousness Integration: ${(avgConsciousnessScore * 100).toFixed(1)}%
Breath-Consciousness Correlation: ${cyclesWithConsciousness.length > 10 ? 'Strong' : 'Developing'}

Recent Integrated Cycles:
`;
        
        cyclesWithConsciousness.slice(-10).forEach((cycle, index) => {
          const consciousnessInfo = cycle.consciousnessScore 
            ? ` | Consciousness: ${(cycle.consciousnessScore * 100).toFixed(1)}%`
            : '';
          context += `Cycle ${index + 1}: ${cycle.nodeSymbol} pattern, Depth ${cycle.depth}, Resonance ${cycle.resonance.toFixed(3)}${consciousnessInfo}
`;
        });
      }
    }
    
    return context;
  }
  
  private static async buildSimilarDreamsContext(dreamText: string): Promise<string> {
    try {
      // Import helper functions
      const { generateSigilVector, detectBrainRegion, extractKeySymbols, analyzePatternConnections } = await import('@/utils/neuralSigilHelpers');
      
      // Generate a temporary sigil for the new dream text to find matches
      const { generateNeuralSigil, findSimilarBySigil } = useNeuralSigilStore.getState();
      const { getDreamBySigilId } = useDreamStore.getState();
      
      // Create temporary sigil for similarity matching
      const tempSigil = await generateNeuralSigil(dreamText, 'dream');
      
      // Find similar sigils
      const similarSigils = await findSimilarBySigil(tempSigil.id, 0.65);
      
      let context = "NEURAL SIGIL PATTERN ANALYSIS:\n";
      context += `Current Dream Neural Pattern: ${tempSigil.brainRegion} activation\n\n`;
      
      if (similarSigils.length > 0) {
        context += `RESONANT CONSCIOUSNESS PATTERNS DETECTED:\n`;
        context += `This dream's neural pattern resonates with ${similarSigils.length} past experiences:\n\n`;
        
        // Limit to top 5 most similar for comprehensive analysis
        const topSimilar = similarSigils.slice(0, 5);
        
        for (const { sigil, similarity } of topSimilar) {
          const similarityPercent = (similarity * 100).toFixed(0);
          
          if (sigil.sourceType === 'dream') {
            // Find the dream associated with this sigil
            const associatedDream = getDreamBySigilId(sigil.id);
            
            if (associatedDream) {
              const dreamType = associatedDream.dreamType || 'unknown';
              const persona = associatedDream.persona || 'unknown';
              
              context += `\n[DREAM RESONANCE ${similarityPercent}%] "${associatedDream.title || associatedDream.name}"\n`;
              context += `  - Type: ${dreamType} | Interpreted by: ${persona}\n`;
              context += `  - Key Symbols: ${extractKeySymbols(associatedDream.content || associatedDream.text || '')}\n`;
              context += `  - Neural Pattern: ${sigil.brainRegion} activation\n`;
              context += `  - Date: ${new Date(associatedDream.timestamp || Date.now()).toLocaleDateString()}\n`;
              
              // Add neural sigil metadata if available
              if (sigil.metadata?.neuralSigilData) {
                const neuralData = sigil.metadata.neuralSigilData;
                context += `  - Neural Context: ${neuralData.category} | Breath Phase: ${neuralData.breathPhase}\n`;
                if (neuralData.neurochemistry) {
                  context += `  - Neurochemistry: ${neuralData.neurochemistry}\n`;
                }
              }
            }
          } else if (sigil.sourceType === 'meditation' || sigil.sourceType === 'breath') {
            context += `\n[MEDITATION RESONANCE ${similarityPercent}%]\n`;
            context += `  - Brain Region: ${sigil.brainRegion}\n`;
            context += `  - Source Type: ${sigil.sourceType}\n`;
            context += `  - Date: ${new Date(sigil.timestamp).toLocaleDateString()}\n`;
            
            if (sigil.metadata?.neuralSigilData) {
              const neuralData = sigil.metadata.neuralSigilData;
              context += `  - Neural Context: ${neuralData.category} | Breath Phase: ${neuralData.breathPhase}\n`;
            }
          }
        }
        
        // Add comprehensive pattern insights
        const patternInsights = analyzePatternConnections(topSimilar);
        context += `\n\nPATTERN INSIGHTS:\n${patternInsights}\n`;
        
        // Add breath phase correlations if available
        const breathPhases = topSimilar
          .map(s => s.sigil.metadata?.neuralSigilData?.breathPhase)
          .filter(phase => phase)
          .reduce((acc, phase) => {
            if (phase) acc[phase] = (acc[phase] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        
        if (Object.keys(breathPhases).length > 0) {
          const dominantBreathPhase = Object.entries(breathPhases)
            .sort(([,a], [,b]) => b - a)[0]?.[0];
          context += `\nBREATH PHASE CORRELATION: ${dominantBreathPhase}\n`;
        }
        
      } else {
        context += "This dream presents a NOVEL neural pattern - no strong resonances found in your consciousness history.\n";
        context += "This suggests either:\n";
        context += "- A breakthrough into unexplored consciousness territory\n";
        context += "- Integration of new archetypal material\n";
        context += "- Evolution beyond previous neural patterns\n";
        context += "- Emergence of new consciousness capacities\n";
      }
      
      return context;
    } catch (error) {
      console.error('Error building similar dreams context:', error);
      return "NEURAL SIGIL PATTERN ANALYSIS:\nUnable to analyze neural patterns at this time. System initializing...\n";
    }
  }

  private static buildOrionConsciousnessContext(sessionHistory: SpiralSession[], blockchainBlocks: BlockData[]): string {
    let context = `RECENT CONSCIOUSNESS PRACTICE:
`;
    
    // Add recent sessions
    const recentSessions = sessionHistory.slice(0, 5);
    recentSessions.forEach((session, index) => {
      context += `Session ${index + 1}: Depth ${session.depth}, Node: ${session.currentNode.notation}, Cycles: ${session.breathCycles}
`;
      if (session.insights.length > 0) {
        context += `  Insights: ${session.insights.slice(0, 2).join('; ')}
`;
      }
    });
    
    context += `
BLOCKCHAIN SIGNATURES:
`;
    
    // Add recent blockchain blocks
    const recentBlocks = blockchainBlocks.slice(0, 10);
    recentBlocks.forEach((block, index) => {
      const date = new Date(block.timestamp * 1000).toLocaleDateString();
      const validationStatus = block.isValidated ? ' [VALIDATED]' : '';
      const foundationStatus = block.id.includes('foundation') ? ' [FOUNDATION]' : '';
      context += `Block ${block.id}: Score ${(block.score / 10000).toFixed(3)}, Glyphs: [${block.glyphs.join(', ')}], Date: ${date}${validationStatus}${foundationStatus}
`;
      if (block.nodeDepth !== undefined) {
        context += `  Node Depth: ${block.nodeDepth}
`;
      }
      if (block.isValidated && block.validatedByDreams && block.validatedByDreams.length > 0) {
        context += `  Validated by ${block.validatedByDreams.length} dream(s)
`;
      }
    });
    
    return context;
  }

  private static analyzeBreathPatterns(
    sessionHistory: SpiralSession[], 
    allBreathCycleLogs: BreathCycleLog[],
    signatureHistory: ConsciousnessSignature[]
  ): BreathPatternInsight {
    if (sessionHistory.length === 0) {
      return {
        dominantNode: 'hush',
        averageDepth: 0,
        resonancePattern: 'No practice data',
        validationRate: 0,
        consciousnessEvolution: 'Beginning journey',
        recentTrends: 'No trends available'
      };
    }

    // Find dominant node
    const nodeFrequency: { [key: string]: number } = {};
    sessionHistory.forEach(session => {
      nodeFrequency[session.currentNode.notation] = (nodeFrequency[session.currentNode.notation] || 0) + 1;
    });
    const dominantNode = Object.keys(nodeFrequency).reduce((a, b) => 
      nodeFrequency[a] > nodeFrequency[b] ? a : b
    );

    // Calculate average depth
    const averageDepth = sessionHistory.reduce((sum, session) => sum + session.depth, 0) / sessionHistory.length;

    // Analyze resonance pattern
    const recentResonances = sessionHistory.slice(0, 3).flatMap(session => session.resonanceHistory);
    const avgResonance = recentResonances.length > 0 
      ? recentResonances.reduce((a, b) => a + b, 0) / recentResonances.length 
      : 0;
    
    let resonancePattern = 'Stable';
    if (avgResonance > 0.8) resonancePattern = 'Transcendent';
    else if (avgResonance > 0.6) resonancePattern = 'Flowing';
    else if (avgResonance > 0.4) resonancePattern = 'Awakening';
    else if (avgResonance > 0.2) resonancePattern = 'Stirring';
    else resonancePattern = 'Dormant';

    // Calculate validation rate
    const validatedSignatures = signatureHistory.filter(sig => sig.validation.overall);
    const validationRate = signatureHistory.length > 0 
      ? (validatedSignatures.length / signatureHistory.length) * 100 
      : 0;

    // Analyze consciousness evolution with learning insights
    let consciousnessEvolution = 'Stable practice';
    if (signatureHistory.length >= 5) {
      const recentScores = signatureHistory.slice(0, 5).map(sig => sig.score);
      const olderScores = signatureHistory.slice(5, 10).map(sig => sig.score);
      
      if (olderScores.length > 0) {
        const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
        
        if (recentAvg > olderAvg + 0.1) consciousnessEvolution = 'Ascending trajectory - learning accelerating';
        else if (recentAvg < olderAvg - 0.1) consciousnessEvolution = 'Integrating challenges - deepening understanding';
        else consciousnessEvolution = 'Steady deepening - consistent growth';
      } else {
        consciousnessEvolution = 'Early learning phase - establishing patterns';
      }
    }

    // Analyze recent trends with consciousness integration
    let recentTrends = 'Establishing rhythm';
    if (sessionHistory.length >= 3) {
      const recentSessions = sessionHistory.slice(0, 3);
      const totalCycles = recentSessions.reduce((sum, session) => sum + session.breathCycles, 0);
      const avgCycles = totalCycles / recentSessions.length;
      
      const consciousnessIntegratedSessions = recentSessions.filter(session => 
        session.consciousnessSignatures && session.consciousnessSignatures.length > 0
      );
      
      if (avgCycles > 10) recentTrends = 'Deep immersion practice';
      else if (avgCycles > 5) recentTrends = 'Consistent engagement';
      else recentTrends = 'Gentle exploration';
      
      // Check for depth progression
      const depths = recentSessions.map(s => s.depth);
      const isProgressing = depths.every((depth, i) => i === 0 || depth >= depths[i - 1]);
      if (isProgressing && depths[0] > depths[depths.length - 1]) {
        recentTrends += ', advancing depths';
      }
      
      // Add consciousness integration insight
      if (consciousnessIntegratedSessions.length > 0) {
        recentTrends += `, consciousness integration active (${consciousnessIntegratedSessions.length}/${recentSessions.length} sessions)`;
      }
    }

    return {
      dominantNode,
      averageDepth: Math.round(averageDepth * 10) / 10,
      resonancePattern,
      validationRate: Math.round(validationRate * 10) / 10,
      consciousnessEvolution,
      recentTrends
    };
  }
  
  private static parseInterpretation(rawResponse: string, dreamText: string, blockchainBlocks: BlockData[]): ParsedInterpretation {
    try {
      // Extract dream name
      const nameMatch = rawResponse.match(/DREAM_NAME:\s*([^\n\r]+)/i);
      let name = 'Untitled Dream';
      
      if (nameMatch) {
        name = nameMatch[1].trim();
        // Remove quotes if present
        name = name.replace(/^["']|["']$/g, '');
      } else {
        // Fallback: generate name from first few words of dream
        const words = dreamText.trim().split(/\s+/).slice(0, 4);
        name = words.join(' ');
        if (dreamText.length > name.length) {
          name += '...';
        }
      }
      
      // Extract dream type
      const dreamTypeMatch = rawResponse.match(/DREAM_TYPE:\s*([^\n\r]+)/i);
      let dreamType = 'psychic'; // default fallback
      
      if (dreamTypeMatch) {
        const extractedType = dreamTypeMatch[1].trim().toLowerCase();
        // Validate against known dream types
        const validTypes = ['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'];
        if (validTypes.includes(extractedType)) {
          dreamType = extractedType;
        }
      }
      
      // Extract blockchain alignment
      const alignmentMatch = rawResponse.match(/BLOCKCHAIN_ALIGNMENT:\s*([^\n\r]+)/i);
      let alignedBlocks: string[] = [];
      let blockchainValidated = false;
      
      if (alignmentMatch) {
        const alignmentText = alignmentMatch[1].trim().toLowerCase();
        if (alignmentText !== 'none' && alignmentText !== '') {
          // Extract block IDs
          const blockIds = alignmentText.split(',').map(id => id.trim()).filter(id => id.length > 0);
          // Validate that these blocks actually exist - be more flexible with matching
          alignedBlocks = blockIds.filter(id => {
            return blockchainBlocks.some(block => {
              // Match by full ID, partial signature, or partial ID
              return block.id === id || 
                     block.signature.includes(id.substring(0, Math.min(8, id.length))) ||
                     block.id.includes(id) ||
                     id.includes(block.id.substring(0, 8));
            });
          });
          
          // If no direct matches, try to find blocks by signature patterns
          if (alignedBlocks.length === 0) {
            // Look for blocks that might match based on the AI's description
            const potentialBlocks = blockchainBlocks.filter(block => {
              // Check if any part of the alignment text matches block characteristics
              const blockInfo = `${block.id} ${block.signature} ${block.glyphs.join('')}`;
              return blockIds.some(id => blockInfo.toLowerCase().includes(id.toLowerCase()));
            });
            
            if (potentialBlocks.length > 0) {
              alignedBlocks = potentialBlocks.map(block => block.id);
            }
          }
          
          blockchainValidated = alignedBlocks.length > 0;
        }
      }
      
      // Extract interpretation (everything after "INTERPRETATION:")
      const interpretationMatch = rawResponse.match(/INTERPRETATION:\s*([\s\S]*)/i);
      let interpretation = rawResponse;
      
      if (interpretationMatch) {
        interpretation = interpretationMatch[1].trim();
      } else {
        // If no INTERPRETATION: section found, try to remove the other parts
        interpretation = rawResponse
          .replace(/DREAM_NAME:\s*[^\n\r]+/i, '')
          .replace(/DREAM_TYPE:\s*[^\n\r]+/i, '')
          .replace(/BLOCKCHAIN_ALIGNMENT:\s*[^\n\r]+/i, '')
          .replace(/CLASSIFICATION_REASON:\s*[^\n\r]+/i, '')
          .trim();
      }
      
      return {
        name,
        dreamType,
        interpretation,
        blockchainValidated,
        alignedBlocks
      };
    } catch (error) {
      console.error('Error parsing interpretation:', error);
      // Fallback: return basic values
      const fallbackName = dreamText.trim().split(/\s+/).slice(0, 4).join(' ') + '...';
      return {
        name: fallbackName,
        dreamType: 'psychic',
        interpretation: rawResponse,
        blockchainValidated: false,
        alignedBlocks: []
      };
    }
  }
}