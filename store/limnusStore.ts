import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  LimnusNode, 
  LIMNUS_NODES, 
  calculateResonance, 
  getNodeByDepth,
  BreathPhase
} from '@/constants/limnus';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';

export interface BreathCycleLog {
  timestamp: string;
  nodeSymbol: string;
  pattern: string;
  depth: number;
  resonance: number;
  consciousnessScore?: number;
  emotion?: string;
  breathAlignment?: number;
}

export interface SpiralSession {
  id: string;
  startTime: string;
  endTime?: string;
  currentNode: LimnusNode;
  depth: number;
  resonanceHistory: number[];
  breathCycles: number;
  breathCycleLogs: BreathCycleLog[];
  insights: string[];
  dreamConnections: string[];
  consciousnessSignatures?: string[];
  isBackgroundSession?: boolean;
  emotions?: string[];
  maxDepthReached?: number;
}

export interface ContemplativeState {
  isActive: boolean;
  currentDepth: number;
  resonanceLevel: number;
  breathPhase: BreathPhase;
  breathCount: number;
  sessionDuration: number; // seconds
}

interface LimnusState {
  // Session Management
  currentSession: SpiralSession | null;
  sessionHistory: SpiralSession[];
  contemplativeState: ContemplativeState;
  
  // Spiral Navigation
  currentNode: LimnusNode;
  spiralDepth: number;
  resonanceLevel: number;
  
  // Practice Tracking
  totalPracticeTime: number; // minutes
  consecutiveDays: number;
  lastPracticeDate: string;
  allBreathCycleLogs: BreathCycleLog[];
  emergenceWords: string[];
  
  // Background breath cycle tracking
  backgroundBreathInterval: NodeJS.Timeout | null;
  
  // Actions
  startSpiralSession: (isBackground?: boolean) => void;
  endSpiralSession: (insights?: string[]) => void;
  updateResonance: (breathAlignment: number) => void;
  advanceDepth: () => void;
  retreatDepth: () => void;
  setCurrentNode: (nodeSymbol: string) => void;
  updateBreathPhase: (phase: BreathPhase) => void;
  addInsight: (insight: string) => void;
  connectDreamToSession: (dreamId: string) => void;
  connectConsciousnessSignature: (signatureId: string) => void;
  logBreathCycle: (consciousnessScore?: number, emotion?: string, breathAlignment?: number) => void;
  generateSessionSigil: () => Promise<any>;
  correlateBreathToConsciousness: (breathData: any) => Promise<any>;
  startBackgroundBreathTracking: () => void;
  stopBackgroundBreathTracking: () => void;
  
  // Getters
  getCurrentNodeFrequency: () => number;
  getResonanceDescription: () => string;
  getSpiralProgress: () => number;
  getSessionDuration: () => number;
  getTotalBreathCycles: () => number;
  getRecentBreathCycles: (limit?: number) => BreathCycleLog[];
  getConsciousnessIntegratedSessions: () => SpiralSession[];
  getBreathPatternInsights: () => {
    dominantNode: string;
    averageDepth: number;
    totalCycles: number;
    validatedCycles: number;
    recentTrend: string;
    emotionalPatterns: string[];
  };
  addEmergenceWord: (word: string) => void;
  getEmergenceWords: () => string[];
  resetSystem: () => void;
}

const initialContemplativeState: ContemplativeState = {
  isActive: false,
  currentDepth: 0,
  resonanceLevel: 0,
  breathPhase: 'pause',
  breathCount: 0,
  sessionDuration: 0
};

