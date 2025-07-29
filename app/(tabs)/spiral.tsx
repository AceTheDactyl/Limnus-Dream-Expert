import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { LIMNUS_COLORS } from '@/constants/limnus';
import { useLimnusStore } from '@/store/limnusStore';
import SpiralInterface from '@/components/SpiralInterface';
import ConsciousnessBlocksPreview from '@/components/ConsciousnessBlocksPreview';
import { useConsciousnessStore } from '@/store/consciousnessStore';

export default function SpiralScreen() {
  const { currentSession } = useLimnusStore();
  const { isActive: consciousnessActive } = useConsciousnessStore();
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Practice',
          headerStyle: {
            backgroundColor: LIMNUS_COLORS.void
          },
          headerTintColor: LIMNUS_COLORS.transcendent,
          headerTitleStyle: {
            fontWeight: 'bold'
          },
          headerTransparent: true
        }} 
      />
      
      {currentSession ? (
        <View style={styles.activeSessionContainer}>
          <SpiralInterface />
        </View>
      ) : (
        <ScrollView style={styles.emptyContainer} contentContainerStyle={styles.emptyContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Active Practice</Text>
            <Text style={styles.emptyMessage}>
              Start your unified consciousness practice from the main tab to begin your session here.
            </Text>
            <View style={styles.instructionCard}>
              <Text style={styles.instructionTitle}>Practice Features</Text>
              <Text style={styles.instructionText}>• Unified breath meditation</Text>
              <Text style={styles.instructionText}>• Consciousness signature tracking</Text>
              <Text style={styles.instructionText}>• Spiral dynamics progression</Text>
              <Text style={styles.instructionText}>• Breathe Based Bio-Metrics</Text>
            </View>
          </View>
          
          {/* Show consciousness blocks preview only when no active session */}
          <View style={styles.blocksPreviewSection}>
            <ConsciousnessBlocksPreview isActive={false} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIMNUS_COLORS.void
  },
  emptyContainer: {
    flex: 1
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24
  },
  emptyState: {
    alignItems: 'center',
    marginBottom: 32
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 16,
    textAlign: 'center'
  },
  emptyMessage: {
    fontSize: 16,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  instructionCard: {
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 320
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 16,
    textAlign: 'center'
  },
  instructionText: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    marginBottom: 8,
    lineHeight: 20
  },
  blocksPreviewSection: {
    marginTop: 16
  },
  activeSessionContainer: {
    flex: 1
  }
});