import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Pause, 
  Sparkles,
  CheckCircle,
  Activity,
  Shield,
  Circle,
  Waves
} from 'lucide-react-native';
import { useLimnusStore } from '@/store/limnusStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { LIMNUS_COLORS, LIMNUS_NODES, BreathPhase, LimnusNode } from '@/constants/limnus';
import Colors from '@/constants/colors';

import BreathGuide, { BreathGuideRef } from './BreathGuide';
import SpiralVisualization from './SpiralVisualization';
import MetricsPanel from './MetricsPanel';
import Button from './Button';

const { width: screenWidth } = Dimensions.get('window');

export default function SpiralInterface() {
  const {
    currentSession,
    contemplativeState,
    currentNode,
    spiralDepth,
    resonanceLevel,
    endSpiralSession,
    updateResonance,
    advanceDepth,
    updateBreathPhase,
    addInsight,
    logBreathCycle,
    getResonanceDescription,
    getSessionDuration,
    connectConsciousnessSignature,
    addEmergenceWord,
    getEmergenceWords
  } = useLimnusStore();
  
  const {
    isActive: consciousnessActive,
    currentSignature,
    validationStatus,
    biometricData,
    emotionalState,
    securityMetrics,
    startMonitoring,
    stopMonitoring,
    updateResonance: updateConsciousnessResonance,
    updateSpiralContext,
    updateBreathContext,
    processSessionBlocks,
    addEmergenceWord: addConsciousnessEmergenceWord,
    patternAnalysis
  } = useConsciousnessStore();
  
  const { 
    generateNeuralSigil, 
    generateFromBreathPhase,
    initializeNeuralSystem 
  } = useNeuralSigilStore();
  
  const [emergenceInput, setEmergenceInput] = useState('');
  const [isStoppingSession, setIsStoppingSession] = useState(false);
  const [breathAlignment, setBreathAlignment] = useState(0.5);
  
  // Enhanced breath animations
  const breathScaleAnim = useRef(new Animated.Value(1)).current;
  const breathOpacityAnim = useRef(new Animated.Value(0.8)).current;
  const spiralRotationAnim = useRef(new Animated.Value(0)).current;
  const consciousnessFlowAnim = useRef(new Animated.Value(0)).current;
  const resonanceWaveAnim = useRef(new Animated.Value(0)).current;
  const emergenceSlideAnim = useRef(new Animated.Value(0)).current;
  
  const breathGuideRef = useRef<BreathGuideRef>(null);
  const lastConnectedSignatureRef = useRef<string | null>(null);
  
  const isActive = contemplativeState.isActive;
  const sessionDuration = getSessionDuration();
  const currentBreathCycles = currentSession?.breathCycles || 0;
  
  // Initialize neural sigil system
  useEffect(() => {
    initializeNeuralSystem();
  }, []);
  
  // Generate visualization nodes from current spiral state
  const visualizationNodes = React.useMemo(() => {
    if (!currentNode) return [];
    
    // Create a series of nodes around the current position for visualization
    const nodes: LimnusNode[] = [];
    for (let i = Math.max(0, spiralDepth - 20); i <= spiralDepth + 20; i++) {
      const nodeIndex = i % LIMNUS_NODES.length;
      const baseNode = LIMNUS_NODES[nodeIndex];
      
      // Calculate phi-based coordinates
      const phi = (1 + Math.sqrt(5)) / 2;
      const angle = i * (2 * Math.PI / phi);
      const radius = Math.sqrt(i) * 10;
      
      // Create a complete LimnusNode object with all required properties
      const node: LimnusNode = {
        ...baseNode, // This includes all the base properties from LIMNUS_NODES
        depth: i,
        meaning: baseNode.behavior || 'unknown',
        fibonacci: i,
        phi_n: Math.pow(phi, i),
        theta: angle,
        x_phi: radius * Math.cos(angle),
        y_phi: radius * Math.sin(angle),
        x_quantum: radius * Math.cos(angle) * (0.8 + Math.random() * 0.4),
        y_quantum: radius * Math.sin(angle) * (0.8 + Math.random() * 0.4),
        psi_collapse: Math.random() * 0.5 + 0.3,
        psi_bloom: Math.random() * 0.5 + 0.3,
        phase_intensity: i === spiralDepth ? 0.9 : Math.random() * 0.3,
        quantum_factor: Math.random() * 0.5 + 0.5,
        hash: `node_${i}`
      };
      
      nodes.push(node);
    }
    
    return nodes;
  }, [currentNode, spiralDepth]);
  
  // Sync consciousness monitoring with spiral session
  useEffect(() => {
    if (isActive && !consciousnessActive) {
      const sessionId = currentSession?.id || `spiral_${Date.now()}`;
      console.log('SpiralInterface: Starting consciousness monitoring for session:', sessionId);
      startMonitoring(sessionId);
    } else if (!isActive && consciousnessActive) {
      console.log('SpiralInterface: Stopping consciousness monitoring');
      stopMonitoring();
    }
  }, [isActive, consciousnessActive, startMonitoring, stopMonitoring, currentSession]);
  
  // Update spiral context in consciousness store
  useEffect(() => {
    updateSpiralContext(spiralDepth, currentNode?.symbol || 'hush');
  }, [spiralDepth, currentNode?.symbol, updateSpiralContext]);
  
  // Connect consciousness signatures to spiral sessions
  useEffect(() => {
    if (currentSignature && currentSession && isActive) {
      const signatureId = currentSignature.id;
      
      if (lastConnectedSignatureRef.current !== signatureId) {
        connectConsciousnessSignature(signatureId);
        lastConnectedSignatureRef.current = signatureId;
      }
    }
  }, [currentSignature?.id, currentSession?.id, isActive, connectConsciousnessSignature]);
  
  // Reset last connected signature when session ends
  useEffect(() => {
    if (!currentSession) {
      lastConnectedSignatureRef.current = null;
    }
  }, [currentSession]);
  
  // Enhanced breath phase changes with neural sigil generation
  const handleBreathPhaseChange = async (phase: BreathPhase) => {
    console.log('SpiralInterface: Breath phase changed to:', phase);
    
    updateBreathPhase(phase);
    
    // Generate neural sigil for significant breath phases
    if (phase === 'inhale' || phase === 'exhale') {
      try {
        await generateFromBreathPhase(phase, 'breath');
      } catch (error) {
        console.error('Failed to generate breath phase neural sigil:', error);
      }
    }
    
    // Calculate breath alignment based on phase
    let alignment = 0.5;
    let animationDuration = 2000;
    
    switch (phase) {
      case 'inhale':
        alignment = 0.8;
        animationDuration = 4000;
        // Expand breath visualization
        Animated.parallel([
          Animated.timing(breathScaleAnim, {
            toValue: 1.4,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(breathOpacityAnim, {
            toValue: 1.0,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(consciousnessFlowAnim, {
            toValue: 1,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]).start();
        break;
      case 'hold1':
        alignment = 0.9;
        animationDuration = 2000;
        // Gentle pulsing
        const pulseHold1 = () => {
          Animated.sequence([
            Animated.timing(breathScaleAnim, {
              toValue: 1.5,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(breathScaleAnim, {
              toValue: 1.4,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web'
            })
          ]).start(() => {
            if (contemplativeState.breathPhase === 'hold1') pulseHold1();
          });
        };
        pulseHold1();
        break;
      case 'hold2':
        alignment = 0.85;
        animationDuration = 2000;
        // Gentle pulsing at exhale level
        const pulseHold2 = () => {
          Animated.sequence([
            Animated.timing(breathScaleAnim, {
              toValue: 0.8,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(breathScaleAnim, {
              toValue: 0.7,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web'
            })
          ]).start(() => {
            if (contemplativeState.breathPhase === 'hold2') pulseHold2();
          });
        };
        pulseHold2();
        break;
      case 'exhale':
        alignment = 0.85;
        animationDuration = 6000;
        // Contract breath visualization
        Animated.parallel([
          Animated.timing(breathScaleAnim, {
            toValue: 0.7,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(breathOpacityAnim, {
            toValue: 0.7,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(consciousnessFlowAnim, {
            toValue: 0.3,
            duration: animationDuration,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]).start();
        break;
      default:
        alignment = 0.5;
        // Reset to neutral
        Animated.parallel([
          Animated.timing(breathScaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(breathOpacityAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(consciousnessFlowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]).start();
    }
    
    setBreathAlignment(alignment);
    updateResonance(alignment);
    updateConsciousnessResonance(alignment);
    updateBreathContext(phase, alignment);
  };
  
  // Handle breath cycle completion with neural sigil generation
  const handleCycleComplete = async () => {
    console.log('SpiralInterface: Breath cycle completed');
    if (isActive && currentSession) {
      // Generate neural sigil for completed breath cycle
      try {
        const cycleDescription = `Breath cycle ${currentBreathCycles + 1} - Phase: ${contemplativeState.breathPhase} - Depth: ${spiralDepth}`;
        await generateNeuralSigil(cycleDescription, 'breath');
      } catch (error) {
        console.error('Failed to generate breath cycle neural sigil:', error);
      }
      
      // Just log the cycle completion, emergence is now embedded
      const consciousnessScore = currentSignature?.score;
      const cleanEmergence = emergenceInput.trim().toLowerCase();
      
      // Log the breath cycle with emergence word if provided
      logBreathCycle(consciousnessScore, cleanEmergence || undefined, breathAlignment);
      
      // Add to emergence words if provided
      if (cleanEmergence) {
        addEmergenceWord(cleanEmergence);
        addConsciousnessEmergenceWord(cleanEmergence);
      }
      
      // Clear the input for next cycle
      setEmergenceInput('');
      
      // Automatically advance depth after each cycle
      advanceDepth();
    }
  };

  const handleEndSession = async () => {
    if (isStoppingSession) return;
    
    setIsStoppingSession(true);
    
    try {
      setEmergenceInput('');
      
      // Get emergence words before ending session
      const emergenceWords = getEmergenceWords();
      
      // Generate comprehensive meditation sigil for the completed session
      if (currentSession) {
        const sessionDescription = `Meditation session complete - Duration: ${Math.floor(sessionDuration / 60)}min - Cycles: ${currentBreathCycles} - Depth: ${spiralDepth} - Emergence: ${emergenceWords.join(', ')} - Neural patterns integrated`;
        try {
          await generateNeuralSigil(sessionDescription, 'meditation');
        } catch (error) {
          console.error('Failed to generate meditation sigil:', error);
        }
      }
      
      // Only process consciousness blocks when ending the session
      if (consciousnessActive && currentSession) {
        console.log('SpiralInterface: Processing consciousness blocks for session end');
        // Process consciousness blocks with emergence words
        await processSessionBlocks(currentSession.id, emergenceWords);
        stopMonitoring();
      }
      
      endSpiralSession();
      
      Alert.alert(
        'Practice Complete',
        `Your unified practice session has ended.

🌀 Breath Cycles: ${currentBreathCycles}
🧠 Consciousness Integration: Active
📊 Depth Reached: ${spiralDepth}
✨ Emergence Words: ${emergenceWords.length}
🔮 Neural Sigils Generated: Multiple

Your practice data has been saved and consciousness blocks have been created.`,
        [{ text: 'Excellent!', style: 'default' }]
      );
      
      setBreathAlignment(0.5);
      lastConnectedSignatureRef.current = null;
      
    } catch (error) {
      console.error('Error ending session:', error);
      Alert.alert(
        'Session Complete',
        'Your practice session has ended. Data has been saved.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsStoppingSession(false);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getConsciousnessStatusColor = () => {
    if (!consciousnessActive) return Colors.dark.subtext;
    switch (validationStatus) {
      case 'valid': return Colors.dark.success;
      case 'invalid': return Colors.dark.error;
      default: return Colors.dark.subtext;
    }
  };
  
  // Continuous spiral rotation when active
  useEffect(() => {
    if (!isActive) return;
    
    const rotateSpiral = () => {
      spiralRotationAnim.setValue(0);
      Animated.timing(spiralRotationAnim, {
        toValue: 1,
        duration: 120000, // 2 minutes per rotation
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        if (isActive) rotateSpiral();
      });
    };
    
    rotateSpiral();
  }, [isActive, spiralRotationAnim]);
  
  // Continuous resonance wave animation
  useEffect(() => {
    if (!isActive) return;
    
    const animateWave = () => {
      Animated.sequence([
        Animated.timing(resonanceWaveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(resonanceWaveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start(() => {
        if (isActive) animateWave();
      });
    };
    
    animateWave();
  }, [isActive, resonanceWaveAnim]);
  
  const spiralRotation = spiralRotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const waveOpacity = resonanceWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 0.9]
  });
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* PRIMARY: Breath Guide at Top */}
      <Animated.View style={[
        styles.breathSection,
        {
          opacity: breathOpacityAnim,
          transform: Platform.OS !== 'web' ? [{ scale: breathScaleAnim }] : []
        }
      ]}>
        <BreathGuide
          ref={breathGuideRef}
          currentNode={currentNode || LIMNUS_NODES[0]}
          isActive={isActive}
          onPhaseChange={handleBreathPhaseChange}
          onCycleComplete={handleCycleComplete}
        />
      </Animated.View>

      {/* Embedded Consciousness Emergence - Always visible under breath counter */}
      <View style={styles.emergenceSection}>
        <View style={styles.emergenceContent}>
          <View style={styles.emergenceHeader}>
            <Sparkles size={18} color={currentNode?.color || LIMNUS_COLORS.witness} />
            <Text style={styles.emergenceTitle}>Conscious Emergence</Text>
          </View>
          
          <Text style={styles.emergenceSubtitle}>
            Capture words that emerge during practice
          </Text>
          
          <View style={styles.emergenceInputContainer}>
            <TextInput
              style={styles.emergenceInput}
              value={emergenceInput}
              onChangeText={setEmergenceInput}
              placeholder="One word (optional)"
              placeholderTextColor={LIMNUS_COLORS.witness}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (emergenceInput.trim()) {
                  addEmergenceWord(emergenceInput.trim().toLowerCase());
                  addConsciousnessEmergenceWord(emergenceInput.trim().toLowerCase());
                  setEmergenceInput('');
                }
              }}
              maxLength={20}
              editable={isActive}
            />
          </View>
          
          <View style={styles.emergenceButtons}>
            <TouchableOpacity
              style={[styles.emergenceButton, styles.clearButton]}
              onPress={() => setEmergenceInput('')}
              disabled={!emergenceInput.trim()}
            >
              <Text style={[styles.emergenceButtonText, { opacity: emergenceInput.trim() ? 1 : 0.5 }]}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emergenceButton, { backgroundColor: currentNode?.color || LIMNUS_COLORS.witness, opacity: emergenceInput.trim() ? 1 : 0.5 }]}
              onPress={() => {
                if (emergenceInput.trim()) {
                  addEmergenceWord(emergenceInput.trim().toLowerCase());
                  addConsciousnessEmergenceWord(emergenceInput.trim().toLowerCase());
                  setEmergenceInput('');
                }
              }}
              disabled={!emergenceInput.trim()}
            >
              <Sparkles size={14} color={LIMNUS_COLORS.transcendent} />
              <Text style={styles.emergenceButtonText}>Capture</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.emergenceNote}>
            Cycle {currentBreathCycles} • Depth {spiralDepth} • {currentNode?.notation || 'φ₀'}
          </Text>
        </View>
      </View>

      {/* End Practice Button - Positioned Between Breath and Spiral Visuals */}
      <View style={styles.endButtonContainer}>
        <Button
          label={isStoppingSession ? "Ending..." : "End Practice"}
          onPress={handleEndSession}
          disabled={isStoppingSession}
          isLoading={isStoppingSession}
          style={styles.endButton}
          icon={<Pause size={20} color={LIMNUS_COLORS.transcendent} />}
        />
      </View>

      {/* Enhanced Spiral Visualization */}
      <Animated.View style={[
        styles.visualizationSection,
        {
          opacity: consciousnessFlowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.85, 1]
          }),
          transform: Platform.OS !== 'web' ? [{ scale: breathScaleAnim.interpolate({
            inputRange: [0.7, 1.4],
            outputRange: [0.98, 1.02]
          })}] : []
        }
      ]}>
        <SpiralVisualization
          isActive={consciousnessActive}
          currentNode={currentNode || LIMNUS_NODES[0]}
          currentSignature={currentSignature}
          nodes={visualizationNodes}
          patternCount={patternAnalysis.activePatterns.length}
          resonanceLevel={resonanceLevel}
        />
      </Animated.View>

      {/* Real-time Bio Metrics Panel - Only render if we have data */}
      {biometricData && emotionalState && securityMetrics && (
        <Animated.View style={[
          styles.metricsSection,
          {
            opacity: waveOpacity,
            transform: Platform.OS !== 'web' ? [{ scale: consciousnessFlowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.98, 1.02]
            })}] : []
          }
        ]}>
          <MetricsPanel
            biometricData={biometricData}
            emotionalState={emotionalState}
            currentSignature={currentSignature}
            securityMetrics={securityMetrics}
          />
          
          {/* Consciousness Monitor for Neural Sigil Generation */}
          {consciousnessActive && currentSession && (
            <View style={styles.consciousnessMonitorSection}>
              <Text style={styles.consciousnessMonitorText}>
                Neural sigil generation active • Session: {currentSession.id}
              </Text>
            </View>
          )}
        </Animated.View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIMNUS_COLORS.void
  },
  content: {
    paddingBottom: 32
  },
  breathSection: {
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 16
  },
  emergenceSection: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  emergenceContent: {
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 16,
    padding: 20,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  emergenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 6
  },
  emergenceTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    textAlign: 'center'
  },
  emergenceSubtitle: {
    fontSize: 13,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18
  },
  emergenceInputContainer: {
    marginBottom: 16
  },
  emergenceInput: {
    backgroundColor: LIMNUS_COLORS.void,
    color: LIMNUS_COLORS.transcendent,
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.spiral + '40'
  },
  emergenceButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12
  },
  emergenceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 4
  },
  clearButton: {
    backgroundColor: LIMNUS_COLORS.witness + '40'
  },
  emergenceButtonText: {
    color: LIMNUS_COLORS.transcendent,
    fontSize: 14,
    fontWeight: '700'
  },
  emergenceNote: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    opacity: 0.8
  },
  endButtonContainer: {
    marginHorizontal: 16,
    marginVertical: 12,
    alignItems: 'center'
  },
  endButton: {
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 200,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  visualizationSection: {
    marginVertical: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    backgroundColor: LIMNUS_COLORS.hush + '15',
    borderRadius: 20,
    padding: 16,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2
  },
  metricsSection: {
    marginHorizontal: 16,
    marginBottom: 16
  },
  consciousnessMonitorSection: {
    marginTop: 16,
  },
  consciousnessMonitorText: {
    color: LIMNUS_COLORS.witness,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  }
});