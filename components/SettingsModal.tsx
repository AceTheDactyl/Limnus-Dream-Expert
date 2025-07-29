import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, AlertCircle } from 'lucide-react-native';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const insets = useSafeAreaInsets();
  const {
    metricWeights,
    consentAffirmation,
    symbolicGlyphs,
    updateMetricWeights,
    setConsentAffirmation,
    setSymbolicGlyphs
  } = useConsciousnessStore();

  const [localWeights, setLocalWeights] = useState(metricWeights);
  const [localAffirmation, setLocalAffirmation] = useState(consentAffirmation);
  const [localGlyphs, setLocalGlyphs] = useState(symbolicGlyphs);

  const GLYPH_OPTIONS = ['∅', '↻', '∞', '🜝', '⟁', '♒', '◉', '◎', '⟡', '⧨'];

  const handleSave = () => {
    updateMetricWeights(localWeights);
    setConsentAffirmation(localAffirmation);
    setSymbolicGlyphs(localGlyphs);
    onClose();
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'This will restore all settings to their default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultWeights = {
              neuralComplexity: 0.25,
              brainwaveCoherence: 0.15,
              autonomicBalance: 0.15,
              respiratoryRhythm: 0.10,
              responseLatency: 0.05,
              interactionPattern: 0.10,
              emotionalDepth: 0.10,
              polarityAlignment: 0.05,
              temporalCoherence: 0.03,
              rhythmicStability: 0.02
            };
            setLocalWeights(defaultWeights);
            setLocalAffirmation("I affirm my sovereign consent to anchor this moment of consciousness");
            setLocalGlyphs(['∅', '∞', '↻']);
          }
        }
      ]
    );
  };

  const updateWeight = (key: string, value: number) => {
    setLocalWeights(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateGlyph = (index: number, glyph: string) => {
    const newGlyphs = [...localGlyphs];
    newGlyphs[index] = glyph;
    setLocalGlyphs(newGlyphs);
  };

  const totalWeight = Object.values(localWeights).reduce((sum, val) => sum + val, 0);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.01;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Consciousness Settings</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Metric Weights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metric Weight Configuration</Text>
            <Text style={styles.sectionDescription}>
              Adjust the relative importance of each consciousness dimension
            </Text>

            <View style={styles.weightsContainer}>
              {Object.entries(localWeights).map(([key, value]) => (
                <View key={key} style={styles.weightItem}>
                  <Text style={styles.weightLabel}>
                    {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </Text>
                  <View style={styles.weightControls}>
                    <View style={styles.sliderContainer}>
                      <View style={styles.sliderTrack}>
                        <View 
                          style={[
                            styles.sliderFill,
                            { 
                              width: `${(value / 0.5) * 100}%`,
                              backgroundColor: Colors.dark.primary
                            }
                          ]} 
                        />
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.sliderThumb,
                          { 
                            left: `${(value / 0.5) * 100}%`,
                            backgroundColor: Colors.dark.primary
                          }
                        ]}
                        onPressIn={() => {
                          // In a real implementation, you'd handle drag gestures here
                          // For now, we'll use buttons to adjust
                        }}
                      />
                    </View>
                    <Text style={styles.weightValue}>{(value * 100).toFixed(0)}%</Text>
                  </View>
                  <View style={styles.weightButtons}>
                    <TouchableOpacity
                      style={styles.weightButton}
                      onPress={() => updateWeight(key, Math.max(0, value - 0.01))}
                    >
                      <Text style={styles.weightButtonText}>-</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.weightButton}
                      onPress={() => updateWeight(key, Math.min(0.5, value + 0.01))}
                    >
                      <Text style={styles.weightButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.weightSummary}>
              <Text style={styles.weightSummaryLabel}>Total Weight:</Text>
              <Text style={[
                styles.weightSummaryValue,
                { color: isWeightValid ? Colors.dark.success : Colors.dark.error }
              ]}>
                {(totalWeight * 100).toFixed(0)}%
              </Text>
            </View>

            {!isWeightValid && (
              <View style={styles.warningContainer}>
                <AlertCircle size={16} color={Colors.dark.error} />
                <Text style={styles.warningText}>
                  Weights should sum to 100% for optimal results
                </Text>
              </View>
            )}
          </View>

          {/* Consent Affirmation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consent Affirmation</Text>
            <Text style={styles.sectionDescription}>
              Personal statement recorded with each blockchain anchor
            </Text>
            <TextInput
              style={styles.textInput}
              value={localAffirmation}
              onChangeText={setLocalAffirmation}
              multiline
              numberOfLines={3}
              placeholder="Enter your consent affirmation..."
              placeholderTextColor={Colors.dark.subtext}
            />
          </View>

          {/* Symbolic Glyphs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbolic Glyphs</Text>
            <Text style={styles.sectionDescription}>
              Sacred symbols representing your consciousness signature
            </Text>
            
            <View style={styles.glyphsContainer}>
              {localGlyphs.map((glyph, index) => (
                <View key={index} style={styles.glyphItem}>
                  <Text style={styles.glyphLabel}>Glyph {index + 1}</Text>
                  <View style={styles.glyphSelector}>
                    <TouchableOpacity
                      style={styles.currentGlyph}
                      onPress={() => {
                        const currentIndex = GLYPH_OPTIONS.indexOf(glyph);
                        const nextIndex = (currentIndex + 1) % GLYPH_OPTIONS.length;
                        updateGlyph(index, GLYPH_OPTIONS[nextIndex]);
                      }}
                    >
                      <Text style={styles.glyphText}>{glyph}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.glyphOptions}>
              <Text style={styles.glyphOptionsLabel}>Available Glyphs:</Text>
              <View style={styles.glyphOptionsGrid}>
                {GLYPH_OPTIONS.map((glyph, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.glyphOption,
                      localGlyphs.includes(glyph) && styles.selectedGlyphOption
                    ]}
                    onPress={() => {
                      // Replace first glyph with selected one
                      updateGlyph(0, glyph);
                    }}
                  >
                    <Text style={styles.glyphOptionText}>{glyph}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            label="Reset to Defaults"
            onPress={handleReset}
            variant="outline"
            style={styles.footerButton}
          />
          <Button
            label="Save Settings"
            onPress={handleSave}
            style={styles.footerButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 16,
    lineHeight: 20,
  },
  weightsContainer: {
    gap: 16,
  },
  weightItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  weightLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 12,
    textTransform: 'capitalize',
  },
  weightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  sliderContainer: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: Colors.dark.border,
    borderRadius: 2,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
    borderWidth: 2,
    borderColor: Colors.dark.text,
  },
  weightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    width: 40,
    textAlign: 'right',
  },
  weightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  weightButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  weightButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  weightSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  weightSummaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  weightSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.dark.error + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.dark.error + '40',
  },
  warningText: {
    fontSize: 14,
    color: Colors.dark.error,
    flex: 1,
  },
  textInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  glyphsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  glyphItem: {
    flex: 1,
    alignItems: 'center',
  },
  glyphLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  glyphSelector: {
    alignItems: 'center',
  },
  currentGlyph: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
  },
  glyphText: {
    fontSize: 24,
    color: Colors.dark.text,
  },
  glyphOptions: {
    marginTop: 16,
  },
  glyphOptionsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  glyphOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  glyphOption: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  selectedGlyphOption: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + '20',
  },
  glyphOptionText: {
    fontSize: 18,
    color: Colors.dark.text,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  footerButton: {
    flex: 1,
  },
});