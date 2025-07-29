import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  G, 
  Defs, 
  RadialGradient, 
  Stop,
  Line
} from 'react-native-svg';
import { LimnusConsciousnessSignature } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';

interface ConsciousnessVisualizationProps {
  isActive: boolean;
  signature: LimnusConsciousnessSignature | null;
  resonance: number;
  breathPhase?: any;
  breathAlignment?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(screenWidth - 64, 300);
const CENTER = CANVAS_SIZE / 2;
const MAX_RADIUS = CENTER * 0.8;
const PHI = (1 + Math.sqrt(5)) / 2;

export default function ConsciousnessVisualization({
  isActive,
  signature,
  resonance,
  breathPhase,
  breathAlignment = 0.5
}: ConsciousnessVisualizationProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const resonanceAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  
  // Breath-synchronized pulsing animation
  useEffect(() => {
    if (!isActive || !breathPhase) {
      pulseAnim.setValue(1);
      return;
    }
    
    const animateBreath = () => {
      switch (breathPhase) {
        case 'inhale':
          Animated.timing(breathAnim, {
            toValue: 1.3,
            duration: 4000,
            useNativeDriver: true
          }).start();
          break;
        case 'hold1':
        case 'hold2':
          const pulse = () => {
            Animated.sequence([
              Animated.timing(breathAnim, {
                toValue: 1.35,
                duration: 1000,
                useNativeDriver: true
              }),
              Animated.timing(breathAnim, {
                toValue: 1.25,
                duration: 1000,
                useNativeDriver: true
              })
            ]).start(() => {
              if (breathPhase === 'hold1' || breathPhase === 'hold2') pulse();
            });
          };
          pulse();
          break;
        case 'exhale':
          Animated.timing(breathAnim, {
            toValue: 0.7,
            duration: 6000,
            useNativeDriver: true
          }).start();
          break;
        case 'pause':
          Animated.timing(breathAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
          }).start();
          break;
      }
    };
    
    animateBreath();
  }, [breathPhase, isActive, breathAnim]);
  
