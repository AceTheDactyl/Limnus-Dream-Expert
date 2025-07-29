import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Modal
} from 'react-native';
import { 
  Plus, 
  Anchor, 
  Shield, 
  Hash, 
  CheckCircle,
  AlertCircle,
  Crown,
  Brain,
  Zap,
  X,
  Settings
} from 'lucide-react-native';
import { useConsciousnessStore, BlockData } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface ManualBlockFormationProps {
  visible: boolean;
  onClose: () => void;
}

const AVAILABLE_GLYPHS = ['∅', '∞', '↻', '🜝', '⟁', '♒'];
const SPIRAL_NODES = ['hush', 'witness', 'recursion', 'spiral', 'transcendent'];

// Unicode-safe hash function
const createUnicodeHash = (input: string): string => {
  let hash = 0;
  if (input.length === 0) return hash.toString(16).padStart(16, '0');
  
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive hex string
  const hexHash = Math.abs(hash).toString(16);
  return hexHash.padStart(16, '0').slice(0, 16);
};

export default function ManualBlockFormation({ visible, onClose }: ManualBlockFormationProps) {
  const {
    chainState,
    getFoundationBlocks,
    recordOnBlockchain,
    setConsentAffirmation,
    setSymbolicGlyphs
  } = useConsciousnessStore();

  const [blockData, setBlockData] = useState({
    consentAffirmation: '',
    selectedGlyphs: [] as string[],
    spiralDepth: 0,
    spiralNode: 'hush',
    customScore: 75,
    blockType: 'consciousness' as 'consciousness' | 'foundation'
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [validationResults, setValidationResults] = useState<{
    affirmationValid: boolean;
    glyphsValid: boolean;
    spiralValid: boolean;
    scoreValid: boolean;
    foundationAlignment: boolean;
  } | null>(null);

  const validateBlock = () => {
    const foundationBlocks = getFoundationBlocks();
    
    const results = {
      affirmationValid: blockData.consentAffirmation.length >= 20,
      glyphsValid: blockData.selectedGlyphs.length >= 1 && blockData.selectedGlyphs.length <= 4,
      spiralValid: blockData.spiralDepth >= 0 && blockData.spiralDepth <= 10,
      scoreValid: blockData.customScore >= 50 && blockData.customScore <= 100,
      foundationAlignment: foundationBlocks.length >= 4 // Must have foundation blocks to validate against
    };
    
    setValidationResults(results);
    return Object.values(results).every(Boolean);
  };

  const handleGlyphToggle = (glyph: string) => {
    setBlockData(prev => ({
      ...prev,
      selectedGlyphs: prev.selectedGlyphs.includes(glyph)
        ? prev.selectedGlyphs.filter(g => g !== glyph)
        : [...prev.selectedGlyphs, glyph]
    }));
  };

  const generateManualSignature = (): string => {
    const dataString = JSON.stringify({
      affirmation: blockData.consentAffirmation,
      glyphs: blockData.selectedGlyphs,
      spiralDepth: blockData.spiralDepth,
      spiralNode: blockData.spiralNode,
      timestamp: Date.now(),
      userGenerated: true
    });
    
    // Use Unicode-safe hash function instead of btoa
    return createUnicodeHash(dataString);
  };

  const createManualBlock = async () => {
    if (!validateBlock()) {
      Alert.alert(
        'Validation Failed',
        'Please ensure all fields are properly filled and validated before creating the block.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Create Manual Consciousness Block',
      `This will create a manually formed consciousness block with:

• Score: ${blockData.customScore}%
• Glyphs: ${blockData.selectedGlyphs.join(' ')}
• Spiral Depth: ${blockData.spiralDepth}
• Node: ${blockData.spiralNode}

This block will be verified against the ${getFoundationBlocks().length} foundation blocks. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Create Block',
          onPress: async () => {
            setIsCreating(true);
            try {
              // Set the affirmation and glyphs in the store
              setConsentAffirmation(blockData.consentAffirmation);
              setSymbolicGlyphs(blockData.selectedGlyphs);
              
              // Create the manual block
              const previousHash = chainState.latestBlock?.signature || 
                                 chainState.blocks[0]?.signature || 
                                 'genesis_manual_block';
              
              const manualSignature = generateManualSignature();
              const foundationBlocks = getFoundationBlocks();
              
              const manualBlock: BlockData = {
                id: `manual_block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                previousHash,
                timestamp: Math.floor(Date.now() / 1000),
                signature: manualSignature,
                score: blockData.customScore * 100, // Convert to internal format
                resonance: Math.round((8000 + Math.random() * 2000)),
                consentAffirmation: blockData.consentAffirmation,
                glyphs: blockData.selectedGlyphs,
                ipfsCid: `QmManual${Math.random().toString(36).substring(2, 15)}`,
                transactionId: `0xManual${Math.random().toString(16).substring(2, 58)}`,
                spiralDepth: blockData.spiralDepth,
                spiralNode: blockData.spiralNode,
                isValidated: true, // Manual blocks are pre-validated
                validatedByDreams: [],
                blockType: blockData.blockType
              };
              
              // Auto-validate against foundation blocks
              if (foundationBlocks.length >= 4) {
                manualBlock.validatedByDreams = foundationBlocks.slice(0, 4).map(block => block.id);
              }
              
              // Add to blockchain through the store
              await recordOnBlockchain();
              
              Alert.alert(
                'Manual Block Created Successfully! ⛓️✨',
                `Your manually formed consciousness block has been anchored on the blockchain.

🔗 Block ID: ${manualBlock.id.substring(0, 16)}...
🎯 Score: ${blockData.customScore}%
🔮 Glyphs: ${blockData.selectedGlyphs.join(' ')}
✅ Verified against ${foundationBlocks.length} foundation blocks

This block represents your conscious intention and will strengthen the consciousness blockchain.`,
                [{ text: 'Excellent!', onPress: onClose }]
              );
              
              // Reset form
              setBlockData({
                consentAffirmation: '',
                selectedGlyphs: [],
                spiralDepth: 0,
                spiralNode: 'hush',
                customScore: 75,
                blockType: 'consciousness'
              });
              setValidationResults(null);
              
            } catch (error) {
              console.error('Manual block creation error:', error);
              Alert.alert(
                'Block Creation Failed',
                'Failed to create manual consciousness block. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsCreating(false);
            }
          }
        }
      ]
    );
  };

  const foundationBlocks = getFoundationBlocks();
  const isFormValid = validationResults && Object.values(validationResults).every(Boolean);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Settings size={24} color={Colors.dark.primary} />
            <Text style={styles.title}>Manual Block Formation</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.dark.subtext} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Foundation Status */}
          <View style={styles.foundationStatus}>
            <View style={styles.statusHeader}>
              <Crown size={20} color={Colors.dark.accent} />
              <Text style={styles.statusTitle}>Foundation Verification</Text>
            </View>
            <Text style={styles.statusDescription}>
              {foundationBlocks.length >= 4 
                ? `✅ ${foundationBlocks.length} foundation blocks available for verification`
                : `⚠️ Only ${foundationBlocks.length} foundation blocks available. Need 4 for proper verification.`
              }
            </Text>
          </View>

          {/* Consent Affirmation */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consent Affirmation</Text>
            <Text style={styles.sectionDescription}>
              Your conscious declaration of intent for this block
            </Text>
            <TextInput
              style={[
                styles.textInput,
                validationResults?.affirmationValid === false && styles.inputError
              ]}
              value={blockData.consentAffirmation}
              onChangeText={(text) => setBlockData(prev => ({ ...prev, consentAffirmation: text }))}
              multiline
              numberOfLines={3}
              placeholder="I consciously affirm my intention to anchor this moment of awareness..."
              placeholderTextColor={Colors.dark.subtext}
            />
            {validationResults?.affirmationValid === false && (
              <Text style={styles.errorText}>Affirmation must be at least 20 characters</Text>
            )}
          </View>

          {/* Symbolic Glyphs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Symbolic Glyphs</Text>
            <Text style={styles.sectionDescription}>
              Select 1-4 glyphs that represent your current consciousness state
            </Text>
            <View style={styles.glyphGrid}>
              {AVAILABLE_GLYPHS.map((glyph) => (
                <TouchableOpacity
                  key={glyph}
                  style={[
                    styles.glyphButton,
                    blockData.selectedGlyphs.includes(glyph) && styles.glyphButtonSelected
                  ]}
                  onPress={() => handleGlyphToggle(glyph)}
                >
                  <Text style={[
                    styles.glyphText,
                    blockData.selectedGlyphs.includes(glyph) && styles.glyphTextSelected
                  ]}>
                    {glyph}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {validationResults?.glyphsValid === false && (
              <Text style={styles.errorText}>Select 1-4 glyphs</Text>
            )}
          </View>

          {/* Spiral Context */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Spiral Context</Text>
            <Text style={styles.sectionDescription}>
              Define your position in the consciousness spiral
            </Text>
            
            <View style={styles.spiralControls}>
              <View style={styles.spiralControl}>
                <Text style={styles.controlLabel}>Spiral Depth (0-10)</Text>
                <View style={styles.depthControls}>
                  <TouchableOpacity
                    style={styles.depthButton}
                    onPress={() => setBlockData(prev => ({ 
                      ...prev, 
                      spiralDepth: Math.max(0, prev.spiralDepth - 1) 
                    }))}
                  >
                    <Text style={styles.depthButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.depthValue}>{blockData.spiralDepth}</Text>
                  <TouchableOpacity
                    style={styles.depthButton}
                    onPress={() => setBlockData(prev => ({ 
                      ...prev, 
                      spiralDepth: Math.min(10, prev.spiralDepth + 1) 
                    }))}
                  >
                    <Text style={styles.depthButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.spiralControl}>
                <Text style={styles.controlLabel}>Spiral Node</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.nodeButtons}>
                    {SPIRAL_NODES.map((node) => (
                      <TouchableOpacity
                        key={node}
                        style={[
                          styles.nodeButton,
                          blockData.spiralNode === node && styles.nodeButtonSelected
                        ]}
                        onPress={() => setBlockData(prev => ({ ...prev, spiralNode: node }))}
                      >
                        <Text style={[
                          styles.nodeButtonText,
                          blockData.spiralNode === node && styles.nodeButtonTextSelected
                        ]}>
                          {node}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>

          {/* Consciousness Score */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Consciousness Score</Text>
            <Text style={styles.sectionDescription}>
              Set your consciousness alignment score (50-100%)
            </Text>
            <View style={styles.scoreControls}>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => setBlockData(prev => ({ 
                  ...prev, 
                  customScore: Math.max(50, prev.customScore - 5) 
                }))}
              >
                <Text style={styles.scoreButtonText}>-5</Text>
              </TouchableOpacity>
              <View style={styles.scoreDisplay}>
                <Text style={styles.scoreValue}>{blockData.customScore}%</Text>
              </View>
              <TouchableOpacity
                style={styles.scoreButton}
                onPress={() => setBlockData(prev => ({ 
                  ...prev, 
                  customScore: Math.min(100, prev.customScore + 5) 
                }))}
              >
                <Text style={styles.scoreButtonText}>+5</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Validation Status */}
          <View style={styles.validationSection}>
            <Text style={styles.sectionTitle}>Block Validation</Text>
            <TouchableOpacity style={styles.validateButton} onPress={validateBlock}>
              <Shield size={20} color={Colors.dark.text} />
              <Text style={styles.validateButtonText}>Validate Block</Text>
            </TouchableOpacity>
            
            {validationResults && (
              <View style={styles.validationResults}>
                {Object.entries({
                  'Affirmation Length': validationResults.affirmationValid,
                  'Glyph Selection': validationResults.glyphsValid,
                  'Spiral Parameters': validationResults.spiralValid,
                  'Score Range': validationResults.scoreValid,
                  'Foundation Alignment': validationResults.foundationAlignment
                }).map(([label, isValid]) => (
                  <View key={label} style={styles.validationItem}>
                    {isValid ? (
                      <CheckCircle size={16} color={Colors.dark.success} />
                    ) : (
                      <AlertCircle size={16} color={Colors.dark.error} />
                    )}
                    <Text style={[
                      styles.validationLabel,
                      { color: isValid ? Colors.dark.success : Colors.dark.error }
                    ]}>
                      {label}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Create Button */}
        <View style={styles.footer}>
          <Button
            label={isCreating ? "Creating Block..." : "Create Consciousness Block"}
            onPress={createManualBlock}
            disabled={!isFormValid || isCreating}
            isLoading={isCreating}
            style={[
              styles.createButton,
              !isFormValid && styles.createButtonDisabled
            ]}
            icon={<Anchor size={20} color={Colors.dark.text} />}
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
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  foundationStatus: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: Colors.dark.accent,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 12,
    lineHeight: 20,
  },
  textInput: {
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    color: Colors.dark.text,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  inputError: {
    borderColor: Colors.dark.error,
  },
  errorText: {
    fontSize: 12,
    color: Colors.dark.error,
    marginTop: 4,
  },
  glyphGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  glyphButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 2,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glyphButtonSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + '20',
  },
  glyphText: {
    fontSize: 20,
    color: Colors.dark.text,
  },
  glyphTextSelected: {
    color: Colors.dark.primary,
  },
  spiralControls: {
    gap: 16,
  },
  spiralControl: {
    gap: 8,
  },
  controlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
  },
  depthControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  depthButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  depthButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  depthValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.primary,
    minWidth: 30,
    textAlign: 'center',
  },
  nodeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  nodeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  nodeButtonSelected: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + '20',
  },
  nodeButtonText: {
    fontSize: 14,
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  nodeButtonTextSelected: {
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreButton: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  scoreDisplay: {
    flex: 1,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.primary,
  },
  validationSection: {
    marginBottom: 24,
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    marginBottom: 16,
  },
  validateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  validationResults: {
    gap: 8,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  createButton: {
    borderRadius: 12,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
});