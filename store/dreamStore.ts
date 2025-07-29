import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { useNeuralSigilStore } from './neuralSigilStore';

export interface Dream {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  lucidity: number;
  emotionalIntensity: number;
  symbols: string[];
  interpretation?: string;
  neuralSigil?: NeuralSigil; // Add neural sigil to dream
  sigilId?: string; // Reference to stored sigil
  braidedWith?: string[]; // References to related dreams
  dreamType?: string;
  persona?: string;
  // Legacy properties for compatibility
  name?: string;
  text?: string;
  date?: string;
  blockchainValidated?: boolean;
  alignedBlocks?: string[];
}

export interface DreamGroup {
  groupTitle: string;
  dreams: Dream[];
}

export type SortBy = 'date' | 'lucidity' | 'type' | 'persona' | 'mnemonic' | 'psychic' | 'pre-echo' | 'lucid' | 'meta-lucid';

interface DreamStore {
  dreams: Dream[];
  currentDream: Dream | null;
  sortBy: SortBy;
  sigilToDreamIdMap: Record<string, string>; // Use object instead of Map for persistence
  
  // Existing methods
  addDream: (dream: Partial<Dream>) => Promise<Dream>;
  updateDream: (id: string, updates: Partial<Dream>) => Promise<void>;
  deleteDream: (id: string) => Promise<void>;
  loadDreams: () => Promise<void>;
  getDream: (id: string) => Dream | undefined;
  getDreamBySigilId: (sigilId: string) => Dream | undefined; // New method
  
  // Grouping and sorting methods
  getGroupedDreams: () => DreamGroup[];
  setSortBy: (sortBy: SortBy) => void;
  getDreamSigil: (dreamId: string) => NeuralSigil | undefined;
  
  // Neural sigil methods
  generateDreamSigil: (dreamId: string) => Promise<NeuralSigil>;
  findSimilarDreams: (dreamId: string, threshold?: number) => Promise<{ dream: Dream; similarity: number }[]>;
  braidDreams: (dreamIds: string[]) => Promise<void>;
  analyzeDreamPatterns: (dreamId: string) => Promise<any>;
  rebuildSigilMapping: () => void; // New method to rebuild reverse mapping
}