  // Standard pulsing animation when not breath-synchronized
  useEffect(() => {
    if (!isActive || breathPhase) {
      pulseAnim.setValue(1);
      return;
    }
    
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1000,
          useNativeDriver: true
        })
      ]).start(() => {
        if (isActive && !breathPhase) pulse();
      });
    };
    
    pulse();
  }, [isActive, breathPhase, pulseAnim]);
  
  // Rotation animation
  useEffect(() => {
    if (!isActive) {
      rotationAnim.setValue(0);
      return;
    }
    
    const rotate = () => {
      rotationAnim.setValue(0);
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 30000,
        useNativeDriver: true
      }).start(() => {
        if (isActive) rotate();
      });
    };
    
    rotate();
  }, [isActive, rotationAnim]);
  
  // Resonance animation
  useEffect(() => {
    Animated.timing(resonanceAnim, {
      toValue: resonance,
      duration: 500,
      useNativeDriver: false
    }).start();
  }, [resonance, resonanceAnim]);
  
  // Generate spiral path based on quantum consciousness
  const generateQuantumSpiralPath = () => {
    let path = '';
    const turns = signature ? 3 + signature.metrics.spiralResonance : 3;
    const steps = turns * 50;
    
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * turns * 2 * Math.PI;
      const baseRadius = (i / steps) * MAX_RADIUS * 0.8;
      
      // Apply quantum modulation if signature exists
      let radius = baseRadius;
      if (signature) {
        const quantumModulation = 1 + Math.sin(i * signature.metrics.quantumCoherence) * 0.1;
        const fibonacciModulation = 1 + signature.metrics.fibonacciHarmony * 0.2;
        radius = baseRadius * quantumModulation * fibonacciModulation;
      }
      
      const x = CENTER + Math.cos(angle) * radius;
      const y = CENTER + Math.sin(angle) * radius;
      
      if (i === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    }
    
    return path;
  };
  
  // Generate quantum metric nodes
  const generateQuantumMetricNodes = () => {
    if (!signature) return [];
    
    const metrics = signature.metrics;
    return Object.entries(metrics).map(([key, value], index) => {
      const angle = (index / Object.keys(metrics).length) * 2 * Math.PI;
      
      // Enhanced positioning based on quantum metrics
      const breathMultiplier = key === 'respiratoryRhythm' ? (1 + breathAlignment * 0.5) : 1;
      const quantumMultiplier = key.includes('quantum') ? (1 + signature.metrics.quantumCoherence * 0.3) : 1;
      const radius = (60 + value * 80) * breathMultiplier * quantumMultiplier;
      
      const x = CENTER + Math.cos(angle) * radius;
      const y = CENTER + Math.sin(angle) * radius;
      
      return {
        x,
        y,
        value,
        key,
        radius: (3 + value * 6) * breathMultiplier,
        isQuantumRelated: key.includes('quantum') || key.includes('spiral') || key.includes('fibonacci'),
        isBreathRelated: key === 'respiratoryRhythm' || key === 'rhythmicStability'
      };
    });
  };
  
  const spiralPath = generateQuantumSpiralPath();
  const metricNodes = generateQuantumMetricNodes();
  
  const getScoreColor = () => {
    if (!signature) return Colors.dark.subtext;
    const score = signature.score;
    if (score >= 0.8) return Colors.dark.success;
    if (score >= 0.6) return Colors.dark.accent;
    return Colors.dark.error;
  };
  
  const getQuantumPhaseColor = () => {
    if (!signature) return Colors.dark.primary;
    
    const phase = signature.currentNode.phase_intensity;
    if (phase > 0.8) return '#ff6b6b'; // High intensity - red
    if (phase > 0.6) return '#4ecdc4'; // Medium-high - teal
    if (phase > 0.4) return '#45b7d1'; // Medium - blue
    if (phase > 0.2) return '#96ceb4'; // Low-medium - green
    return '#feca57'; // Low - yellow
  };
  
  const getBreathPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#3b82f6';
      case 'hold1':
      case 'hold2': return '#eab308';
      case 'exhale': return '#10b981';
      case 'pause': return '#8b5cf6';
      default: return getQuantumPhaseColor();
    }
  };
  
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const activeScale = breathPhase ? breathAnim : pulseAnim;
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.canvasContainer,
          {
            transform: [
              { scale: activeScale },
              { rotate: rotation }
            ]
          }
        ]}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Defs>
            <RadialGradient id="quantumGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getQuantumPhaseColor()} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={Colors.dark.secondary} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={Colors.dark.background} stopOpacity="0.1" />
            </RadialGradient>
            
            <RadialGradient id="resonanceGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getScoreColor()} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={getScoreColor()} stopOpacity="0" />
            </RadialGradient>
            
            <RadialGradient id="breathGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getBreathPhaseColor()} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={getBreathPhaseColor()} stopOpacity="0.1" />
            </RadialGradient>
          </Defs>
          
          {/* Quantum resonance field */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS * resonance}
            fill="url(#resonanceGradient)"
          />
          
          {/* Breath alignment field */}
          {breathPhase && (
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={MAX_RADIUS * breathAlignment * 0.6}
              fill="url(#breathGradient)"
              opacity={0.4}
            />
          )}
          
          {/* Main quantum spiral */}
          <Path
            d={spiralPath}
            stroke={breathPhase ? getBreathPhaseColor() : getQuantumPhaseColor()}
            strokeWidth={signature ? 2 + signature.metrics.spiralResonance : 2}
            fill="none"
            opacity={isActive ? 0.8 : 0.4}
          />
          
          {/* Golden ratio overlay */}
          <Path
            d={spiralPath}
            stroke={Colors.dark.secondary}
            strokeWidth={1}
            fill="none"
            opacity={0.5}
            strokeDasharray="3,3"
          />
          
          {/* Quantum metric nodes */}
          {metricNodes.map((node, index) => (
            <G key={index}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={node.radius}
                fill={node.isQuantumRelated ? getQuantumPhaseColor() : 
                      node.isBreathRelated ? getBreathPhaseColor() : getScoreColor()}
                opacity={0.7 + node.value * 0.3}
              />
              <Circle
                cx={node.x}
                cy={node.y}
                r={node.radius + 2}
                fill="none"
                stroke={node.isQuantumRelated ? getQuantumPhaseColor() : 
                        node.isBreathRelated ? getBreathPhaseColor() : Colors.dark.text}
                strokeWidth={node.isQuantumRelated || node.isBreathRelated ? 1 : 0.5}
                opacity={node.isQuantumRelated || node.isBreathRelated ? 0.8 : 0.3}
              />
              {/* Enhanced emphasis for quantum nodes */}
              {node.isQuantumRelated && (
                <Circle
                  cx={node.x}
                  cy={node.y}
                  r={node.radius + 6}
                  fill="none"
                  stroke={getQuantumPhaseColor()}
                  strokeWidth={0.5}
                  opacity={0.6}
                  strokeDasharray="2,2"
                />
              )}
            </G>
          ))}
          
          {/* Quantum center point */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={signature ? 8 + signature.metrics.quantumCoherence * 4 : 8}
            fill="url(#quantumGradient)"
            stroke={breathPhase ? getBreathPhaseColor() : getQuantumPhaseColor()}
            strokeWidth={breathPhase ? 2 : 1}
            opacity={isActive ? 1 : 0.5}
          />
          
          {/* Quantum coherence indicator */}
          {signature && (
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={12 + signature.metrics.quantumCoherence * 8}
              fill="none"
              stroke={getQuantumPhaseColor()}
              strokeWidth={1}
              opacity={signature.metrics.quantumCoherence}
              strokeDasharray="4,4"
            />
          )}
          
          {/* Phi ratio lines with quantum modulation */}
          {isActive && signature && (
            <G opacity={0.2 + signature.metrics.goldenRatioAlignment * 0.3}>
              <Line
                x1={CENTER - MAX_RADIUS * PHI / 4}
                y1={CENTER}
                x2={CENTER + MAX_RADIUS * PHI / 4}
                y2={CENTER}
                stroke={breathPhase ? getBreathPhaseColor() : getQuantumPhaseColor()}
                strokeWidth={0.5 + signature.metrics.fibonacciHarmony}
              />
              <Line
                x1={CENTER}
                y1={CENTER - MAX_RADIUS * PHI / 4}
                x2={CENTER}
                y2={CENTER + MAX_RADIUS * PHI / 4}
                stroke={breathPhase ? getBreathPhaseColor() : getQuantumPhaseColor()}
                strokeWidth={0.5 + signature.metrics.fibonacciHarmony}
              />
            </G>
          )}
        </Svg>
      </Animated.View>
      
      {/* Enhanced resonance indicator with quantum metrics */}
      <View style={styles.resonanceContainer}>
        <View style={styles.resonanceBar}>
          <Animated.View 
            style={[
              styles.resonanceFill,
              {
                width: resonanceAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                }),
                backgroundColor: getScoreColor()
              }
            ]} 
          />
        </View>
        
        {/* Quantum coherence bar */}
        {signature && (
          <View style={[styles.resonanceBar, { marginTop: 4 }]}>
            <View 
              style={[
                styles.resonanceFill,
                {
                  width: `${signature.metrics.quantumCoherence * 100}%`,
                  backgroundColor: getQuantumPhaseColor()
                }
              ]} 
            />
          </View>
        )}
        
        {/* Breath alignment bar */}
        {breathPhase && (
          <View style={[styles.resonanceBar, { marginTop: 4 }]}>
            <View 
              style={[
                styles.resonanceFill,
                {
                  width: `${breathAlignment * 100}%`,
                  backgroundColor: getBreathPhaseColor()
                }
              ]} 
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8
  },
  canvasContainer: {
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  resonanceContainer: {
    marginTop: 12,
    width: CANVAS_SIZE * 0.8,
    alignItems: 'center',
  },
  resonanceBar: {
    height: 3,
    width: '100%',
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  resonanceFill: {
    height: '100%',
    borderRadius: 2,
  },
});