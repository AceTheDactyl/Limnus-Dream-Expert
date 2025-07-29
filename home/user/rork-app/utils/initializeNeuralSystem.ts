import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useDreamStore } from '@/store/dreamStore';

/**
 * Initialize the neural sigil system and rebuild mappings
 * Call this on app startup to ensure everything is properly connected
 */
export async function initializeNeuralSystem() {
  try {
    console.log('Initializing neural sigil system...');
    
    // Initialize neural sigil store
    const neuralSigilStore = useNeuralSigilStore.getState();
    await neuralSigilStore.initializeNeuralSystem();
    
    // Initialize dream store and rebuild sigil mappings
    const dreamStore = useDreamStore.getState();
    await dreamStore.loadDreams();
    dreamStore.rebuildSigilMapping();
    
    console.log('Neural sigil system initialized successfully');
    
    // Generate sigils for dreams that don't have them
    const { dreams } = dreamStore;
    const dreamsWithoutSigils = dreams.filter(dream => !dream.neuralSigil && !dream.sigilId);
    
    if (dreamsWithoutSigils.length > 0) {
      console.log(`Generating sigils for ${dreamsWithoutSigils.length} dreams...`);
      
      for (const dream of dreamsWithoutSigils.slice(0, 10)) { // Limit to 10 to avoid overwhelming
        try {
          await dreamStore.generateDreamSigil(dream.id);
          console.log(`Generated sigil for dream: ${dream.title || dream.name}`);
        } catch (error) {
          console.warn(`Failed to generate sigil for dream ${dream.id}:`, error);
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Failed to initialize neural system:', error);
    return false;
  }
}

/**
 * Check if the neural system is properly initialized
 */
export function isNeuralSystemReady(): boolean {
  try {
    const neuralSigilStore = useNeuralSigilStore.getState();
    const dreamStore = useDreamStore.getState();
    
    return (
      neuralSigilStore.sigilGenerator !== null &&
      dreamStore.dreams.length >= 0
    );
  } catch (error) {
    console.error('Error checking neural system readiness:', error);
    return false;
  }
}