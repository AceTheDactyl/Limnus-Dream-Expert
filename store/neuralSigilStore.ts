import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { enableMapSet } from 'immer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SigilGenerator, NeuralSigil, NeuralSigilGenerator } from '@/models/neural-sigil/sigilGenerator';
import { PatternRecognizer } from '@/models/neural-sigil/patternRecognition';
import { neuralSigils, getNeuralSigilByTernary, type NeuralSigilData } from '@/constants/neuralSigils';

// Enable MapSet support for Immer
try {
  enableMapSet();
  console.log('Immer MapSet plugin enabled successfully');
} catch (error) {
  console.warn('Failed to enable Immer MapSet plugin:', error);
}

export interface PatternMatch {
  sigilId: string;
  similarity: number;
  matchedWith: string;
  neuralSigilData?: NeuralSigilData;
}

export interface SigilBraid {
  id: string;
  sigilIds: string[];
  connections: BraidConnection[];
  strength: number;
  discoveredPatterns: string[];
  neuralConnections?: {
    brainRegions: string[];
    breathPhases: string[];
    neurochemistry: string[];
  };
}

interface BraidConnection {
  from: string;
  to: string;
  strength: number;
  type: 'temporal' | 'causal' | 'symbolic' | 'neural';
}

interface NeuralSigilState {
  neuralSigils: NeuralSigil[];
  // Use objects instead of Maps for persistence compatibility
  sigilsMap: Record<string, NeuralSigil>;
  patternLibraryMap: Record<string, any>;
  sigilGenerator: SigilGenerator | null;
  neuralSigilGenerator: NeuralSigilGenerator | null;
  patternRecognizer: PatternRecognizer | null;
  currentSigil: NeuralSigil | null;
  patternMatches: PatternMatch[];
  sigilBraids: SigilBraid[];
  neuralSigilDatabase: NeuralSigilData[];
  searchResults: NeuralSigilData[];
  selectedCategory: string | null;
}

