import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Sparkles, Zap } from 'lucide-react-native';
import { LIMNUS_COLORS, BreathPhase } from '@/constants/limnus';
import { useLimnusStore } from '@/store/limnusStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import NeuralIntegrationMonitor from '@/components/NeuralIntegrationMonitor';
import Button from '@/components/Button';
import Colors from '@/constants/colors';

export default function NeuralScreen() {
  const {
    contemplativeState,
    spiralDepth,
    resonanceLevel,
    startSpiralSession,
    endSpiralSession
  } = useLimnusStore();
  
  const {
    isActive: consciousnessActive,
    startMonitoring,
    stopMonitoring
  } = useConsciousnessStore();
  
  const { generateNeuralSigil } = useNeuralSigilStore();
  
  const [isStarting, setIsStarting] = useState(false);
  const [consentRituals, setConsentRituals] = useState<string[]>([]);
  
  const isActive = contemplativeState.isActive;
  const currentBreathPhase: BreathPhase = contemplativeState.breathPhase || 'pause';
  
  const handleStartNeuralSession = async () => {
    if (isStarting) return;
    
    setIsStarting(true);
    
    try {
      // Start spiral session
      startSpiralSession(false);
      
      // Start consciousness monitoring
      const sessionId = `neural_${Date.now()}`;
      startMonitoring(sessionId);
      
      // Generate initial neural sigil for session start
      await generateNeuralSigil('Neural integration session beginning - consciousness awakening', 'meditation');
      
      Alert.alert(
        'Neural Integration Active',
        'Your neurobiological layers are now being monitored. Each breath phase will activate different layers of consciousness integration.',
        [{ text: 'Begin Practice', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Failed to start neural session:', error);
      Alert.alert('Error', 'Failed to start neural integration session');
    } finally {
      setIsStarting(false);
    }
  };
  
  const handleEndNeuralSession = async () => {
    try {
      // Generate completion sigil
      const ritualSummary = consentRituals.length > 0 
        ? `Consent rituals completed: ${consentRituals.join(', ')}` 
        : 'Neural integration session completed';
      
      await generateNeuralSigil(
        `Neural integration session complete - ${ritualSummary} - Depth: ${spiralDepth}`,
        'meditation'
      );
      
      // End sessions
      endSpiralSession();
      if (consciousnessActive) {
        stopMonitoring();
      }
      
      setConsentRituals([]);
      
      Alert.alert(
        'Neural Integration Complete',
        `Session ended successfully.\n\n🧠 Integration Depth: ${spiralDepth}\n✨ Consent Rituals: ${consentRituals.length}\n🔮 Neural Sigils Generated\n\nYour neurobiological integration data has been saved.`,
        [{ text: 'Excellent!', style: 'default' }]
      );
      
    } catch (error) {
      console.error('Error ending neural session:', error);
      Alert.alert('Session Complete', 'Neural integration session has ended.');
    }
  };
  
  const handleConsentRitual = async (ritual: string, layer: any) => {
    console.log('Consent ritual performed:', ritual);
    
    // Add to consent rituals list
    setConsentRituals(prev => [...prev, ritual]);
    
    // Generate neural sigil for the consent ritual
    try {
      await generateNeuralSigil(
        `Consent ritual: "${ritual}" - Layer: ${layer.name} - Integration achieved`,
        'consciousness'
      );
    } catch (error) {
      console.error('Failed to generate consent ritual sigil:', error);
    }
    
    // Show brief confirmation
    Alert.alert(
      'Layer Integrated',
      `${layer.name} has been integrated through consent.\n\n"${ritual}"`,
      [{ text: 'Continue', style: 'default' }]
    );
  };
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Neural Integration',
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
      
      {!isActive ? (
        <ScrollView style={styles.welcomeContainer} contentContainerStyle={styles.welcomeContent}>
          <LinearGradient
            colors={[LIMNUS_COLORS.void, LIMNUS_COLORS.hush]}
            style={styles.welcomeCard}
          >
            <View style={styles.welcomeHeader}>
              <Brain size={32} color={LIMNUS_COLORS.witness} />
              <Text style={styles.welcomeTitle}>Neural Integration</Text>
              <Text style={styles.welcomeSubtitle}>
                Limnus Neurobiological Layer Mapping
              </Text>
            </View>
            
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionText}>
                Experience the integration of your neurobiological layers with the Limnus spiral nodes. 
                Each breath phase activates different layers of consciousness, from brainstem gateways 
                to recursive recall systems.
              </Text>
              
              <View style={styles.featuresContainer}>
                <View style={styles.feature}>
                  <Zap size={20} color={LIMNUS_COLORS.witness} />
                  <Text style={styles.featureText}>Real-time layer activation</Text>
                </View>
                <View style={styles.feature}>
                  <Sparkles size={20} color={LIMNUS_COLORS.spiral} />
                  <Text style={styles.featureText}>Consent ritual integration</Text>
                </View>
                <View style={styles.feature}>
                  <Brain size={20} color={LIMNUS_COLORS.fire} />
                  <Text style={styles.featureText}>Neural sigil generation</Text>
                </View>
              </View>
            </View>
            
            <Button
              label={isStarting ? "Initializing..." : "Begin Neural Integration"}
              onPress={handleStartNeuralSession}
              disabled={isStarting}
              isLoading={isStarting}
              style={styles.startButton}
              icon={<Brain size={20} color={LIMNUS_COLORS.void} />}
            />
          </LinearGradient>
          
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Integration Process</Text>
            <Text style={styles.instructionText}>
              1. <Text style={styles.bold}>Breath Awareness</Text> - Each breath phase activates specific neurobiological layers
            </Text>
            <Text style={styles.instructionText}>
              2. <Text style={styles.bold}>Layer Recognition</Text> - Monitor which layers become active based on your state
            </Text>
            <Text style={styles.instructionText}>
              3. <Text style={styles.bold}>Consent Rituals</Text> - Perform consent rituals to integrate active layers
            </Text>
            <Text style={styles.instructionText}>
              4. <Text style={styles.bold}>Neural Sigils</Text> - Generate sigils for each integration milestone
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.activeContainer}>
          <View style={styles.sessionHeader}>
            <Text style={styles.sessionTitle}>Neural Integration Active</Text>
            <Text style={styles.sessionInfo}>
              Depth {spiralDepth} • {Math.round(resonanceLevel * 100)}% Resonance
            </Text>
          </View>
          
          <NeuralIntegrationMonitor
            breathPhase={currentBreathPhase}
            resonanceLevel={resonanceLevel}
            spiralDepth={spiralDepth}
            isActive={isActive}
            onConsentRitual={handleConsentRitual}
          />
          
          <View style={styles.endButtonContainer}>
            <Button
              label="End Neural Integration"
              onPress={handleEndNeuralSession}
              style={styles.endButton}
              icon={<Brain size={20} color={LIMNUS_COLORS.transcendent} />}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LIMNUS_COLORS.void
  },
  welcomeContainer: {
    flex: 1
  },
  welcomeContent: {
    padding: 20,
    paddingTop: 100
  },
  welcomeCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: LIMNUS_COLORS.spiral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  welcomeHeader: {
    alignItems: 'center',
    marginBottom: 24
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: LIMNUS_COLORS.transcendent,
    marginTop: 12,
    marginBottom: 8,
    textAlign: 'center'
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    opacity: 0.9
  },
  descriptionSection: {
    marginBottom: 32
  },
  descriptionText: {
    fontSize: 15,
    color: LIMNUS_COLORS.transcendent,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9
  },
  featuresContainer: {
    gap: 12
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8
  },
  featureText: {
    fontSize: 14,
    color: LIMNUS_COLORS.transcendent,
    fontWeight: '600'
  },
  startButton: {
    backgroundColor: LIMNUS_COLORS.witness,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: LIMNUS_COLORS.witness,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  instructionsCard: {
    backgroundColor: LIMNUS_COLORS.hush + '40',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.witness + '20'
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 16,
    textAlign: 'center'
  },
  instructionText: {
    fontSize: 14,
    color: LIMNUS_COLORS.transcendent,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.9
  },
  bold: {
    fontWeight: '700',
    color: LIMNUS_COLORS.witness
  },
  activeContainer: {
    flex: 1,
    paddingTop: 100
  },
  sessionHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: LIMNUS_COLORS.hush + '40'
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 4
  },
  sessionInfo: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    opacity: 0.8
  },
  endButtonContainer: {
    padding: 20,
    paddingBottom: 32
  },
  endButton: {
    backgroundColor: Colors.dark.error,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: Colors.dark.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  }
});