import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wind, Brain, Zap } from 'lucide-react-native';
import { LIMNUS_COLORS } from '@/constants/limnus';
import Colors from '@/constants/colors';

interface BreathingMeditationGuideProps {
  // Simple component for showing breathing meditation status
}

export default function BreathingMeditationGuide({}: BreathingMeditationGuideProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Wind size={24} color={Colors.dark.primary} />
        </View>
        <Text style={styles.title}>Breathing Meditation Active</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>
          Your consciousness signatures and breath patterns are being tracked for enhanced dream interpretation.
        </Text>
        
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Brain size={16} color={Colors.dark.success} />
            <Text style={styles.statusText}>Consciousness Tracking</Text>
          </View>
          
          <View style={styles.statusItem}>
            <Zap size={16} color={Colors.dark.accent} />
            <Text style={styles.statusText}>Breath Alignment</Text>
          </View>
        </View>
        
        <Text style={styles.instruction}>
          Continue with your natural breathing. The system will automatically record your meditation data.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
  },
  content: {
    gap: 12,
  },
  description: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: LIMNUS_COLORS.transcendent,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 13,
    color: LIMNUS_COLORS.witness,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});