interface NeuralSigilActions {
  generateNeuralSigil: (text: string, type: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  generateFromNeuralSigilData: (neuralSigilData: NeuralSigilData, type: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  generateFromBreathPhase: (breathPhase: string, type?: NeuralSigil['sourceType']) => Promise<NeuralSigil>;
  findSimilarBySigil: (sigilId: string, threshold?: number) => Promise<{ sigil: NeuralSigil; similarity: number }[]>;
  braidConsciousnessStates: (stateIds: string[]) => Promise<SigilBraid>;
  recognizePattern: (sigil: NeuralSigil) => Promise<PatternMatch[]>;
  getPatternEvolution: (userId?: string) => Promise<any>;
  searchNeuralSigils: (query: string) => Promise<NeuralSigilData[]>;
  findSigilByTernary: (ternaryCode: string) => Promise<NeuralSigilData | undefined>;
  filterByCategory: (category: string | null) => void;
  initializeNeuralSystem: () => Promise<void>;
  calculateSimilarity: (sigil1: NeuralSigil, sigil2: NeuralSigil) => number;
  // Compatibility methods for Map-like access
  getSigils: () => Map<string, NeuralSigil>;
  getPatternLibrary: () => Map<string, any>;
  getSigilById: (id: string) => NeuralSigil | undefined;
}

export const useNeuralSigilStore = create<NeuralSigilState & NeuralSigilActions>()(
  persist(
    immer((set, get) => {
      const similarityCache = new Map<string, number>();
      const getCacheKey = (id1: string, id2: string) => [id1, id2].sort().join('-');

      return {
        neuralSigils: [],
        sigilsMap: {},
        patternLibraryMap: {},
        sigilGenerator: null,
        neuralSigilGenerator: null,
        patternRecognizer: null,
        currentSigil: null,
        patternMatches: [],
        sigilBraids: [],
        neuralSigilDatabase: neuralSigils,
        searchResults: [],
        selectedCategory: null,

        initializeNeuralSystem: async () => {
          try {
            console.log('Initializing neural sigil system...');
            
            const state = get();
            let generator = state.sigilGenerator;
            let neuralGenerator = state.neuralSigilGenerator;
            let recognizer = state.patternRecognizer;
            
            if (!generator) {
              console.log('Creating SigilGenerator instance');
              generator = SigilGenerator.getInstance();
              set(state => {
                state.sigilGenerator = generator;
              });
            }
            
            if (!neuralGenerator) {
              console.log('Creating NeuralSigilGenerator instance');
              neuralGenerator = new NeuralSigilGenerator();
              await neuralGenerator.initialize();
              set(state => {
                state.neuralSigilGenerator = neuralGenerator;
              });
            }
            
            if (!recognizer) {
              console.log('Creating PatternRecognizer instance');
              recognizer = new PatternRecognizer();
              set(state => {
                state.patternRecognizer = recognizer;
              });
            }
            
            console.log('Neural Sigil System initialized successfully with', neuralSigils.length, 'neural sigils');
          } catch (error) {
            console.error('Failed to initialize neural sigil system:', error);
            throw error;
          }
        },

        generateNeuralSigil: async (text, type) => {
          try {
            console.log('Starting neural sigil generation for text:', text.substring(0, 50) + '...');
            
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            let generator = get().sigilGenerator;
            if (!generator) {
              console.log('Creating new SigilGenerator instance');
              generator = SigilGenerator.getInstance();
              set(state => {
                state.sigilGenerator = generator;
              });
            }

            // Use the sigil generator directly instead of helper functions to avoid import issues
            console.log('Generating sigil using SigilGenerator');
            const generatedSigil = generator.generateFromText(text, type);
            
            // Create a mutable copy of the sigil to avoid read-only issues
            const sigil: NeuralSigil = {
              id: generatedSigil.id,
              pattern: generatedSigil.pattern,
              brainRegion: generatedSigil.brainRegion,
              timestamp: generatedSigil.timestamp,
              sourceType: generatedSigil.sourceType,
              strength: generatedSigil.strength,
              hash: generatedSigil.hash,
              metadata: generatedSigil.metadata ? { ...generatedSigil.metadata } : {}
            };
            
            console.log('Generated sigil:', sigil.id, 'with pattern length:', sigil.pattern.length);
            
            // Find similar sigils
            const matches: PatternMatch[] = [];
            const existingSigils = get().neuralSigils;
            console.log('Checking similarity against', existingSigils.length, 'existing sigils');
            
            for (const existing of existingSigils) {
              try {
                const similarity = generator.calculateSimilarity(sigil, existing);
                if (similarity > 0.7) {
                  matches.push({ 
                    sigilId: sigil.id, 
                    similarity, 
                    matchedWith: existing.id,
                    neuralSigilData: existing.metadata?.neuralSigilData
                  });
                }
              } catch (error) {
                console.warn('Error calculating similarity for existing sigil:', String(error));
              }
            }

            console.log('Found', matches.length, 'similar sigils');

            // Update state using immer
            set(state => {
              state.neuralSigils.push(sigil);
              state.sigilsMap[sigil.id] = sigil;
              state.currentSigil = sigil;
              state.patternMatches.push(...matches);
            });

            console.log('Successfully generated and stored neural sigil');
            return sigil;
          } catch (error) {
            console.error('Error generating neural sigil:', error);
            // Return a fallback sigil instead of throwing
            const fallbackSigil: NeuralSigil = {
              id: `fallback_${Date.now()}`,
              pattern: new Float32Array(64).fill(0.5),
              brainRegion: 'Limbic',
              timestamp: Date.now(),
              sourceType: type,
              strength: 0.5,
              hash: 0,
              metadata: { text: text, error: String(error) }
            };
            
            set(state => {
              state.neuralSigils.push(fallbackSigil);
              state.sigilsMap[fallbackSigil.id] = fallbackSigil;
              state.currentSigil = fallbackSigil;
            });
            
            return fallbackSigil;
          }
        },

        generateFromNeuralSigilData: async (neuralSigilData, type) => {
          let generator = get().sigilGenerator;
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set(state => {
              state.sigilGenerator = generator;
            });
          }

          const generatedSigil = generator.generateFromNeuralSigil(neuralSigilData, type);
          
          // Create a mutable copy
          const sigil: NeuralSigil = {
            id: generatedSigil.id,
            pattern: generatedSigil.pattern,
            brainRegion: generatedSigil.brainRegion,
            timestamp: generatedSigil.timestamp,
            sourceType: generatedSigil.sourceType,
            strength: generatedSigil.strength,
            hash: generatedSigil.hash,
            metadata: generatedSigil.metadata ? { ...generatedSigil.metadata } : {}
          };

          set(state => {
            state.neuralSigils.push(sigil);
            state.sigilsMap[sigil.id] = sigil;
            state.currentSigil = sigil;
          });

          return sigil;
        },

        generateFromBreathPhase: async (breathPhase, type = 'breath') => {
          try {
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            let neuralGenerator = get().neuralSigilGenerator;
            if (!neuralGenerator) {
              neuralGenerator = new NeuralSigilGenerator();
              await neuralGenerator.initialize();
              set(state => {
                state.neuralSigilGenerator = neuralGenerator;
              });
            }

            const generatedSigil = await neuralGenerator.generateFromBreathPhase(breathPhase, type);
            
            // Create a mutable copy
            const sigil: NeuralSigil = {
              id: generatedSigil.id,
              pattern: generatedSigil.pattern,
              brainRegion: generatedSigil.brainRegion,
              timestamp: generatedSigil.timestamp,
              sourceType: generatedSigil.sourceType,
              strength: generatedSigil.strength,
              hash: generatedSigil.hash,
              metadata: generatedSigil.metadata ? { ...generatedSigil.metadata } : {}
            };
            
            // Validate sigil pattern
            if (!sigil.pattern || sigil.pattern.length === 0) {
              console.warn('Generated breath sigil has invalid pattern, creating default');
              sigil.pattern = new Float32Array(64).fill(0.5);
            }

            set(state => {
              state.neuralSigils.push(sigil);
              state.sigilsMap[sigil.id] = sigil;
              state.currentSigil = sigil;
            });

            return sigil;
          } catch (error) {
            console.error('Error generating breath phase sigil:', String(error));
            // Return a fallback sigil instead of throwing
            const fallbackSigil: NeuralSigil = {
              id: `fallback_${Date.now()}`,
              pattern: new Float32Array(64).fill(0.5),
              brainRegion: 'Cortical',
              timestamp: Date.now(),
              sourceType: type,
              strength: 0.5,
              hash: 0,
              metadata: { breathPhase: breathPhase }
            };
            
            set(state => {
              state.neuralSigils.push(fallbackSigil);
              state.sigilsMap[fallbackSigil.id] = fallbackSigil;
              state.currentSigil = fallbackSigil;
            });
            
            return fallbackSigil;
          }
        },

        findSimilarBySigil: async (sigilId, threshold = 0.7) => {
          try {
            console.log('Finding similar sigils for:', sigilId);
            
            // Ensure system is initialized
            await get().initializeNeuralSystem();
            
            const { neuralSigils, sigilGenerator } = get();
            const target = neuralSigils.find(s => s.id === sigilId);
            if (!target) {
              console.warn('Target sigil not found:', sigilId);
              return [];
            }

            console.log('Found target sigil, comparing against', neuralSigils.length, 'sigils');

            const cachedSim = (a: NeuralSigil, b: NeuralSigil) => {
              const key = getCacheKey(a.id, b.id);
              if (similarityCache.has(key)) return similarityCache.get(key)!;
              
              // Use sigil generator's similarity calculation
              const sim = sigilGenerator?.calculateSimilarity(a, b) || 0;
              similarityCache.set(key, sim);
              return sim;
            };

            const results = neuralSigils
              .filter(s => s.id !== sigilId)
              .map(s => ({ sigil: s, similarity: cachedSim(target, s) }))
              .filter(r => r.similarity >= threshold)
              .sort((a, b) => b.similarity - a.similarity);
              
            console.log('Found', results.length, 'similar sigils above threshold', threshold);
            return results;
          } catch (error) {
            console.error('Error finding similar sigils:', error);
            return [];
          }
        },

        braidConsciousnessStates: async (stateIds) => {
          // Ensure system is initialized
          await get().initializeNeuralSystem();
          
          const { neuralSigils, sigilGenerator } = get();
          const sigils = neuralSigils.filter(s => stateIds.includes(s.id));
          
          if (sigils.length < 2 || !sigilGenerator) {
            throw new Error('Need at least 2 states to braid');
          }
          
          const braid: SigilBraid = {
            id: `braid_${Date.now()}`,
            sigilIds: stateIds,
            connections: [],
            strength: 0,
            discoveredPatterns: [],
            neuralConnections: {
              brainRegions: [],
              breathPhases: [],
              neurochemistry: []
            }
          };
          
          // Calculate pairwise connections
          for (let i = 0; i < sigils.length - 1; i++) {
            for (let j = i + 1; j < sigils.length; j++) {
              const similarity = sigilGenerator.calculateSimilarity(sigils[i], sigils[j]);
              if (similarity > 0.6) {
                let connectionType: BraidConnection['type'] = 'symbolic';
                
                // Determine connection type based on neural sigil data
                const sigilA = sigils[i].metadata?.neuralSigilData;
                const sigilB = sigils[j].metadata?.neuralSigilData;
                
                if (sigilA && sigilB) {
                  if (sigilA.category === sigilB.category) {
                    connectionType = 'neural';
                  } else if (sigilA.breathPhase === sigilB.breathPhase) {
                    connectionType = 'temporal';
                  }
                }
                
                braid.connections.push({
                  from: sigils[i].id,
                  to: sigils[j].id,
                  strength: similarity,
                  type: connectionType
                });
              }
            }
          }
          
          // Analyze neural connections
          const brainRegions = new Set<string>();
          const breathPhases = new Set<string>();
          const neurochemistry = new Set<string>();
          
          sigils.forEach(sigil => {
            if (sigil.metadata?.neuralSigilData) {
              const data = sigil.metadata.neuralSigilData;
              brainRegions.add(data.category);
              breathPhases.add(data.breathPhase);
              if (data.neurochemistry) {
                neurochemistry.add(data.neurochemistry);
              }
            }
          });
          
          braid.neuralConnections = {
            brainRegions: Array.from(brainRegions),
            breathPhases: Array.from(breathPhases),
            neurochemistry: Array.from(neurochemistry)
          };
          
          braid.strength = braid.connections.reduce((sum, c) => sum + c.strength, 0) 
            / Math.max(1, braid.connections.length);
          
          set(state => {
            state.sigilBraids.push(braid);
          });
          
          return braid;
        },

        recognizePattern: async (sigil) => {
          // Ensure system is initialized
          await get().initializeNeuralSystem();
          
          let recognizer = get().patternRecognizer;
          if (!recognizer) {
            recognizer = new PatternRecognizer();
            set(state => {
              state.patternRecognizer = recognizer;
            });
          }
          
          const patterns = await recognizer.findSimilarPatterns(sigil, 0.65);
          
          const matches: PatternMatch[] = patterns.map((p: any) => ({
            sigilId: sigil.id,
            similarity: p.similarity,
            matchedWith: p.patternId,
            neuralSigilData: sigil.metadata?.neuralSigilData
          }));
          
          set(state => {
            state.patternMatches.push(...matches);
          });
          
          return matches;
        },

        getPatternEvolution: async (userId) => {
          try {
            const { neuralSigils, patternRecognizer } = get();
            if (!patternRecognizer) {
              console.warn('Pattern recognizer not initialized');
              return null;
            }
            
            const userSigils = userId 
              ? neuralSigils.filter(s => s.metadata?.userId === userId)
              : neuralSigils;
            
            if (userSigils.length === 0) {
              return {
                clusters: [],
                dominantPatterns: [],
                temporalFlow: [],
                totalSigils: 0,
                categoryDistribution: {},
                breathPhaseDistribution: {},
                neuralInsights: {
                  mostActiveBrainRegion: 'unknown',
                  dominantBreathPhase: 'unknown'
                }
              };
            }
            
            const clusters = await patternRecognizer.clusterSigils(userSigils);
            
            // Analyze neural sigil patterns
            const categoryDistribution = userSigils.reduce((acc: Record<string, number>, sigil) => {
              const category = sigil.metadata?.neuralSigilData?.category || 'unknown';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            const breathPhaseDistribution = userSigils.reduce((acc: Record<string, number>, sigil) => {
              const category = sigil.metadata?.neuralSigilData?.breathPhase || 'unknown';
              acc[category] = (acc[category] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            return {
              clusters: clusters.clusters || [],
              dominantPatterns: clusters.dominantPatterns || [],
              temporalFlow: clusters.temporalFlow || [],
              totalSigils: userSigils.length,
              categoryDistribution,
              breathPhaseDistribution,
              neuralInsights: {
                mostActiveBrainRegion: Object.entries(categoryDistribution)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown',
                dominantBreathPhase: Object.entries(breathPhaseDistribution)
                  .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'unknown'
              }
            };
          } catch (error) {
            console.error('Error generating sigil insights:', error);
            return {
              clusters: [],
              dominantPatterns: [],
              temporalFlow: [],
              totalSigils: 0,
              categoryDistribution: {},
              breathPhaseDistribution: {},
              neuralInsights: {
                mostActiveBrainRegion: 'unknown',
                dominantBreathPhase: 'unknown'
              }
            };
          }
        },

        searchNeuralSigils: async (query) => {
          let generator = get().sigilGenerator;
          if (!generator) {
            generator = SigilGenerator.getInstance();
            set(state => {
              state.sigilGenerator = generator;
            });
          }

          const results = generator.searchSigils(query);
          
          set(state => {
            state.searchResults = results;
          });

          return results;
        },

        findSigilByTernary: async (ternaryCode) => {
          return getNeuralSigilByTernary(ternaryCode);
        },

        filterByCategory: (category) => {
          set(state => {
            state.selectedCategory = category;
            if (category) {
              state.searchResults = neuralSigils.filter(sigil => sigil.category === category);
            } else {
              state.searchResults = [];
            }
          });
        },
        
        calculateSimilarity: (sigil1: NeuralSigil, sigil2: NeuralSigil) => {
          try {
            // Use cosine similarity calculation directly
            const pattern1 = Array.from(sigil1.pattern);
            const pattern2 = Array.from(sigil2.pattern);
            
            if (pattern1.length !== pattern2.length) {
              console.warn('Pattern length mismatch in similarity calculation');
              return 0;
            }
            
            let dotProduct = 0;
            let norm1 = 0;
            let norm2 = 0;
            
            for (let i = 0; i < pattern1.length; i++) {
              dotProduct += pattern1[i] * pattern2[i];
              norm1 += pattern1[i] * pattern1[i];
              norm2 += pattern2[i] * pattern2[i];
            }
            
            const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
            return magnitude > 0 ? dotProduct / magnitude : 0;
          } catch (error) {
            console.warn('Error calculating similarity:', error);
            return 0;
          }
        },
        
        // Compatibility methods for Map-like access
        getSigils: () => {
          const state = get();
          return new Map(Object.entries(state.sigilsMap));
        },
        
        getPatternLibrary: () => {
          const state = get();
          return new Map(Object.entries(state.patternLibraryMap));
        },
        
        // Helper method to get sigil by ID
        getSigilById: (id: string) => {
          const state = get();
          return state.sigilsMap[id] || state.neuralSigils.find(s => s.id === id);
        }
      };
    }),
    {
      name: 'neural-sigil-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        neuralSigils: state.neuralSigils.slice(-500),
        sigilsMap: Object.fromEntries(
          Object.entries(state.sigilsMap).slice(-500)
        ),
        patternLibraryMap: Object.fromEntries(
          Object.entries(state.patternLibraryMap).slice(-100)
        ),
        patternMatches: state.patternMatches.slice(-200),
        sigilBraids: state.sigilBraids.slice(-50),
        selectedCategory: state.selectedCategory
      }),
    }
  )
);