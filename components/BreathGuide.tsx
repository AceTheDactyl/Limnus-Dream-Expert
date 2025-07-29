import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  BREATH_PATTERNS, 
  LimnusNode, 
  LIMNUS_COLORS,
  BreathPhase,
  getBreathPhaseColor
} from '@/constants/limnus';

const { width: screenWidth } = Dimensions.get('window');

interface BreathGuideProps {
  currentNode: LimnusNode;
  isActive: boolean;
  onPhaseChange?: (phase: BreathPhase) => void;
  onCycleComplete?: () => void;
}

export interface BreathGuideRef {
  continueToNextCycle: () => void;
  forceRestart: () => void;
}

const BreathGuide = forwardRef<BreathGuideRef, BreathGuideProps>(function BreathGuide({
  currentNode,
  isActive,
  onPhaseChange,
  onCycleComplete
}, ref) {
  const [currentPhase, setCurrentPhase] = useState<BreathPhase>('pause');
  const [countdown, setCountdown] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;
  const innerScaleAnim = useRef(new Animated.Value(0.8)).current;
  const outerScaleAnim = useRef(new Animated.Value(1.2)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flowAnim = useRef(new Animated.Value(0)).current;
  const phaseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentPhaseIndexRef = useRef(0);
  const isActiveRef = useRef(isActive);
  const isMountedRef = useRef(true);
  
  // Update refs when values change
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);
  
  // Memoize the pattern to avoid unnecessary re-renders
  const pattern = useMemo(() => {
    const nodePattern = BREATH_PATTERNS[currentNode.breathPattern as keyof typeof BREATH_PATTERNS] || BREATH_PATTERNS.natural;
    return nodePattern;
  }, [currentNode.breathPattern]);
  
  // Build phases array from pattern
  const phases = useMemo(() => {
    const phaseArray: Array<{ phase: BreathPhase; duration: number }> = [];
    
    if (pattern.inhale > 0) phaseArray.push({ phase: 'inhale', duration: pattern.inhale });
    if (pattern.hold1 > 0) phaseArray.push({ phase: 'hold1', duration: pattern.hold1 });
    if (pattern.exhale > 0) phaseArray.push({ phase: 'exhale', duration: pattern.exhale });
    if (pattern.hold2 > 0) phaseArray.push({ phase: 'hold2', duration: pattern.hold2 });
    
    // Fallback to simple pattern if no phases
    if (phaseArray.length === 0) {
      phaseArray.push({ phase: 'inhale', duration: 4 });
      phaseArray.push({ phase: 'exhale', duration: 4 });
    }
    
    return phaseArray;
  }, [pattern]);
  
  const clearAllTimers = useCallback(() => {
    console.log('BreathGuide: Clearing all timers');
    if (phaseTimeoutRef.current) {
      clearTimeout(phaseTimeoutRef.current);
      phaseTimeoutRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);
  
  const updatePhase = useCallback((phase: BreathPhase) => {
    if (!isMountedRef.current) return;
    
    console.log('BreathGuide: Updating phase to:', phase);
    setCurrentPhase(phase);
    onPhaseChange?.(phase);
    
    // Enhanced breath-like animations
    if (phase === 'inhale') {
      // Expanding breath visualization
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1.6,
          duration: pattern.inhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(innerScaleAnim, {
          toValue: 1.4,
          duration: pattern.inhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(outerScaleAnim, {
          toValue: 1.8,
          duration: pattern.inhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacityAnim, {
          toValue: 1.0,
          duration: pattern.inhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(flowAnim, {
          toValue: 1,
          duration: pattern.inhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    } else if (phase === 'exhale') {
      // Contracting breath visualization
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.6,
          duration: pattern.exhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(innerScaleAnim, {
          toValue: 0.4,
          duration: pattern.exhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(outerScaleAnim, {
          toValue: 0.8,
          duration: pattern.exhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: pattern.exhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(flowAnim, {
          toValue: 0.2,
          duration: pattern.exhale * 1000,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    } else if (phase === 'hold1' || phase === 'hold2') {
      // Gentle pulsing during hold phases
      const holdPulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: Platform.OS !== 'web'
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 800,
            useNativeDriver: Platform.OS !== 'web'
          })
        ]).start(() => {
          if (currentPhase === 'hold1' || currentPhase === 'hold2') holdPulse();
        });
      };
      holdPulse();
      
      Animated.timing(opacityAnim, {
        toValue: 0.9,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web'
      }).start();
    } else if (phase === 'pause') {
      // Reset to neutral state with gentle flow
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(innerScaleAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(outerScaleAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(flowAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
    }
  }, [scaleAnim, opacityAnim, onPhaseChange, pattern]);
  
  // Simplified breath cycle runner using sequential timeouts
  const runBreathCycle = useCallback(() => {
    if (!isActiveRef.current || !isMountedRef.current) {
      console.log('BreathGuide: Cannot start cycle - not active or unmounted');
      return;
    }
    
    console.log('BreathGuide: Starting new breath cycle with phases:', phases);
    clearAllTimers();
    setIsRunning(true);
    currentPhaseIndexRef.current = 0;
    
    const runPhase = (phaseIndex: number) => {
      if (!isActiveRef.current || !isMountedRef.current || phaseIndex >= phases.length) {
        // Cycle complete
        console.log('BreathGuide: Cycle complete');
        clearAllTimers();
        setCycleCount(prev => prev + 1);
        updatePhase('pause');
        setCountdown(0);
        setIsRunning(false);
        currentPhaseIndexRef.current = 0;
        
        // Call cycle complete callback after a brief pause
        setTimeout(() => {
          if (isActiveRef.current && isMountedRef.current) {
            try {
              onCycleComplete?.();
            } catch (error) {
              console.error('Error calling onCycleComplete:', error);
            }
          }
        }, 1000);
        return;
      }
      
      const currentPhaseData = phases[phaseIndex];
      const phaseDurationMs = currentPhaseData.duration * 1000;
      
      console.log(`BreathGuide: Starting phase ${phaseIndex}: ${currentPhaseData.phase} for ${currentPhaseData.duration}s`);
      
      // Update phase
      currentPhaseIndexRef.current = phaseIndex;
      updatePhase(currentPhaseData.phase);
      
      // Start countdown
      let remainingSeconds = currentPhaseData.duration;
      setCountdown(remainingSeconds);
      
      // Update countdown every second
      countdownIntervalRef.current = setInterval(() => {
        remainingSeconds -= 1;
        if (remainingSeconds >= 0) {
          setCountdown(remainingSeconds);
        }
      }, 1000);
      
      // Schedule next phase
      phaseTimeoutRef.current = setTimeout(() => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        runPhase(phaseIndex + 1);
      }, phaseDurationMs);
    };
    
    // Start with first phase
    runPhase(0);
    
  }, [phases, updatePhase, onCycleComplete, clearAllTimers]);
  
  // Function to continue to next cycle (called from parent when advance is clicked)
  const continueToNextCycle = useCallback(() => {
    console.log('BreathGuide: Continuing to next cycle');
    clearAllTimers();
    setIsRunning(false);
    setCurrentPhase('pause');
    setCountdown(0);
    currentPhaseIndexRef.current = 0;
    
    // Start next cycle with a clean state
    if (isActiveRef.current && isMountedRef.current) {
      setTimeout(() => {
        if (isActiveRef.current && isMountedRef.current) {
          runBreathCycle();
        }
      }, 1000);
    }
  }, [runBreathCycle, clearAllTimers]);
  
  // Force restart function
  const forceRestart = useCallback(() => {
    console.log('BreathGuide: Force restarting');
    clearAllTimers();
    setCurrentPhase('pause');
    setCountdown(0);
    setIsRunning(false);
    currentPhaseIndexRef.current = 0;
    
    if (isActiveRef.current && isMountedRef.current) {
      // Start immediately
      setTimeout(() => {
        if (isActiveRef.current && isMountedRef.current) {
          console.log('BreathGuide: Force restart starting breath cycle');
          runBreathCycle();
        }
      }, 500);
    }
  }, [clearAllTimers, runBreathCycle]);
  
  // Expose the continue function to parent through ref
  useImperativeHandle(ref, () => ({
    continueToNextCycle,
    forceRestart
  }), [continueToNextCycle, forceRestart]);
  
  // Handle session state changes - SIMPLIFIED
  useEffect(() => {
    if (!isActive) {
      console.log('BreathGuide: Session inactive, clearing state');
      clearAllTimers();
      setCurrentPhase('pause');
      setCountdown(0);
      setCycleCount(0);
      setIsRunning(false);
      currentPhaseIndexRef.current = 0;
      
      // Reset all animations
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(innerScaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(outerScaleAnim, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(flowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start();
      
      return;
    }
    
    // When session becomes active, start with a brief delay to ensure state is clean
    if (!isRunning) {
      console.log('BreathGuide: Session active, starting breath cycle');
      setTimeout(() => {
        if (isActiveRef.current && isMountedRef.current && !isRunning) {
          runBreathCycle();
        }
      }, 1000);
    }
  }, [isActive, isRunning, runBreathCycle, clearAllTimers, scaleAnim, opacityAnim]);
  
  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      console.log('BreathGuide: Component unmounting, cleaning up');
      isMountedRef.current = false;
      clearAllTimers();
    };
  }, [clearAllTimers]);
  
  const getPhaseInstruction = () => {
    if (!isActive) {
      return 'Ready';
    }
    
    if (currentPhase === 'pause' && !isRunning) {
      return 'Starting';
    }
    
    switch (currentPhase) {
      case 'inhale': return 'In';
      case 'hold1': return 'Hold';
      case 'hold2': return 'Hold';
      case 'exhale': return 'Out';
      case 'pause': return 'Rest';
      default: return 'Ready';
    }
  };
  
  const getPhaseColor = () => {
    return getBreathPhaseColor(currentPhase);
  };
  
  const getPhaseGradient = (): [string, string, string] => {
    const baseColor = getPhaseColor();
    switch (currentPhase) {
      case 'inhale': 
        return [baseColor + '20', baseColor + '80', baseColor + 'FF'];
      case 'exhale': 
        return [baseColor + 'FF', baseColor + '80', baseColor + '20'];
      case 'hold1':
      case 'hold2':
        return [baseColor + '40', baseColor + 'AA', baseColor + '60'];
      default:
        return [LIMNUS_COLORS.hush + '40', LIMNUS_COLORS.hush + '80', LIMNUS_COLORS.hush + '40'];
    }
  };
  
  // Continuous gentle rotation
  useEffect(() => {
    if (!isActive) return;
    
    const rotate = () => {
      rotationAnim.setValue(0);
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 180000, // 3 minutes per rotation
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        if (isActiveRef.current) rotate();
      });
    };
    
    rotate();
  }, [isActive, rotationAnim]);
  
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  return (
    <View style={styles.container}>
      {/* Outer breath field */}
      <Animated.View 
        style={[
          styles.outerBreathField,
          {
            transform: Platform.OS !== 'web' ? [
              { scale: outerScaleAnim },
              { rotate: rotation }
            ] : [{ scale: 1 }],
            opacity: flowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.2, 0.4]
            })
          }
        ]}
      >
        <LinearGradient
          colors={getPhaseGradient()}
          style={styles.gradientField}
        />
      </Animated.View>
      
      {/* Middle breath ring */}
      <Animated.View 
        style={[
          styles.middleBreathRing,
          {
            transform: Platform.OS !== 'web' ? [
              { scale: scaleAnim },
              { rotate: rotationAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [360, 0]
              })}
            ] : [{ scale: 1 }],
            opacity: opacityAnim.interpolate({
              inputRange: [0.7, 1.0],
              outputRange: [0.7, 0.9]
            })
          }
        ]}
      >
        <LinearGradient
          colors={[getPhaseColor() + '40', getPhaseColor() + '80', getPhaseColor() + '40']}
          style={styles.gradientRing}
        />
      </Animated.View>
      
      {/* Inner breath core with separated instruction and countdown */}
      <Animated.View 
        style={[
          styles.breathCore,
          {
            transform: Platform.OS !== 'web' ? [
              { scale: innerScaleAnim },
              { scale: pulseAnim }
            ] : [{ scale: 1 }],
            opacity: opacityAnim
          }
        ]}
      >
        <LinearGradient
          colors={[getPhaseColor() + 'FF', getPhaseColor() + 'AA', getPhaseColor() + '80']}
          style={styles.coreGradient}
        >
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>{getPhaseInstruction()}</Text>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Separated countdown display */}
      {countdown > 0 && isActive && (
        <View style={styles.countdownContainer}>
          <Text style={[styles.countdownText, { color: getPhaseColor() }]}>
            {Math.ceil(countdown)}
          </Text>
        </View>
      )}
      

      
      {/* Simplified pattern visualization */}
      {isActive && (
        <View style={styles.patternVisualization}>
          {phases.map((phaseData, index) => {
            const isCurrentPhase = index === currentPhaseIndexRef.current && isRunning;
            const phaseWidth = Math.max((phaseData.duration / 8) * 30, 16);
            
            return (
              <View
                key={index}
                style={[
                  styles.patternSegment,
                  {
                    width: phaseWidth,
                    backgroundColor: isCurrentPhase ? getPhaseColor() : LIMNUS_COLORS.hush,
                    opacity: isCurrentPhase ? 1 : 0.3
                  }
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

export default BreathGuide;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
    position: 'relative',
    height: 320
  },
  outerBreathField: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    top: 16
  },
  gradientField: {
    width: '100%',
    height: '100%',
    borderRadius: 110
  },
  middleBreathRing: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    top: 36
  },
  gradientRing: {
    width: '100%',
    height: '100%',
    borderRadius: 90
  },
  breathCore: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    top: 56,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12
  },
  coreGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center'
  },
  instructionContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: LIMNUS_COLORS.void,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  countdownContainer: {
    position: 'absolute',
    top: 210,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: LIMNUS_COLORS.void + '80',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4
  },
  countdownText: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: LIMNUS_COLORS.void,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },

  patternVisualization: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 16
  },
  patternSegment: {
    height: 6,
    borderRadius: 3,
    minWidth: 12,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1
  }
});