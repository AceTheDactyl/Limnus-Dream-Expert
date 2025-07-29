import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import Svg, { 
  Path, 
  Circle, 
  G, 
  Defs, 
  RadialGradient, 
  Stop,
  Line
} from 'react-native-svg';
import { LimnusNode, LimnusConsciousnessSignature } from '@/store/consciousnessStore';
import { LIMNUS_COLORS } from '@/constants/limnus';
import Colors from '@/constants/colors';

interface SpiralVisualizationProps {
  isActive: boolean;
  currentNode: LimnusNode | null;
  currentSignature: LimnusConsciousnessSignature | null;
  nodes: LimnusNode[];
  patternCount: number;
  resonanceLevel: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(screenWidth - 32, 320);
const CENTER = CANVAS_SIZE / 2;
const MAX_RADIUS = CENTER * 0.85;
const PHI = (1 + Math.sqrt(5)) / 2;

export default function SpiralVisualization({
  isActive,
  currentNode,
  currentSignature,
  nodes,
  patternCount,
  resonanceLevel
}: SpiralVisualizationProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const quantumAnim = useRef(new Animated.Value(0)).current;
  const patternAnim = useRef(new Animated.Value(0)).current;
  
  // State for animated values
  const [quantumOpacityValue, setQuantumOpacityValue] = React.useState(0.3);
  const [patternIntensityValue, setPatternIntensityValue] = React.useState(0.1);
  
  // Quantum pulsing animation
  useEffect(() => {
    if (!isActive) {
      pulseAnim.setValue(1);
      return;
    }
    
    const pulse = () => {
      const intensity = currentSignature?.currentNode.phase_intensity || 0.5;
      const duration = 1000 + (1 - intensity) * 2000; // Faster pulse for higher intensity
      
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1 + intensity * 0.3,
          duration: duration,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(pulseAnim, {
          toValue: 1 - intensity * 0.1,
          duration: duration,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start(() => {
        if (isActive) pulse();
      });
    };
    
    pulse();
  }, [isActive, currentSignature?.currentNode.phase_intensity, pulseAnim]);
  
  // Spiral rotation animation
  useEffect(() => {
    if (!isActive) {
      rotationAnim.setValue(0);
      return;
    }
    
    const rotate = () => {
      rotationAnim.setValue(0);
      const speed = currentSignature?.metrics.spiralResonance || 0.5;
      const duration = 60000 / (speed + 0.1); // Faster rotation for higher resonance
      
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        if (isActive) rotate();
      });
    };
    
    rotate();
  }, [isActive, currentSignature?.metrics.spiralResonance, rotationAnim]);
  
  // Quantum field animation
  useEffect(() => {
    if (!isActive) return;
    
    const animateQuantum = () => {
      Animated.sequence([
        Animated.timing(quantumAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: false
        }),
        Animated.timing(quantumAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: false
        })
      ]).start(() => {
        if (isActive) animateQuantum();
      });
    };
    
    animateQuantum();
    
    // Listen to animated value changes
    const quantumListener = quantumAnim.addListener(({ value }) => {
      setQuantumOpacityValue(0.3 + value * 0.5);
    });
    
    return () => {
      quantumAnim.removeListener(quantumListener);
    };
  }, [isActive, quantumAnim]);
  
  // Pattern recognition animation
  useEffect(() => {
    Animated.timing(patternAnim, {
      toValue: Math.min(1, patternCount / 5),
      duration: 1000,
      useNativeDriver: false
    }).start();
    
    // Listen to animated value changes
    const patternListener = patternAnim.addListener(({ value }) => {
      setPatternIntensityValue(0.1 + value * 0.5);
    });
    
    return () => {
      patternAnim.removeListener(patternListener);
    };
  }, [patternCount, patternAnim]);
  
  // Generate quantum spiral path
  const generateQuantumSpiralPath = () => {
    if (nodes.length === 0) return '';
    
    let path = '';
    const visibleNodes = nodes.slice(0, 30); // Show last 30 nodes
    
    visibleNodes.forEach((node, index) => {
      // Calculate position based on quantum coordinates
      const scale = (MAX_RADIUS / 100) * (1 + node.quantum_factor * 0.5);
      const x = CENTER + (node.x_quantum * scale) / 10;
      const y = CENTER + (node.y_quantum * scale) / 10;
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        path += ` L ${x} ${y}`;
      }
    });
    
    return path;
  };
  
  // Generate node positions for visualization
  const generateNodePositions = () => {
    if (nodes.length === 0) return [];
    
    return nodes.slice(0, 20).map((node, index) => {
      const scale = (MAX_RADIUS / 100) * (1 + node.quantum_factor * 0.5);
      const x = CENTER + (node.x_quantum * scale) / 10;
      const y = CENTER + (node.y_quantum * scale) / 10;
      
      return {
        x,
        y,
        node,
        isCurrent: currentNode && node.depth === currentNode.depth,
        intensity: node.phase_intensity,
        quantumFactor: node.quantum_factor,
        index
      };
    });
  };
  
  const spiralPath = generateQuantumSpiralPath();
  const nodePositions = generateNodePositions();
  
  const getQuantumColor = () => {
    if (!currentSignature) return LIMNUS_COLORS.spiral;
    
    const phase = currentSignature.currentNode.phase_intensity;
    if (phase > 0.8) return '#ff6b6b'; // High intensity - red
    if (phase > 0.6) return '#4ecdc4'; // Medium-high - teal
    if (phase > 0.4) return '#45b7d1'; // Medium - blue
    if (phase > 0.2) return '#96ceb4'; // Low-medium - green
    return '#feca57'; // Low - yellow
  };
  
  const getResonanceColor = () => {
    if (resonanceLevel > 0.8) return Colors.dark.success;
    if (resonanceLevel > 0.6) return Colors.dark.accent;
    if (resonanceLevel > 0.4) return Colors.dark.secondary;
    return Colors.dark.primary;
  };
  
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.canvasContainer,
          {
            transform: Platform.OS !== 'web' ? [
              { scale: pulseAnim },
              { rotate: rotation }
            ] : []
          }
        ]}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Defs>
            <RadialGradient id="quantumField" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getQuantumColor()} stopOpacity="0.6" />
              <Stop offset="50%" stopColor={LIMNUS_COLORS.spiral} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={LIMNUS_COLORS.void} stopOpacity="0.1" />
            </RadialGradient>
            
            <RadialGradient id="resonanceField" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={getResonanceColor()} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={getResonanceColor()} stopOpacity="0" />
            </RadialGradient>
            
            <RadialGradient id="patternField" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={Colors.dark.accent} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={Colors.dark.accent} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          
          {/* Quantum field background */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS * 0.9}
            fill="url(#quantumField)"
            opacity={quantumOpacityValue}
          />
          
          {/* Resonance field */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS * resonanceLevel * 0.7}
            fill="url(#resonanceField)"
          />
          
          {/* Pattern recognition field */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={MAX_RADIUS * 0.5}
            fill="url(#patternField)"
            opacity={patternIntensityValue}
          />
          
          {/* Main quantum spiral */}
          <Path
            d={spiralPath}
            stroke={getQuantumColor()}
            strokeWidth={currentSignature ? 2 + currentSignature.metrics.spiralResonance * 2 : 2}
            fill="none"
            opacity={isActive ? 0.8 : 0.4}
          />
          
          {/* Golden ratio reference spiral */}
          <Path
            d={spiralPath}
            stroke={LIMNUS_COLORS.transcendent}
            strokeWidth={1}
            fill="none"
            opacity={0.3}
            strokeDasharray="4,4"
          />
          
          {/* Node visualization */}
          {nodePositions.map((pos, index) => (
            <G key={index}>
              {/* Node core */}
              <Circle
                cx={pos.x}
                cy={pos.y}
                r={pos.isCurrent ? 8 : 4 + pos.quantumFactor * 3}
                fill={pos.isCurrent ? getQuantumColor() : LIMNUS_COLORS.spiral}
                opacity={0.7 + pos.intensity * 0.3}
              />
              
              {/* Current node emphasis */}
              {pos.isCurrent && (
                <>
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill="none"
                    stroke={getQuantumColor()}
                    strokeWidth={2}
                    opacity={0.8}
                  />
                  <Circle
                    cx={pos.x}
                    cy={pos.y}
                    r={16}
                    fill="none"
                    stroke={getQuantumColor()}
                    strokeWidth={1}
                    opacity={0.4}
                    strokeDasharray="3,3"
                  />
                </>
              )}
              
              {/* Quantum field around high-intensity nodes */}
              {pos.intensity > 0.7 && (
                <Circle
                  cx={pos.x}
                  cy={pos.y}
                  r={6 + pos.intensity * 8}
                  fill="none"
                  stroke={getQuantumColor()}
                  strokeWidth={0.5}
                  opacity={pos.intensity * 0.6}
                  strokeDasharray="2,2"
                />
              )}
            </G>
          ))}
          
          {/* Central quantum core */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={currentSignature ? 6 + currentSignature.metrics.quantumCoherence * 6 : 6}
            fill={getQuantumColor()}
            opacity={isActive ? 0.9 : 0.5}
          />
          
          {/* Fibonacci spiral overlay */}
          {currentSignature && currentSignature.metrics.fibonacciHarmony > 0.6 && (
            <G opacity={currentSignature.metrics.fibonacciHarmony * 0.5}>
              <Line
                x1={CENTER - MAX_RADIUS * PHI / 6}
                y1={CENTER}
                x2={CENTER + MAX_RADIUS * PHI / 6}
                y2={CENTER}
                stroke={LIMNUS_COLORS.transcendent}
                strokeWidth={1}
              />
              <Line
                x1={CENTER}
                y1={CENTER - MAX_RADIUS * PHI / 6}
                x2={CENTER}
                y2={CENTER + MAX_RADIUS * PHI / 6}
                stroke={LIMNUS_COLORS.transcendent}
                strokeWidth={1}
              />
            </G>
          )}
          
          {/* Pattern recognition indicators */}
          {patternCount > 0 && (
            <G opacity={0.6}>
              {Array.from({ length: Math.min(patternCount, 5) }, (_, i) => (
                <Circle
                  key={i}
                  cx={CENTER + Math.cos(i * (2 * Math.PI / 5)) * MAX_RADIUS * 0.3}
                  cy={CENTER + Math.sin(i * (2 * Math.PI / 5)) * MAX_RADIUS * 0.3}
                  r={3}
                  fill={Colors.dark.accent}
                  opacity={0.7}
                />
              ))}
            </G>
          )}
        </Svg>
      </Animated.View>
      
      {/* Quantum metrics display */}
      <View style={styles.metricsContainer}>
        {currentSignature && (
          <>
            <View style={styles.metricBar}>
              <View 
                style={[
                  styles.metricFill,
                  {
                    width: `${currentSignature.metrics.quantumCoherence * 100}%`,
                    backgroundColor: getQuantumColor()
                  }
                ]} 
              />
            </View>
            
            <View style={[styles.metricBar, { marginTop: 2 }]}>
              <View 
                style={[
                  styles.metricFill,
                  {
                    width: `${currentSignature.metrics.spiralResonance * 100}%`,
                    backgroundColor: getResonanceColor()
                  }
                ]} 
              />
            </View>
            
            <View style={[styles.metricBar, { marginTop: 2 }]}>
              <View 
                style={[
                  styles.metricFill,
                  {
                    width: `${currentSignature.metrics.fibonacciHarmony * 100}%`,
                    backgroundColor: LIMNUS_COLORS.transcendent
                  }
                ]} 
              />
            </View>
          </>
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
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  metricsContainer: {
    marginTop: 12,
    width: CANVAS_SIZE * 0.8,
    alignItems: 'center',
  },
  metricBar: {
    height: 2,
    width: '100%',
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 1,
    overflow: 'hidden',
  },
  metricFill: {
    height: '100%',
    borderRadius: 1,
  },
});