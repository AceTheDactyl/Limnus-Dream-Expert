import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Brain,
  Zap,
  Heart,
  Eye,
  Sparkles,
  Waves,
  Circle,
  CheckCircle2
} from 'lucide-react-native';
import { 
  LIMNUS_COLORS, 
  BreathPhase, 
  NEUROBIOLOGICAL_LAYERS,
  calculateNeuralIntegration,

  NeurobiologicalLayer
} from '@/constants/limnus';

interface NeuralIntegrationMonitorProps {
  breathPhase: BreathPhase;
  resonanceLevel: number;
  spiralDepth: number;
  isActive: boolean;
  onConsentRitual?: (ritual: string, layer: NeurobiologicalLayer) => void;
}

export default function NeuralIntegrationMonitor({
  breathPhase,
  resonanceLevel,
  spiralDepth,
  isActive,
  onConsentRitual
}: NeuralIntegrationMonitorProps) {
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [consentedLayers, setConsentedLayers] = useState<Set<string>>(new Set());
  const [pulseAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));
  
  const integration = calculateNeuralIntegration(breathPhase, resonanceLevel, spiralDepth);

  
  // Animate pulse for active layers
  useEffect(() => {
    if (!isActive) return;
    
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: false
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false
        })
      ]).start(() => {
        if (isActive) pulse();
      });
    };
    
    pulse();
  }, [isActive, pulseAnim]);
  
  // Animate glow for high integration
  useEffect(() => {
    if (integration.integrationScore > 0.7) {
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: false
      }).start();
    }
  }, [integration.integrationScore, glowAnim]);
  
  const handleConsentRitual = (layer: NeurobiologicalLayer) => {
    setConsentedLayers(prev => new Set([...prev, layer.id]));
    onConsentRitual?.(layer.consentRitual, layer);
  };
  
  const getLayerIcon = (layerId: string) => {
    switch (layerId) {
      case 'brainstem_gateways': return <Circle size={16} color={LIMNUS_COLORS.hush} />;
      case 'neurochemical_engine': return <Zap size={16} color={LIMNUS_COLORS.witness} />;
      case 'limbic_resonance': return <Heart size={16} color={LIMNUS_COLORS.recursion} />;
      case 'cortical_sculptor': return <Brain size={16} color={LIMNUS_COLORS.fire} />;
      case 'belief_integration': return <Eye size={16} color={LIMNUS_COLORS.spiral} />;
      case 'dream_recursion': return <Sparkles size={16} color={LIMNUS_COLORS.transcendent} />;
      case 'collapse_overdrive': return <Waves size={16} color={LIMNUS_COLORS.void} />;
      case 'recursive_recall': return <CheckCircle2 size={16} color={LIMNUS_COLORS.transcendent} />;
      default: return <Circle size={16} color={LIMNUS_COLORS.witness} />;
    }
  };
  
  const getLayerColor = (layer: NeurobiologicalLayer) => {
    const isActive = integration.activeLayers.includes(layer);
    const isConsented = consentedLayers.has(layer.id);
    
    if (isConsented) return LIMNUS_COLORS.transcendent;
    if (isActive) return LIMNUS_COLORS.witness;
    return LIMNUS_COLORS.hush;
  };
  
  const getIntegrationColor = () => {
    if (integration.integrationScore >= 0.9) return LIMNUS_COLORS.transcendent;
    if (integration.integrationScore >= 0.7) return LIMNUS_COLORS.spiral;
    if (integration.integrationScore >= 0.5) return LIMNUS_COLORS.witness;
    if (integration.integrationScore >= 0.3) return LIMNUS_COLORS.recursion;
    return LIMNUS_COLORS.hush;
  };
  
  return (
    <View style={styles.container}>
      {/* Integration Status Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: glowAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1]
          })
        }
      ]}>
        <LinearGradient
          colors={[LIMNUS_COLORS.void, LIMNUS_COLORS.hush]}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <Brain size={20} color={getIntegrationColor()} />
            <Text style={[styles.headerTitle, { color: getIntegrationColor() }]}>
              Neural Integration
            </Text>
            <Text style={styles.integrationScore}>
              {Math.round(integration.integrationScore * 100)}%
            </Text>
          </View>
          
          <View style={styles.phaseIndicator}>
            <Text style={styles.phaseText}>
              {breathPhase.toUpperCase()} • Depth {spiralDepth}
            </Text>
            <Text style={styles.activeLayersText}>
              {integration.activeLayers.length} layers active
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* Neurobiological Layers */}
      <ScrollView style={styles.layersContainer} showsVerticalScrollIndicator={false}>
        {NEUROBIOLOGICAL_LAYERS.map((layer) => {
          const isActive = integration.activeLayers.includes(layer);
          const isConsented = consentedLayers.has(layer.id);
          const isExpanded = expandedLayer === layer.id;
          const layerColor = getLayerColor(layer);
          
          return (
            <Animated.View
              key={layer.id}
              style={[
                styles.layerCard,
                {
                  borderColor: layerColor + '40',
                  backgroundColor: isActive ? layerColor + '10' : LIMNUS_COLORS.void + '80',
                  transform: isActive ? [{ scale: pulseAnim }] : []
                }
              ]}
            >
              <View
                style={styles.layerHeader}
                onTouchEnd={() => setExpandedLayer(isExpanded ? null : layer.id)}
              >
                <View style={styles.layerInfo}>
                  {getLayerIcon(layer.id)}
                  <View style={styles.layerTitleContainer}>
                    <Text style={[styles.layerTitle, { color: layerColor }]}>
                      {layer.name}
                    </Text>
                    <Text style={styles.layerNode}>
                      {layer.limnusNode}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.layerStatus}>
                  {isConsented && (
                    <CheckCircle2 size={16} color={LIMNUS_COLORS.transcendent} />
                  )}
                  {isActive && (
                    <View style={[styles.activeIndicator, { backgroundColor: layerColor }]} />
                  )}
                </View>
              </View>
              
              {isExpanded && (
                <View style={styles.layerDetails}>
                  <Text style={styles.layerFunction}>
                    {layer.function}
                  </Text>
                  
                  <Text style={styles.layerRole}>
                    {layer.neurosymbolicRole}
                  </Text>
                  
                  <View style={styles.layerMetadata}>
                    <Text style={styles.metadataLabel}>Brain Regions:</Text>
                    <Text style={styles.metadataValue}>
                      {layer.brainRegions.join(', ')}
                    </Text>
                  </View>
                  
                  <View style={styles.layerMetadata}>
                    <Text style={styles.metadataLabel}>Neurochemicals:</Text>
                    <Text style={styles.metadataValue}>
                      {layer.neurochemicals.join(', ')}
                    </Text>
                  </View>
                  
                  {/* Consent Ritual */}
                  {isActive && !isConsented && (
                    <View style={styles.consentSection}>
                      <Text style={styles.consentLabel}>Consent Ritual:</Text>
                      <Text style={styles.consentRitual}>
                        &ldquo;{layer.consentRitual}&rdquo;
                      </Text>
                      <View
                        style={[styles.consentButton, { backgroundColor: layerColor }]}
                        onTouchEnd={() => handleConsentRitual(layer)}
                      >
                        <Sparkles size={14} color={LIMNUS_COLORS.void} />
                        <Text style={styles.consentButtonText}>Consent & Integrate</Text>
                      </View>
                    </View>
                  )}
                  
                  {isConsented && (
                    <View style={styles.integratedSection}>
                      <CheckCircle2 size={16} color={LIMNUS_COLORS.transcendent} />
                      <Text style={styles.integratedText}>Layer Integrated</Text>
                    </View>
                  )}
                </View>
              )}
            </Animated.View>
          );
        })}
      </ScrollView>
      
      {/* Active Consent Rituals */}
      {integration.consentRituals.length > 0 && (
        <View style={styles.ritualsContainer}>
          <Text style={styles.ritualsTitle}>Active Consent Rituals</Text>
          {integration.consentRituals.map((ritual, index) => (
            <Text key={index} style={styles.ritualText}>
              &ldquo;{ritual}&rdquo;
            </Text>
          ))}
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
  header: {
    marginBottom: 16
  },
  headerGradient: {
    borderRadius: 16,
    padding: 16
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    marginLeft: 8
  },
  integrationScore: {
    fontSize: 20,
    fontWeight: '800',
    color: LIMNUS_COLORS.transcendent
  },
  phaseIndicator: {
    alignItems: 'center'
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '600',
    color: LIMNUS_COLORS.witness,
    marginBottom: 2
  },
  activeLayersText: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    opacity: 0.8
  },
  layersContainer: {
    flex: 1
  },
  layerCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden'
  },
  layerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12
  },
  layerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  layerTitleContainer: {
    marginLeft: 8,
    flex: 1
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2
  },
  layerNode: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    opacity: 0.8
  },
  layerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  layerDetails: {
    padding: 12,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: LIMNUS_COLORS.hush + '40'
  },
  layerFunction: {
    fontSize: 13,
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 8,
    lineHeight: 18
  },
  layerRole: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 16
  },
  layerMetadata: {
    marginBottom: 8
  },
  metadataLabel: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    fontWeight: '600',
    marginBottom: 2
  },
  metadataValue: {
    fontSize: 11,
    color: LIMNUS_COLORS.transcendent,
    opacity: 0.8
  },
  consentSection: {
    marginTop: 12,
    padding: 12,
    backgroundColor: LIMNUS_COLORS.hush + '20',
    borderRadius: 8
  },
  consentLabel: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    fontWeight: '600',
    marginBottom: 4
  },
  consentRitual: {
    fontSize: 13,
    color: LIMNUS_COLORS.transcendent,
    fontStyle: 'italic',
    marginBottom: 12,
    lineHeight: 18
  },
  consentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 6
  },
  consentButtonText: {
    color: LIMNUS_COLORS.void,
    fontSize: 12,
    fontWeight: '700'
  },
  integratedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    gap: 6
  },
  integratedText: {
    color: LIMNUS_COLORS.transcendent,
    fontSize: 12,
    fontWeight: '600'
  },
  ritualsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: LIMNUS_COLORS.hush + '20',
    borderRadius: 16
  },
  ritualsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 8,
    textAlign: 'center'
  },
  ritualText: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 16
  }
});