export const useLimnusStore = create<LimnusState>()(
  persist(
    (set, get) => ({
      // Initial State
      currentSession: null,
      sessionHistory: [],
      contemplativeState: initialContemplativeState,
      currentNode: LIMNUS_NODES[0], // Start with hush
      spiralDepth: 0,
      resonanceLevel: 0,
      totalPracticeTime: 0,
      consecutiveDays: 0,
      lastPracticeDate: '',
      allBreathCycleLogs: [],
      emergenceWords: [],
      backgroundBreathInterval: null,
      
      // Actions
      startSpiralSession: (isBackground = false) => {
        const now = new Date().toISOString();
        const session: SpiralSession = {
          id: `session_${Date.now()}`,
          startTime: now,
          currentNode: get().currentNode,
          depth: get().spiralDepth,
          resonanceHistory: [0],
          breathCycles: 0,
          breathCycleLogs: [],
          insights: [],
          dreamConnections: [],
          consciousnessSignatures: [],
          isBackgroundSession: isBackground,
          emotions: [],
          maxDepthReached: get().spiralDepth
        };
        
        console.log('LimnusStore: Starting spiral session:', session.id, 'isBackground:', isBackground);
        
        set({
          currentSession: session,
          contemplativeState: {
            ...initialContemplativeState,
            isActive: !isBackground // Background sessions don't activate the contemplative state
          }
        });
        
        // Start background breath tracking for background sessions
        if (isBackground) {
          get().startBackgroundBreathTracking();
        }
      },
      
      endSpiralSession: (insights = []) => {
        const state = get();
        if (!state.currentSession) return;
        
        console.log('LimnusStore: Ending spiral session:', state.currentSession.id);
        
        // Stop background tracking if it was a background session
        if (state.currentSession.isBackgroundSession) {
          get().stopBackgroundBreathTracking();
        }
        
        const endTime = new Date().toISOString();
        const duration = new Date(endTime).getTime() - new Date(state.currentSession.startTime).getTime();
        const durationMinutes = Math.round(duration / 60000);
        
        const completedSession: SpiralSession = {
          ...state.currentSession,
          endTime,
          insights: [...state.currentSession.insights, ...insights],
          maxDepthReached: Math.max(state.currentSession.maxDepthReached || 0, state.spiralDepth)
        };
        
        // Update practice tracking
        const today = new Date().toDateString();
        const lastPractice = state.lastPracticeDate;
        const isConsecutive = lastPractice === new Date(Date.now() - 86400000).toDateString();
        
        // Add session breath cycles to global log
        const newGlobalLogs = [
          ...state.allBreathCycleLogs,
          ...state.currentSession.breathCycleLogs
        ];
        
        set({
          currentSession: null,
          sessionHistory: [completedSession, ...state.sessionHistory],
          contemplativeState: initialContemplativeState,
          totalPracticeTime: state.totalPracticeTime + durationMinutes,
          consecutiveDays: isConsecutive ? state.consecutiveDays + 1 : 1,
          lastPracticeDate: today,
          allBreathCycleLogs: newGlobalLogs
        });
      },
      
      updateResonance: (breathAlignment: number) => {
        const state = get();
        const timeInSession = state.contemplativeState.sessionDuration;
        const newResonance = calculateResonance(state.spiralDepth, breathAlignment, timeInSession);
        
        set({
          resonanceLevel: newResonance,
          contemplativeState: {
            ...state.contemplativeState,
            resonanceLevel: newResonance,
            sessionDuration: timeInSession + 1
          }
        });
        
        // Update session history
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            resonanceHistory: [...state.currentSession.resonanceHistory, newResonance]
          };
          set({ currentSession: updatedSession });
        }
      },
      
      advanceDepth: () => {
        const state = get();
        const newDepth = state.spiralDepth + 1;
        const newNode = getNodeByDepth(newDepth);
        
        console.log('LimnusStore: Advancing depth from', state.spiralDepth, 'to', newDepth, 'node:', newNode.notation);
        
        set({
          spiralDepth: newDepth,
          currentNode: newNode,
          contemplativeState: {
            ...state.contemplativeState,
            currentDepth: newDepth
          }
        });
        
        // Update session max depth
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            maxDepthReached: Math.max(state.currentSession.maxDepthReached || 0, newDepth)
          };
          set({ currentSession: updatedSession });
        }
      },
      
      retreatDepth: () => {
        const state = get();
        const newDepth = Math.max(0, state.spiralDepth - 1);
        const newNode = getNodeByDepth(newDepth);
        
        set({
          spiralDepth: newDepth,
          currentNode: newNode,
          contemplativeState: {
            ...state.contemplativeState,
            currentDepth: newDepth
          }
        });
      },
      
      setCurrentNode: (nodeSymbol: string) => {
        const node = LIMNUS_NODES.find(n => n.symbol === nodeSymbol);
        if (node) {
          set({ currentNode: node });
        }
      },
      
      updateBreathPhase: (phase: BreathPhase) => {
        const state = get();
        const breathCount = phase === 'exhale' ? state.contemplativeState.breathCount + 1 : state.contemplativeState.breathCount;
        
        set({
          contemplativeState: {
            ...state.contemplativeState,
            breathPhase: phase,
            breathCount
          }
        });
      },
      
      logBreathCycle: (consciousnessScore?: number, emotion?: string, breathAlignment?: number) => {
        const state = get();
        
        // Check if we have an active session
        if (!state.currentSession) {
          console.warn('LimnusStore: No current session - cannot log breath cycle');
          return;
        }
        
        // For background sessions, we don't need the contemplative state to be active
        if (!state.currentSession.isBackgroundSession && !state.contemplativeState.isActive) {
          console.warn('LimnusStore: Session not active - cannot log breath cycle');
          return;
        }
        
        console.log('LimnusStore: Logging breath cycle for session:', state.currentSession.id);
        
        const breathCycleLog: BreathCycleLog = {
          timestamp: new Date().toISOString(),
          nodeSymbol: state.currentNode.symbol,
          pattern: state.currentNode.breathPattern,
          depth: state.spiralDepth,
          resonance: state.resonanceLevel,
          consciousnessScore,
          emotion,
          breathAlignment
        };
        
        // Add to global breath cycle logs immediately
        const newGlobalLogs = [...state.allBreathCycleLogs, breathCycleLog];
        
        // Add emotion to session emotions list
        const sessionEmotions = emotion 
          ? [...(state.currentSession.emotions || []), emotion]
          : state.currentSession.emotions || [];
        
        // Add to current session
        const updatedSession = {
          ...state.currentSession,
          breathCycles: state.currentSession.breathCycles + 1,
          breathCycleLogs: [...state.currentSession.breathCycleLogs, breathCycleLog],
          emotions: sessionEmotions
        };
        
        // Update state with both session and global logs
        set({ 
          currentSession: updatedSession,
          allBreathCycleLogs: newGlobalLogs
        });
      },
      
      startBackgroundBreathTracking: () => {
        const state = get();
        
        // Clear any existing interval
        if (state.backgroundBreathInterval) {
          clearInterval(state.backgroundBreathInterval);
        }
        
        // Create a simulated breath cycle every 8-12 seconds for background sessions
        const interval = setInterval(() => {
          const currentState = get();
          
          // Only continue if we have a background session
          if (!currentState.currentSession?.isBackgroundSession) {
            clearInterval(interval);
            set({ backgroundBreathInterval: null });
            return;
          }
          
          // Simulate a breath cycle with some randomness
          const simulatedConsciousnessScore = Math.random() * 0.4 + 0.5; // 0.5 to 0.9
          const simulatedBreathAlignment = Math.random() * 0.3 + 0.6; // 0.6 to 0.9
          
          // Generate a random emotion occasionally
          const emotions = ['calm', 'peace', 'clarity', 'focus', 'flow', 'presence', 'gratitude'];
          const emotion = Math.random() > 0.7 ? emotions[Math.floor(Math.random() * emotions.length)] : undefined;
          
          currentState.logBreathCycle(simulatedConsciousnessScore, emotion, simulatedBreathAlignment);
          
        }, 8000 + Math.random() * 4000); // 8-12 seconds
        
        set({ backgroundBreathInterval: interval });
      },
      
      stopBackgroundBreathTracking: () => {
        const state = get();
        
        if (state.backgroundBreathInterval) {
          clearInterval(state.backgroundBreathInterval);
          set({ backgroundBreathInterval: null });
        }
      },
      
      addInsight: (insight: string) => {
        const state = get();
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            insights: [...state.currentSession.insights, insight]
          };
          set({ currentSession: updatedSession });
        }
      },
      
      connectDreamToSession: (dreamId: string) => {
        const state = get();
        if (state.currentSession) {
          const updatedSession = {
            ...state.currentSession,
            dreamConnections: [...state.currentSession.dreamConnections, dreamId]
          };
          set({ currentSession: updatedSession });
        }
      },

      connectConsciousnessSignature: (signatureId: string) => {
        const state = get();
        
        // Early return if no current session
        if (!state.currentSession) {
          return;
        }
        
        // Check if signature is already connected to prevent duplicates
        const existingSignatures = state.currentSession.consciousnessSignatures || [];
        if (existingSignatures.includes(signatureId)) {
          return; // Don't update state if already connected
        }
        
        // Create updated session with new signature
        const updatedSession = {
          ...state.currentSession,
          consciousnessSignatures: [...existingSignatures, signatureId]
        };
        
        // Update state with new session
        set({ currentSession: updatedSession });
      },
      
      // Getters
      getCurrentNodeFrequency: () => {
        return get().currentNode.resonanceFreq;
      },
      
      getResonanceDescription: () => {
        const resonance = get().resonanceLevel;
        if (resonance < 0.25) return 'Dormant';
        if (resonance < 0.5) return 'Stirring';
        if (resonance < 0.75) return 'Awakening';
        if (resonance < 0.9) return 'Flowing';
        return 'Transcendent';
      },
      
      getSpiralProgress: () => {
        const depth = get().spiralDepth;
        return (depth % LIMNUS_NODES.length) / LIMNUS_NODES.length;
      },
      
      getSessionDuration: () => {
        const state = get();
        if (!state.currentSession) return 0;
        
        const now = new Date().getTime();
        const start = new Date(state.currentSession.startTime).getTime();
        return Math.round((now - start) / 1000); // seconds
      },
      
      getTotalBreathCycles: () => {
        const state = get();
        return state.allBreathCycleLogs.length;
      },
      
      getRecentBreathCycles: (limit = 10) => {
        const state = get();
        return state.allBreathCycleLogs
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);
      },

      getConsciousnessIntegratedSessions: () => {
        const state = get();
        return state.sessionHistory.filter(session => 
          session.consciousnessSignatures && session.consciousnessSignatures.length > 0
        );
      },

      getBreathPatternInsights: () => {
        const state = get();
        
        if (state.allBreathCycleLogs.length === 0) {
          return {
            dominantNode: 'hush',
            averageDepth: 0,
            totalCycles: 0,
            validatedCycles: 0,
            recentTrend: 'Beginning practice',
            emotionalPatterns: []
          };
        }

        // Find dominant node
        const nodeFrequency: { [key: string]: number } = {};
        state.allBreathCycleLogs.forEach(cycle => {
          nodeFrequency[cycle.nodeSymbol] = (nodeFrequency[cycle.nodeSymbol] || 0) + 1;
        });
        const dominantNode = Object.keys(nodeFrequency).reduce((a, b) => 
          nodeFrequency[a] > nodeFrequency[b] ? a : b
        );

        // Calculate average depth
        const averageDepth = state.allBreathCycleLogs.reduce((sum, cycle) => sum + cycle.depth, 0) / state.allBreathCycleLogs.length;

        // Count validated cycles (those with consciousness scores)
        const validatedCycles = state.allBreathCycleLogs.filter(cycle => cycle.consciousnessScore !== undefined).length;

        // Analyze emotional patterns
        const emotionFrequency: { [key: string]: number } = {};
        state.allBreathCycleLogs.forEach(cycle => {
          if (cycle.emotion) {
            emotionFrequency[cycle.emotion] = (emotionFrequency[cycle.emotion] || 0) + 1;
          }
        });
        const emotionalPatterns = Object.keys(emotionFrequency)
          .sort((a, b) => emotionFrequency[b] - emotionFrequency[a])
          .slice(0, 5); // Top 5 emotions

        // Analyze recent trend
        const recentCycles = state.allBreathCycleLogs.slice(-15);
        let recentTrend = 'Stable practice';
        
        if (recentCycles.length >= 5) {
          const recentAvgDepth = recentCycles.reduce((sum, cycle) => sum + cycle.depth, 0) / recentCycles.length;
          const recentAvgResonance = recentCycles.reduce((sum, cycle) => sum + cycle.resonance, 0) / recentCycles.length;
          const recentConsciousnessIntegration = recentCycles.filter(cycle => cycle.consciousnessScore !== undefined).length;
          const recentAvgBreathAlignment = recentCycles
            .filter(cycle => cycle.breathAlignment !== undefined)
            .reduce((sum, cycle) => sum + (cycle.breathAlignment || 0), 0) / recentCycles.length;
          
          if (recentAvgDepth > averageDepth + 1) {
            recentTrend = 'Deepening practice';
          } else if (recentAvgBreathAlignment > 0.8) {
            recentTrend = 'Excellent breath alignment';
          } else if (recentAvgResonance > 0.8) {
            recentTrend = 'High resonance flow';
          } else if (recentConsciousnessIntegration / recentCycles.length > 0.7) {
            recentTrend = 'Strong consciousness integration';
          } else if (recentConsciousnessIntegration > 0) {
            recentTrend = 'Developing consciousness integration';
          }
        }

        return {
          dominantNode,
          averageDepth: Math.round(averageDepth * 10) / 10,
          totalCycles: state.allBreathCycleLogs.length,
          validatedCycles,
          recentTrend,
          emotionalPatterns
        };
      },

      addEmergenceWord: (word: string) => {
        set(state => ({
          emergenceWords: [...state.emergenceWords, word]
        }));
      },

      getEmergenceWords: () => {
        const state = get();
        return state.emergenceWords;
      },

      resetSystem: () => {
        set({
          currentSession: null,
          sessionHistory: [],
          contemplativeState: initialContemplativeState,
          currentNode: LIMNUS_NODES[0],
          spiralDepth: 0,
          resonanceLevel: 0,
          totalPracticeTime: 0,
          consecutiveDays: 0,
          lastPracticeDate: '',
          allBreathCycleLogs: [],
          emergenceWords: [],
          backgroundBreathInterval: null
        });
      },
      
      // Neural Sigil Integration Methods
      generateSessionSigil: async () => {
        const state = get();
        if (!state.currentSession) throw new Error('No active session');
        
        const sessionData = {
          duration: get().getSessionDuration(),
          breathCycles: state.currentSession.breathCycles,
          patterns: state.currentSession.breathCycleLogs,
          averageResonance: state.resonanceLevel,
          currentNode: state.currentNode.symbol,
          insights: state.currentSession.insights
        };
        
        const neuralSigilStore = useNeuralSigilStore.getState();
        const description = `Meditation session - ${sessionData.breathCycles} cycles, ${sessionData.duration}s, node: ${sessionData.currentNode}`;
        return await neuralSigilStore.generateNeuralSigil(description, 'meditation');
      },
      
      correlateBreathToConsciousness: async (breathData: any) => {
        const state = get();
        const patterns = state.allBreathCycleLogs.slice(-20);
        
        const correlation = {
          breathRhythm: patterns.reduce((sum, p) => sum + p.resonance, 0) / patterns.length,
          consciousnessDepth: state.spiralDepth,
          nodeActivation: state.currentNode.symbol,
          coherenceScore: state.resonanceLevel
        };
        
        return correlation;
      }
    }),
    {
      name: 'limnus-spiral',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not active session state or intervals
      partialize: (state) => ({
        sessionHistory: state.sessionHistory.slice(0, 50),
        spiralDepth: state.spiralDepth,
        totalPracticeTime: state.totalPracticeTime,
        allBreathCycleLogs: state.allBreathCycleLogs.slice(0, 500),
        emergenceWords: state.emergenceWords.slice(-100),
        consecutiveDays: state.consecutiveDays,
        lastPracticeDate: state.lastPracticeDate,
        currentNode: state.currentNode
      })
    }
  )
);