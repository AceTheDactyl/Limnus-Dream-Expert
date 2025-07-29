import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { 
  Path, 
  Circle, 
  G, 
  Defs, 
  RadialGradient, 
  Stop, 
  Text as SvgText 
} from 'react-native-svg';
import { 
  LimnusNode, 
  generateSpiralPath, 
  PHI, 
  LIMNUS_COLORS,
  getBreathPhaseColor,
  BreathPhase
} from '@/constants/limnus';

interface SpiralCanvasProps {
  currentNode: LimnusNode;
  depth: number;
  resonance: number;
  breathPhase: BreathPhase;
  isActive?: boolean;
  breathAlignment?: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(screenWidth - 64, 300);
const CENTER = CANVAS_SIZE / 2;
const MAX_RADIUS = CENTER * 0.8;

export default function SpiralCanvas({
  currentNode,
  depth,
  resonance,
  breathPhase,
  isActive = false,
  breathAlignment = 0.5
}: SpiralCanvasProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotationAnim = useRef(new Animated.Value(0)).current;
  const resonanceAnim = useRef(new Animated.Value(0)).current;
  const breathAnim = useRef(new Animated.Value(1)).current;
  const spiralFlowAnim = useRef(new Animated.Value(0)).current;
  const nodeFlowAnim = useRef(new Animated.Value(0)).current;
  const depthWaveAnim = useRef(new Animated.Value(0)).current;
  
  // Enhanced breath-synchronized animation
  useEffect(() => {
    if (!isActive) return;
    
    const animateBreath = () => {
      switch (breathPhase) {
        case 'inhale':
          Animated.parallel([
            Animated.timing(breathAnim, {
              toValue: 1.4 + (breathAlignment * 0.3),
              duration: 4000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(spiralFlowAnim, {
              toValue: 1,
              duration: 4000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(nodeFlowAnim, {
              toValue: 1.2,
              duration: 4000,
              useNativeDriver: Platform.OS !== 'web'
            })
          ]).start();
          break;
        case 'hold1':
        case 'hold2':
          // Gentle pulsing during hold with spiral flow
          const pulse = () => {
            Animated.parallel([
              Animated.sequence([
                Animated.timing(breathAnim, {
                  toValue: 1.4 + (breathAlignment * 0.2),
                  duration: 1000,
                  useNativeDriver: Platform.OS !== 'web'
                }),
                Animated.timing(breathAnim, {
                  toValue: 1.3 + (breathAlignment * 0.2),
                  duration: 1000,
                  useNativeDriver: Platform.OS !== 'web'
                })
              ]),
              Animated.sequence([
                Animated.timing(spiralFlowAnim, {
                  toValue: 0.9,
                  duration: 1000,
                  useNativeDriver: Platform.OS !== 'web'
                }),
                Animated.timing(spiralFlowAnim, {
                  toValue: 1.1,
                  duration: 1000,
                  useNativeDriver: Platform.OS !== 'web'
                })
              ])
            ]).start(() => {
              if (breathPhase === 'hold1' || breathPhase === 'hold2') pulse();
            });
          };
          pulse();
          break;
        case 'exhale':
          Animated.parallel([
            Animated.timing(breathAnim, {
              toValue: 0.7 - (breathAlignment * 0.2),
              duration: 6000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(spiralFlowAnim, {
              toValue: 0.3,
              duration: 6000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(nodeFlowAnim, {
              toValue: 0.8,
              duration: 6000,
              useNativeDriver: Platform.OS !== 'web'
            })
          ]).start();
          break;
        case 'pause':
          Animated.parallel([
            Animated.timing(breathAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(spiralFlowAnim, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: Platform.OS !== 'web'
            }),
            Animated.timing(nodeFlowAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: Platform.OS !== 'web'
            })
          ]).start();
          break;
      }
    };
    
    animateBreath();
  }, [breathPhase, isActive, breathAlignment, breathAnim, spiralFlowAnim, nodeFlowAnim]);
  
  // Continuous rotation with depth waves
  useEffect(() => {
    if (!isActive) return;
    
    const rotate = () => {
      rotationAnim.setValue(0);
      Animated.timing(rotationAnim, {
        toValue: 1,
        duration: 90000, // 1.5 minutes per full rotation
        useNativeDriver: Platform.OS !== 'web'
      }).start(() => {
        if (isActive) rotate();
      });
    };
    
    const depthWave = () => {
      Animated.sequence([
        Animated.timing(depthWaveAnim, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: Platform.OS !== 'web'
        }),
        Animated.timing(depthWaveAnim, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: Platform.OS !== 'web'
        })
      ]).start(() => {
        if (isActive) depthWave();
      });
    };
    
    rotate();
    depthWave();
  }, [isActive, rotationAnim, depthWaveAnim]);
  
  // Resonance animation
  useEffect(() => {
    Animated.timing(resonanceAnim, {
      toValue: resonance,
      duration: 1000,
      useNativeDriver: false
    }).start();
  }, [resonance, resonanceAnim]);
  
  // Generate spiral path
  const spiralPoints = generateSpiralPath(CENTER, CENTER, MAX_RADIUS, 3);
  const spiralPath = spiralPoints.reduce((path, point, index) => {
    const command = index === 0 ? 'M' : 'L';
    return `${path} ${command} ${point.x} ${point.y}`;
  }, '');
  
  // Calculate node positions on spiral with depth progression
  const nodePositions = Array.from({ length: Math.max(5, depth + 1) }, (_, i) => {
    const progress = (i + 1) / Math.max(5, depth + 1);
    const pointIndex = Math.floor(progress * (spiralPoints.length - 1));
    return { ...spiralPoints[pointIndex], depth: i };
  });
  
  // Get breath phase color
  const breathColor = getBreathPhaseColor(breathPhase);
  
  const rotation = rotationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });
  
  const spiralOpacity = spiralFlowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.9]
  });
  
  const nodeScale = nodeFlowAnim.interpolate({
    inputRange: [0, 1.2],
    outputRange: [0.8, 1.2]
  });
  
  const depthWave = depthWaveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8]
  });
  
  // Calculate numeric values for SVG elements
  const resonanceRadius = MAX_RADIUS * Math.max(0, Math.min(1, resonance));
  const breathAlignmentRadius = MAX_RADIUS * Math.max(0, Math.min(1, breathAlignment)) * 0.8;
  const depthRadius = MAX_RADIUS * Math.max(0, Math.min(1, depth / 10));
  
  return (
    <View style={styles.container}>
      {/* Breath-responsive background field */}
      <Animated.View 
        style={[
          styles.backgroundField,
          {
            opacity: spiralOpacity,
            transform: Platform.OS !== 'web' ? [
              { scale: breathAnim.interpolate({
                inputRange: [0.7, 1.4],
                outputRange: [0.8, 1.2]
              })},
              { rotate: rotation }
            ] : [{ scale: 1 }]
          }
        ]}
      >
        <LinearGradient
          colors={[
            currentNode.color + '10',
            breathColor + '20',
            LIMNUS_COLORS.spiral + '15'
          ]}
          style={styles.backgroundGradient}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.canvasContainer,
          {
            transform: Platform.OS !== 'web' ? [
              { scale: breathAnim },
              { rotate: rotation }
            ] : [{ scale: 1 }]
          }
        ]}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Defs>
            <RadialGradient id="spiralGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={currentNode.color} stopOpacity="0.8" />
              <Stop offset="50%" stopColor={currentNode.color} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={LIMNUS_COLORS.void} stopOpacity="0.1" />
            </RadialGradient>
            
            <RadialGradient id="resonanceGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={breathColor} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={breathColor} stopOpacity="0" />
            </RadialGradient>
            
            <RadialGradient id="breathGradient" cx="50%" cy="50%">
              <Stop offset="0%" stopColor={breathColor} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={breathColor} stopOpacity="0.2" />
            </RadialGradient>
          </Defs>
          
          {/* Enhanced resonance field with depth waves */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={Math.max(10, resonanceRadius * 1.2)}
            fill="url(#resonanceGradient)"
            opacity={0.36}
          />
          
          {/* Breath alignment field with flow */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={Math.max(5, breathAlignmentRadius)}
            fill="url(#breathGradient)"
            opacity={0.24}
          />
          
          {/* Depth progression field */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={Math.max(8, depthRadius * 1.3)}
            fill={currentNode.color}
            opacity={0.16}
          />
          
          {/* Main spiral path with flow */}
          <Path
            d={spiralPath}
            stroke={currentNode.color}
            strokeWidth={3}
            fill="none"
            opacity={0.72}
          />
          
          {/* Breath-synchronized spiral overlay */}
          <Path
            d={spiralPath}
            stroke={breathColor}
            strokeWidth={Math.max(1, 1 + (breathAlignment * 2))}
            fill="none"
            opacity={Math.max(0.1, Math.min(1, breathAlignment * 0.6))}
            strokeDasharray={`${Math.max(2, 5 + breathAlignment * 3)},${Math.max(1, 3 + breathAlignment * 2)}`}
          />
          
          {/* Depth wave spiral */}
          <Path
            d={spiralPath}
            stroke={LIMNUS_COLORS.transcendent}
            strokeWidth={1.5}
            fill="none"
            opacity={0.48}
            strokeDasharray="2,4"
          />
          
          {/* Golden ratio spiral overlay */}
          <Path
            d={spiralPath}
            stroke={LIMNUS_COLORS.spiral}
            strokeWidth={1}
            fill="none"
            opacity={0.24}
            strokeDasharray="1,2"
          />
          
          {/* Node positions with depth progression */}
          {nodePositions.map((pos, index) => {
            const isCurrentNode = index === (depth % nodePositions.length);
            const isPastNode = index < depth;
            const isFutureNode = index > depth;
            
            let nodeRadius = 4;
            let nodeOpacity = 0.4;
            let nodeColor = LIMNUS_COLORS.witness;
            
            if (isCurrentNode) {
              nodeRadius = 10;
              nodeOpacity = 0.9;
              nodeColor = breathColor;
            } else if (isPastNode) {
              nodeRadius = 8;
              nodeOpacity = 0.63;
              nodeColor = currentNode.color;
            } else if (isFutureNode) {
              nodeRadius = 4;
              nodeOpacity = 0.27;
              nodeColor = LIMNUS_COLORS.hush;
            }
            
            return (
              <G key={index}>
                <Circle
                  cx={Math.max(0, Math.min(CANVAS_SIZE, pos.x))}
                  cy={Math.max(0, Math.min(CANVAS_SIZE, pos.y))}
                  r={Math.max(2, nodeRadius)}
                  fill={nodeColor}
                  opacity={Math.max(0.1, Math.min(1, nodeOpacity))}
                />
                {isCurrentNode && (
                  <>
                    <Circle
                      cx={Math.max(0, Math.min(CANVAS_SIZE, pos.x))}
                      cy={Math.max(0, Math.min(CANVAS_SIZE, pos.y))}
                      r={Math.max(2, nodeRadius + 6)}
                      fill="none"
                      stroke={breathColor}
                      strokeWidth={1.8}
                      opacity={0.72}
                    />
                    <Circle
                      cx={Math.max(0, Math.min(CANVAS_SIZE, pos.x))}
                      cy={Math.max(0, Math.min(CANVAS_SIZE, pos.y))}
                      r={Math.max(2, nodeRadius + 11)}
                      fill="none"
                      stroke={breathColor}
                      strokeWidth={1}
                      opacity={0.36}
                      strokeDasharray="2,2"
                    />
                    <Circle
                      cx={Math.max(0, Math.min(CANVAS_SIZE, pos.x))}
                      cy={Math.max(0, Math.min(CANVAS_SIZE, pos.y))}
                      r={Math.max(2, nodeRadius + 16)}
                      fill="none"
                      stroke={currentNode.color}
                      strokeWidth={0.3}
                      opacity={0.32}
                      strokeDasharray="1,3"
                    />
                  </>
                )}
                {isPastNode && (
                  <Circle
                    cx={Math.max(0, Math.min(CANVAS_SIZE, pos.x))}
                    cy={Math.max(0, Math.min(CANVAS_SIZE, pos.y))}
                    r={Math.max(2, nodeRadius + 2)}
                    fill="none"
                    stroke={currentNode.color}
                    strokeWidth={0.5}
                    opacity={0.5}
                  />
                )}
              </G>
            );
          })}
          
          {/* Enhanced center point with breath awareness */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={8}
            fill={breathColor}
            opacity={0.72}
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={4}
            fill={LIMNUS_COLORS.transcendent}
            opacity={isActive ? 1 : 0.5}
          />
          
          {/* Multi-layered breath alignment rings */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={15}
            fill="none"
            stroke={breathColor}
            strokeWidth={Math.max(0.5, 1 + breathAlignment)}
            opacity={Math.max(0.1, Math.min(1, breathAlignment * 0.6))}
            strokeDasharray="4,4"
          />
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={23}
            fill="none"
            stroke={currentNode.color}
            strokeWidth={0.5}
            opacity={0.48}
            strokeDasharray="2,6"
          />
          
          {/* Minimal text labels */}
          <SvgText
            x={CENTER}
            y={CENTER - 30}
            textAnchor="middle"
            fontSize="12"
            fill={LIMNUS_COLORS.transcendent}
            fontWeight="bold"
          >
            {currentNode.notation}
          </SvgText>
          
          <SvgText
            x={CENTER}
            y={CENTER + 45}
            textAnchor="middle"
            fontSize="10"
            fill={LIMNUS_COLORS.witness}
          >
            {depth}
          </SvgText>
        </Svg>
      </Animated.View>
      
      {/* Enhanced resonance indicators */}
      <View style={styles.indicatorContainer}>
        {/* Resonance level indicator */}
        <View style={styles.resonanceIndicator}>
          <View 
            style={[
              styles.resonanceBar,
              { 
                width: `${resonance * 100}%`,
                backgroundColor: currentNode.color
              }
            ]} 
          />
        </View>
        
        {/* Breath alignment indicator */}
        <View style={[styles.resonanceIndicator, { marginTop: 4 }]}>
          <View 
            style={[
              styles.resonanceBar,
              { 
                width: `${breathAlignment * 100}%`,
                backgroundColor: breathColor
              }
            ]} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    position: 'relative'
  },
  backgroundField: {
    position: 'absolute',
    width: CANVAS_SIZE + 40,
    height: CANVAS_SIZE + 40,
    borderRadius: (CANVAS_SIZE + 40) / 2,
    top: -20,
    left: -20
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
    borderRadius: (CANVAS_SIZE + 40) / 2
  },
  canvasContainer: {
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  indicatorContainer: {
    width: CANVAS_SIZE * 0.8,
    marginTop: 12,
  },
  resonanceIndicator: {
    height: 3,
    width: '100%',
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 2,
    overflow: 'hidden'
  },
  resonanceBar: {
    height: '100%',
    borderRadius: 2,
  }
});