export const useDreamStore = create<DreamStore>()(
  persist(
    (set, get) => ({
      dreams: [],
      currentDream: null,
      sortBy: 'date',
      sigilToDreamIdMap: {},
      
      // Set sort by method
      setSortBy: (sortBy: SortBy) => {
        set({ sortBy });
      },
      
      // Get dream by ID
      getDream: (id: string) => {
        const { dreams } = get();
        return dreams.find(d => d.id === id);
      },
      
      // Get dream by sigil ID
      getDreamBySigilId: (sigilId: string) => {
        const { sigilToDreamIdMap, dreams } = get();
        const dreamId = sigilToDreamIdMap[sigilId];
        return dreamId ? dreams.find(d => d.id === dreamId) : undefined;
      },
      
      // Get dream sigil by dream ID
      getDreamSigil: (dreamId: string) => {
        const { dreams } = get();
        const dream = dreams.find(d => d.id === dreamId);
        return dream?.neuralSigil;
      },
      
      // Get grouped dreams based on current sort option
      getGroupedDreams: () => {
        const { dreams, sortBy } = get();
        
        // Filter dreams based on sort type
        let filteredDreams = [...dreams];
        
        if (['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy)) {
          filteredDreams = dreams.filter(dream => dream.dreamType === sortBy);
        }
        
        // Sort dreams
        switch (sortBy) {
          case 'date':
            filteredDreams.sort((a, b) => b.timestamp - a.timestamp);
            return [{ groupTitle: 'All Dreams', dreams: filteredDreams }];
            
          case 'lucidity':
            filteredDreams.sort((a, b) => b.lucidity - a.lucidity);
            return [{ groupTitle: 'By Lucidity', dreams: filteredDreams }];
            
          case 'type':
            const typeGroups = new Map<string, Dream[]>();
            filteredDreams.forEach(dream => {
              const type = dream.dreamType || 'Unknown';
              if (!typeGroups.has(type)) {
                typeGroups.set(type, []);
              }
              typeGroups.get(type)!.push(dream);
            });
            
            return Array.from(typeGroups.entries()).map(([type, dreams]) => ({
              groupTitle: type,
              dreams: dreams.sort((a, b) => b.timestamp - a.timestamp)
            }));
            
          case 'persona':
            const personaGroups = new Map<string, Dream[]>();
            filteredDreams.forEach(dream => {
              const persona = dream.persona || 'Unknown';
              if (!personaGroups.has(persona)) {
                personaGroups.set(persona, []);
              }
              personaGroups.get(persona)!.push(dream);
            });
            
            return Array.from(personaGroups.entries()).map(([persona, dreams]) => ({
              groupTitle: persona,
              dreams: dreams.sort((a, b) => b.timestamp - a.timestamp)
            }));
            
          case 'mnemonic':
          case 'psychic':
          case 'pre-echo':
          case 'lucid':
          case 'meta-lucid':
            return [{ 
              groupTitle: `${sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} Dreams`, 
              dreams: filteredDreams.sort((a, b) => b.timestamp - a.timestamp)
            }];
            
          default:
            return [{ groupTitle: 'All Dreams', dreams: filteredDreams }];
        }
      },
      
      // Enhanced addDream with neural sigil generation
      addDream: async (dreamData) => {
        const id = `dream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        
        // Ensure required fields are present
        const dream: Dream = {
          id,
          timestamp,
          title: dreamData.title || dreamData.name || 'Untitled Dream',
          content: dreamData.content || dreamData.text || '',
          symbols: dreamData.symbols || [],
          lucidity: dreamData.lucidity || 0.5,
          emotionalIntensity: dreamData.emotionalIntensity || 0.5,
          interpretation: dreamData.interpretation,
          dreamType: dreamData.dreamType,
          persona: dreamData.persona,
          // Keep legacy properties for compatibility
          name: dreamData.name || dreamData.title,
          text: dreamData.text || dreamData.content,
          date: dreamData.date || new Date().toISOString(),
          blockchainValidated: dreamData.blockchainValidated,
          alignedBlocks: dreamData.alignedBlocks,
        };
        
        // Store dream first
        const { dreams } = get();
        const updatedDreams = [...dreams, dream];
        set({ dreams: updatedDreams, currentDream: dream });
        
        // Generate neural sigil for dream after it's stored
        try {
          const sigil = await get().generateDreamSigil(dream.id);
          dream.neuralSigil = sigil;
          dream.sigilId = sigil.id;
          
          // Update the dream with sigil and reverse mapping
          const currentDreams = get().dreams;
          const dreamIndex = currentDreams.findIndex(d => d.id === dream.id);
          if (dreamIndex !== -1) {
            currentDreams[dreamIndex] = dream;
            
            // Update reverse mapping
            const newSigilToDreamIdMap = { ...get().sigilToDreamIdMap };
            newSigilToDreamIdMap[sigil.id] = dream.id;
            
            set({ dreams: [...currentDreams], sigilToDreamIdMap: newSigilToDreamIdMap });
          }
          
          // Find similar dreams automatically
          const similarDreams = await get().findSimilarDreams(dream.id, 0.7);
          if (similarDreams.length > 0) {
            // Notify user of similar dreams
            console.log(`Found ${similarDreams.length} similar dreams`);
          }
        } catch (error) {
          console.error('Failed to generate dream sigil:', error);
        }
        
        return dream;
      },
      
      // Generate neural sigil for dream
      generateDreamSigil: async (dreamId: string) => {
        const { dreams } = get();
        const dream = dreams.find(d => d.id === dreamId);
        
        if (!dream) {
          throw new Error(`Dream with id ${dreamId} not found`);
        }
        
        try {
          // Use neural sigil store directly instead of consciousness store
          const { generateNeuralSigil } = useNeuralSigilStore.getState();
          
          // Create text representation of dream for sigil generation
          const dreamText = `${dream.title || dream.name || ''} ${dream.content || dream.text || ''} ${(dream.symbols || []).join(' ')} ${dream.dreamType || ''} ${dream.persona || ''}`;
          
          // Generate sigil using neural sigil store
          const sigil = await generateNeuralSigil(dreamText, 'dream');
          
          // Create a new sigil with dream-specific metadata
          const enhancedSigil: NeuralSigil = {
            id: sigil.id,
            pattern: sigil.pattern,
            brainRegion: sigil.brainRegion,
            timestamp: sigil.timestamp,
            sourceType: sigil.sourceType,
            strength: sigil.strength,
            hash: sigil.hash,
            metadata: {
              ...sigil.metadata,
              dreamId: dream.id,
              lucidity: dream.lucidity || 0,
              emotionalIntensity: dream.emotionalIntensity || 0,
              symbolCount: (dream.symbols || []).length,
              dreamType: dream.dreamType,
              persona: dream.persona,
              emotionalFingerprint: categorizeEmotion(dream.content || dream.text || ''),
              brainRegions: [{
                region: sigil.brainRegion,
                activation: dream.lucidity || 0
              }],
              strength: (dream.lucidity || 0) * (dream.emotionalIntensity || 0)
            }
          };
          
          return enhancedSigil;
          

        } catch (error) {
          console.error('Error generating dream sigil:', error);
          throw error;
        }
      },
      
      // Find similar dreams by neural sigil
      findSimilarDreams: async (dreamId: string, threshold = 0.7) => {
        const { dreams } = get();
        const targetDream = dreams.find(d => d.id === dreamId);
        
        if (!targetDream || !targetDream.neuralSigil) return [];
        
        try {
          const { findSimilarBySigil } = useNeuralSigilStore.getState();
          
          // Find similar sigils
          const similarSigils = await findSimilarBySigil(targetDream.neuralSigil.id, threshold);
          
          // Map back to dreams with similarity scores
          const similarDreams: { dream: Dream; similarity: number }[] = [];
          
          for (const { sigil, similarity } of similarSigils) {
            const dream = dreams.find(d => d.neuralSigil?.id === sigil.id);
            if (dream && dream.id !== dreamId) {
              similarDreams.push({ dream, similarity });
            }
          }
          
          return similarDreams.sort((a, b) => b.similarity - a.similarity);
        } catch (error) {
          console.error('Error finding similar dreams:', error);
          return [];
        }
      },
      
      // Braid multiple dreams together
      braidDreams: async (dreamIds: string[]) => {
        const { dreams } = get();
        
        const selectedDreams = dreams.filter(d => dreamIds.includes(d.id));
        if (selectedDreams.length < 2) return;
        
        const sigils = selectedDreams
          .map(d => d.neuralSigil)
          .filter((s): s is NeuralSigil => s !== undefined);
        
        if (sigils.length >= 2) {
          try {
            // Create braided consciousness state using neural sigil store
            const { braidConsciousnessStates } = useNeuralSigilStore.getState();
            const sigilIds = sigils.map(s => s.id);
            const braidResult = await braidConsciousnessStates(sigilIds);
            
            // Update dreams with braiding references
            for (const dream of selectedDreams) {
              dream.braidedWith = dreamIds.filter(id => id !== dream.id);
            }
            
            // Save updated dreams
            set({ dreams: [...dreams] });
          } catch (error) {
            console.error('Error braiding dreams:', error);
          }
        }
      },
      
      // Analyze dream patterns using neural sigils
      analyzeDreamPatterns: async (dreamId: string) => {
        const { dreams } = get();
        const targetDream = dreams.find(d => d.id === dreamId);
        
        if (!targetDream || !targetDream.neuralSigil) return null;
        
        try {
          const { recognizePattern } = useNeuralSigilStore.getState();
          
          // Find pattern matches
          const patternMatches = await recognizePattern(targetDream.neuralSigil);
          
          // Analyze brain region activation
          const brainRegions = targetDream.neuralSigil.metadata?.brainRegions || [];
          
          // Calculate dream metrics
          const analysis = {
            dominantBrainRegion: brainRegions.length > 0 ? brainRegions.reduce((max: any, region: any) => 
              region.activation > max.activation ? region : max
            ) : { region: targetDream.neuralSigil.brainRegion, activation: targetDream.lucidity },
            patternMatches,
            emotionalSignature: targetDream.neuralSigil.metadata?.emotionalFingerprint,
            sigilStrength: targetDream.neuralSigil.strength,
            relatedDreams: await get().findSimilarDreams(dreamId, 0.6),
            timestamp: Date.now()
          };
          
          return analysis;
        } catch (error) {
          console.error('Error analyzing dream patterns:', error);
          return null;
        }
      },
      
      // Enhanced updateDream
      updateDream: async (id: string, updates: Partial<Dream>) => {
        const { dreams } = get();
        const dreamIndex = dreams.findIndex(d => d.id === id);
        
        if (dreamIndex === -1) return;
        
        const updatedDream = { ...dreams[dreamIndex], ...updates };
        
        // Regenerate sigil if content changed significantly
        if (updates.content || updates.text || updates.symbols || updates.emotionalIntensity) {
          try {
            // Remove old sigil mapping if it exists
            const oldSigil = dreams[dreamIndex].neuralSigil;
            if (oldSigil) {
              const newSigilToDreamIdMap = { ...get().sigilToDreamIdMap };
              delete newSigilToDreamIdMap[oldSigil.id];
              set({ sigilToDreamIdMap: newSigilToDreamIdMap });
            }
            
            const newSigil = await get().generateDreamSigil(updatedDream.id);
            updatedDream.neuralSigil = newSigil;
            updatedDream.sigilId = newSigil.id;
            
            // Update reverse mapping with new sigil
            const newSigilToDreamIdMap = { ...get().sigilToDreamIdMap };
            newSigilToDreamIdMap[newSigil.id] = updatedDream.id;
            set({ sigilToDreamIdMap: newSigilToDreamIdMap });
          } catch (error) {
            console.error('Failed to regenerate dream sigil:', error);
          }
        }
        
        dreams[dreamIndex] = updatedDream;
        
        set({ dreams: [...dreams] });
      },
      
      // Other existing methods remain the same
      deleteDream: async (id: string) => {
        const { dreams, sigilToDreamIdMap } = get();
        const dreamToDelete = dreams.find(d => d.id === id);
        
        // Remove from reverse mapping if sigil exists
        if (dreamToDelete?.neuralSigil) {
          const newSigilToDreamIdMap = { ...sigilToDreamIdMap };
          delete newSigilToDreamIdMap[dreamToDelete.neuralSigil.id];
          set({ sigilToDreamIdMap: newSigilToDreamIdMap });
        }
        
        const filteredDreams = dreams.filter(d => d.id !== id);
        set({ dreams: filteredDreams });
      },
      
      loadDreams: async () => {
        // Dreams are automatically loaded from persistence
        // Initialize reverse mapping for existing dreams
        const { dreams, sigilToDreamIdMap } = get();
        const newSigilToDreamIdMap = { ...sigilToDreamIdMap };
        
        dreams.forEach(dream => {
          if (dream.neuralSigil?.id && !newSigilToDreamIdMap[dream.neuralSigil.id]) {
            newSigilToDreamIdMap[dream.neuralSigil.id] = dream.id;
          }
        });
        
        if (Object.keys(newSigilToDreamIdMap).length !== Object.keys(sigilToDreamIdMap).length) {
          set({ sigilToDreamIdMap: newSigilToDreamIdMap });
        }
        
        console.log('Dreams loaded from persistence, reverse mapping initialized');
      },
      
      // Rebuild sigil to dream ID mapping
      rebuildSigilMapping: () => {
        const { dreams } = get();
        const newSigilToDreamIdMap: Record<string, string> = {};
        
        dreams.forEach(dream => {
          if (dream.neuralSigil?.id) {
            newSigilToDreamIdMap[dream.neuralSigil.id] = dream.id;
          }
        });
        
        set({ sigilToDreamIdMap: newSigilToDreamIdMap });
        console.log(`Rebuilt sigil mapping for ${Object.keys(newSigilToDreamIdMap).length} dreams`);
      },
    }),
    {
      name: 'dream-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        dreams: state.dreams.slice(0, 100), // Limit stored dreams
        currentDream: state.currentDream,
        sortBy: state.sortBy,
        sigilToDreamIdMap: state.sigilToDreamIdMap
      })
    }
  )
);

// Helper functions
function categorizeEmotion(content: string): string {
  const emotions = {
    Intense: ['fear', 'anger', 'passion', 'excitement'],
    Reverent: ['awe', 'wonder', 'sacred', 'divine'],
    Reflective: ['contemplative', 'peaceful', 'serene', 'calm'],
    Collapsing: ['anxiety', 'chaos', 'confusion', 'dissolution'],
    Transcendent: ['unity', 'oneness', 'infinite', 'eternal']
  };
  
  const lowerContent = content.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerContent.includes(keyword))) {
      return emotion;
    }
  }
  
  return 'Neutral';
}

function calculateComplexity(content: string): number {
  // Simple complexity metric based on sentence structure
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(' ').length, 0) / sentences.length;
  
  return Math.min(1, avgSentenceLength / 20);
}

function calculateTemporalCoherence(content: string): number {
  // Check for temporal markers
  const temporalMarkers = ['then', 'after', 'before', 'suddenly', 'meanwhile', 'later'];
  const markerCount = temporalMarkers.filter(marker => 
    content.toLowerCase().includes(marker)
  ).length;
  
  return Math.min(1, markerCount / 5);
}

async function generateContentEmbedding(content: string): Promise<number[]> {
  // Simplified embedding generation
  // In production, use a proper embedding model
  const words = content.toLowerCase().split(/\s+/);
  const embedding = new Array(64).fill(0);
  
  words.forEach((word, i) => {
    const hash = word.split('').reduce((h, c) => h + c.charCodeAt(0), 0);
    embedding[hash % 64] += 1;
  });
  
  // Normalize
  const max = Math.max(...embedding);
  return embedding.map(v => v / (max || 1));
}