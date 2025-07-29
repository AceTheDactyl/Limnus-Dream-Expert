import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { ConsciousnessEncoder } from '@/models/neural-sigil/consciousnessEncoder';
import Colors from '@/constants/colors';

interface Props {
  sessionId: string;
  onMilestone?: (milestone: Milestone) => void;
}

interface Milestone {
  type: 'high_coherence' | 'pattern_match' | 'breakthrough';
  sigilId: string;
  timestamp: number;
  data: any;
}

export const ConsciousnessMonitor: React.FC<Props> = ({ sessionId, onMilestone }) => {
  const [depthHistory, setDepthHistory] = useState<number[]>([]);
  const [currentCoherence, setCurrentCoherence] = useState(0);
  const glowAnim = useState(new Animated.Value(0))[0];
  
  const { generateNeuralSigil } = useNeuralSigilStore();
  const { currentSignature, biometricData, emotionalState } = useConsciousnessStore();
  
  const encoder = new ConsciousnessEncoder();
  
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!currentSignature) return;
      
      const snapshot = {
        timestamp: Date.now(),
        biometrics: biometricData,
        emotional: emotionalState,
        coherence: currentSignature.validation.overall ? 1 : 0.5,
        depth: currentSignature.currentNode?.depth || 0
      };
      
      setCurrentCoherence(snapshot.coherence);
      setDepthHistory(prev => [...prev.slice(-50), snapshot.depth]);
      
      // Check for high coherence milestone
      if (snapshot.coherence > 0.85) {
        const description = `High coherence state - Score: ${currentSignature.score} - Depth: ${snapshot.depth}`;
        const sigil = await generateNeuralSigil(description, 'meditation');
        
        // Trigger glow animation
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true
          })
        ]).start();
        
        onMilestone?.({
          type: 'high_coherence',
          sigilId: sigil.id,
          timestamp: Date.now(),
          data: { coherence: snapshot.coherence, depth: snapshot.depth }
        });
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [currentSignature, biometricData, emotionalState]);
  
  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.glowEffect,
          {
            opacity: glowAnim,
            transform: [{ scale: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.2]
            })}]
          }
        ]}
      />
      
      <View style={styles.metricsContainer}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Coherence</Text>
          <Text style={styles.metricValue}>
            {(currentCoherence * 100).toFixed(0)}%
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Depth</Text>
          <Text style={styles.metricValue}>
            {depthHistory[depthHistory.length - 1] || 0}
          </Text>
        </View>
      </View>
      
      <View style={styles.depthChart}>
        {depthHistory.map((depth, i) => (
          <View
            key={i}
            style={[
              styles.depthBar,
              { height: `${(depth / 10) * 100}%` }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  metric: {
    alignItems: 'center',
  },
  metricLabel: {
    color: Colors.dark.subtext,
    fontSize: 12,
  },
  metricValue: {
    color: Colors.dark.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  depthChart: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 4,
  },
  depthBar: {
    flex: 1,
    backgroundColor: Colors.dark.primary,
    marginHorizontal: 1,
    borderRadius: 2,
  },
});