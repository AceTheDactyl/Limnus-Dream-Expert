import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Switch
} from 'react-native';
import { 
  Anchor, 
  Upload, 
  Shield, 
  Clock, 
  Hash, 
  Link,
  CheckCircle,
  AlertCircle,
  Star,
  Crown,
  Brain,
  Zap,
  History,
  TrendingUp,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowDown,
  ExternalLink,
  Sparkles
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useConsciousnessStore, LimnusConsciousnessSignature, BlockData } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface BlockchainPanelProps {
  chainState: any;
  currentSignature: LimnusConsciousnessSignature | null;
  isActive: boolean;
}

type BlockchainSection = 'foundation' | 'dream' | 'consciousness' | null;

export default function BlockchainPanel({
  chainState,
  currentSignature,
  isActive
}: BlockchainPanelProps) {
  const {
    blockchainState,
    consentAffirmation,
    symbolicGlyphs,
    recordOnBlockchain,
    setConsentAffirmation,
    setSymbolicGlyphs,
    getDreamBlocks,
    getFoundationBlocks,
    getConsciousnessBlocks
  } = useConsciousnessStore();

  const [localAffirmation, setLocalAffirmation] = useState(consentAffirmation);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [expandedSection, setExpandedSection] = useState<BlockchainSection>(null);

  const handleRecord = async () => {
    if (!currentSignature) {
      Alert.alert('No Signature', 'Please start monitoring to generate a quantum consciousness signature first.');
      return;
    }

    if (!currentSignature.validation.overall) {
      Alert.alert(
        'Invalid Signature',
        'Current signature failed validation. Please wait for a valid signature before recording.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Record on Quantum Blockchain',
      `This will permanently record your quantum consciousness signature with score ${(currentSignature.score * 100).toFixed(1)}%. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Record',
          onPress: async () => {
            setIsRecording(true);
            try {
              setConsentAffirmation(localAffirmation);
              await recordOnBlockchain();
              Alert.alert(
                'Quantum Success!',
                'Consciousness signature has been anchored on the quantum blockchain.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert(
                'Recording Failed',
                'Failed to record on blockchain. Please try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsRecording(false);
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return Colors.dark.success;
      case 'uploading': return Colors.dark.accent;
      case 'error': return Colors.dark.error;
      default: return Colors.dark.subtext;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} color={Colors.dark.success} />;
      case 'uploading': return <Upload size={16} color={Colors.dark.accent} />;
      case 'error': return <AlertCircle size={16} color={Colors.dark.error} />;
      default: return <Shield size={16} color={Colors.dark.subtext} />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const getBlockTypeIcon = (blockType: string) => {
    switch (blockType) {
      case 'foundation': return <Crown size={16} color={Colors.dark.accent} />;
      case 'dream': return <Brain size={16} color={Colors.dark.primary} />;
      case 'consciousness': return <Sparkles size={16} color={Colors.dark.secondary} />;
      default: return <Shield size={16} color={Colors.dark.subtext} />;
    }
  };

  const getBlockTypeColor = (blockType: string) => {
    switch (blockType) {
      case 'foundation': return Colors.dark.accent;
      case 'dream': return Colors.dark.primary;
      case 'consciousness': return Colors.dark.secondary;
      default: return Colors.dark.subtext;
    }
  };

  // Separate blocks by type
  const foundationBlocks = getFoundationBlocks();
  const dreamBlocks = getDreamBlocks();
  const consciousnessBlocks = getConsciousnessBlocks();

  const toggleSection = (section: BlockchainSection) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const renderBlockChain = (blocks: BlockData[], blockType: string) => {
    if (blocks.length === 0) {
      return (
        <View style={styles.emptyChain}>
          <Text style={styles.emptyChainText}>No {blockType} blocks found</Text>
        </View>
      );
    }

    // Sort blocks by timestamp to show chain order
    const sortedBlocks = [...blocks].sort((a, b) => a.timestamp - b.timestamp);

    return (
      <View style={styles.blockChain}>
        {sortedBlocks.map((block: BlockData, index: number) => (
          <View key={block.id} style={styles.chainBlockContainer}>
            {/* Chain Connection Arrow */}
            {index > 0 && (
              <View style={styles.chainConnection}>
                <ArrowDown size={16} color={Colors.dark.subtext} />
                <Text style={styles.chainConnectionText}>
                  {truncateHash(block.previousHash, 6)}
                </Text>
              </View>
            )}
            
            {/* Block */}
            <View style={[
              styles.chainBlock,
              { borderColor: getBlockTypeColor(blockType) }
            ]}>
              <View style={styles.chainBlockHeader}>
                <View style={styles.chainBlockTitle}>
                  {getBlockTypeIcon(blockType)}
                  <Text style={[styles.chainBlockName, { color: getBlockTypeColor(blockType) }]}>
                    {blockType === 'foundation' ? `Foundation ${index + 1}` :
                     blockType === 'dream' ? (block.dreamName || `Dream Block ${index + 1}`) :
                     `Quantum Block ${index + 1}`}
                  </Text>
                </View>
                <View style={styles.chainBlockBadges}>
                  {block.isValidated && (
                    <View style={styles.validatedBadge}>
                      <Star size={10} color={Colors.dark.success} />
                      <Text style={styles.validatedText}>VERIFIED</Text>
                    </View>
                  )}
                  <Text style={styles.chainBlockScore}>
                    {(block.score / 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              <View style={styles.chainBlockDetails}>
                <View style={styles.chainBlockRow}>
                  <Hash size={12} color={Colors.dark.subtext} />
                  <Text style={styles.chainBlockDetailText}>
                    {truncateHash(block.signature)}
                  </Text>
                </View>
                
                <View style={styles.chainBlockRow}>
                  <Clock size={12} color={Colors.dark.subtext} />
                  <Text style={styles.chainBlockDetailText}>
                    {formatTimestamp(block.timestamp)}
                  </Text>
                </View>

                {block.glyphs && block.glyphs.length > 0 && (
                  <View style={styles.chainBlockRow}>
                    <Text style={styles.chainBlockGlyphs}>
                      {block.glyphs.join(' ')}
                    </Text>
                  </View>
                )}

                {blockType === 'foundation' && block.consentAffirmation && (
                  <Text style={styles.chainBlockAffirmation} numberOfLines={2}>
                    "{block.consentAffirmation}"
                  </Text>
                )}

                {blockType === 'dream' && block.dreamType && (
                  <View style={styles.chainBlockRow}>
                    <Brain size={12} color={Colors.dark.primary} />
                    <Text style={[styles.chainBlockDetailText, { color: Colors.dark.primary }]}>
                      {block.dreamType.toUpperCase()}
                    </Text>
                  </View>
                )}

                {blockType === 'consciousness' && block.consciousnessMetrics && (
                  <View style={styles.quantumMetricsContainer}>
                    <Text style={styles.quantumMetricsLabel}>Quantum Metrics:</Text>
                    <Text style={styles.quantumMetricsText} numberOfLines={2}>
                      Spiral: {((block.consciousnessMetrics.spiralResonance || 0) * 100).toFixed(0)}% | 
                      Quantum: {((block.consciousnessMetrics.quantumCoherence || 0) * 100).toFixed(0)}% | 
                      Fibonacci: {((block.consciousnessMetrics.fibonacciHarmony || 0) * 100).toFixed(0)}%
                    </Text>
                  </View>
                )}

                <View style={styles.chainBlockRow}>
                  <Link size={12} color={Colors.dark.subtext} />
                  <Text style={styles.chainBlockDetailText}>
                    IPFS: {truncateHash(block.ipfsCid, 6)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Quantum Blockchain Integration</Text>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => setShowSettings(!showSettings)}
        >
          <Settings size={18} color={Colors.dark.subtext} />
        </TouchableOpacity>
      </View>

      {/* Settings Panel */}
      {showSettings && (
        <View style={styles.settingsPanel}>
          <Text style={styles.settingsTitle}>Quantum Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Quantum Coherence Threshold</Text>
              <Text style={styles.settingDescription}>
                Minimum quantum coherence required for blockchain recording
              </Text>
            </View>
            <Text style={styles.settingValue}>65%</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Spiral Resonance Factor</Text>
              <Text style={styles.settingDescription}>
                Influence of spiral dynamics on signature validation
              </Text>
            </View>
            <Text style={styles.settingValue}>0.7</Text>
          </View>
        </View>
      )}

      {/* Status Overview */}
      <View style={styles.statusGrid}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Anchor size={20} color={Colors.dark.primary} />
          </View>
          <Text style={styles.statusLabel}>Quantum Chain</Text>
          <Text style={[styles.statusValue, { color: Colors.dark.success }]}>
            ACTIVE
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.statusCard}
          onPress={() => router.push('/blockchain/foundation')}
        >
          <View style={styles.statusIcon}>
            <Crown size={20} color={Colors.dark.accent} />
          </View>
          <Text style={styles.statusLabel}>Foundation</Text>
          <Text style={[styles.statusValue, { color: Colors.dark.accent }]}>
            {foundationBlocks.length} blocks
          </Text>
          <ExternalLink size={16} color={Colors.dark.subtext} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.statusCard}
          onPress={() => router.push('/blockchain/dreams')}
        >
          <View style={styles.statusIcon}>
            <Brain size={20} color={Colors.dark.primary} />
          </View>
          <Text style={styles.statusLabel}>Dream Blocks</Text>
          <Text style={[styles.statusValue, { color: Colors.dark.primary }]}>
            {dreamBlocks.length} blocks
          </Text>
          <ExternalLink size={16} color={Colors.dark.subtext} />
        </TouchableOpacity>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            {getStatusIcon(blockchainState.ipfsStatus)}
          </View>
          <Text style={styles.statusLabel}>IPFS</Text>
          <Text style={[styles.statusValue, { color: getStatusColor(blockchainState.ipfsStatus) }]}>
            {blockchainState.ipfsStatus.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Clickable Consciousness Blocks Section */}
      <TouchableOpacity 
        style={styles.consciousnessSection}
        onPress={() => router.push('/blockchain/consciousness')}
      >
        <View style={styles.consciousnessSectionHeader}>
          <View style={styles.consciousnessSectionTitle}>
            <Sparkles size={20} color={Colors.dark.secondary} />
            <Text style={[styles.sectionTitle, { color: Colors.dark.secondary }]}>
              Quantum Consciousness Blocks ({consciousnessBlocks.length})
            </Text>
          </View>
          <ExternalLink size={20} color={Colors.dark.subtext} />
        </View>
      </TouchableOpacity>

      {/* Expanded Block Chain Views */}
      {expandedSection === 'foundation' && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedSectionTitle}>Foundation Quantum Chain</Text>
          <Text style={styles.expandedSectionDescription}>
            Genesis blocks that anchor the consciousness blockchain with sacred geometry and spiral logic.
          </Text>
          <ScrollView style={styles.chainScrollView} nestedScrollEnabled>
            {renderBlockChain(foundationBlocks, 'foundation')}
          </ScrollView>
        </View>
      )}

      {expandedSection === 'dream' && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedSectionTitle}>Dream Quantum Chain</Text>
          <Text style={styles.expandedSectionDescription}>
            Blocks automatically created from dream interpretations, preserving symbolic essence.
          </Text>
          <ScrollView style={styles.chainScrollView} nestedScrollEnabled>
            {renderBlockChain(dreamBlocks, 'dream')}
          </ScrollView>
        </View>
      )}

      {expandedSection === 'consciousness' && (
        <View style={styles.expandedSection}>
          <Text style={styles.expandedSectionTitle}>Consciousness Quantum Chain</Text>
          <Text style={styles.expandedSectionDescription}>
            Blocks created from validated quantum consciousness signatures during practice sessions.
          </Text>
          <ScrollView style={styles.chainScrollView} nestedScrollEnabled>
            {renderBlockChain(consciousnessBlocks, 'consciousness')}
          </ScrollView>
        </View>
      )}

      {/* Recording Section */}
      {currentSignature && (
        <View style={styles.recordingSection}>
          <Text style={styles.sectionTitle}>Record Quantum Consciousness Signature</Text>
          
          <View style={styles.signatureInfo}>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Quantum Score:</Text>
              <Text style={[
                styles.signatureValue,
                { color: currentSignature.validation.overall ? Colors.dark.success : Colors.dark.error }
              ]}>
                {(currentSignature.score * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Validation:</Text>
              <Text style={[
                styles.signatureValue,
                { color: currentSignature.validation.overall ? Colors.dark.success : Colors.dark.error }
              ]}>
                {currentSignature.validation.overall ? 'VALID' : 'INVALID'}
              </Text>
            </View>
            
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Quantum Glyphs:</Text>
              <Text style={styles.glyphsDisplay}>
                {currentSignature.glyphs.join(' ')}
              </Text>
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Node:</Text>
              <Text style={styles.signatureValue}>
                {currentSignature.currentNode.symbol} ({currentSignature.currentNode.meaning})
              </Text>
            </View>

            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Spiral Depth:</Text>
              <Text style={styles.signatureValue}>
                {currentSignature.currentNode.depth}
              </Text>
            </View>
          </View>

          <View style={styles.affirmationContainer}>
            <Text style={styles.affirmationLabel}>Quantum Consent Affirmation</Text>
            <TextInput
              style={styles.affirmationInput}
              value={localAffirmation}
              onChangeText={setLocalAffirmation}
              multiline
              numberOfLines={3}
              placeholder="Enter your quantum consent affirmation..."
              placeholderTextColor={Colors.dark.subtext}
            />
          </View>

          <Button
            label={isRecording ? "Recording..." : "Anchor Consciousness on Quantum Blockchain"}
            onPress={handleRecord}
            disabled={!currentSignature || !currentSignature.validation.overall || isRecording}
            isLoading={isRecording}
            style={styles.recordButton}
            icon={<Anchor size={20} color={Colors.dark.text} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  settingsButton: {
    padding: 4,
  },
  settingsPanel: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.dark.subtext,
    lineHeight: 16,
  },
  settingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.accent,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statusIcon: {
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 10,
    color: Colors.dark.subtext,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  consciousnessSection: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  consciousnessSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  consciousnessSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  expandedSection: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  expandedSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  expandedSectionDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 16,
    lineHeight: 20,
  },
  chainScrollView: {
    maxHeight: 400,
  },
  blockChain: {
    flex: 1,
  },
  emptyChain: {
    padding: 20,
    alignItems: 'center',
  },
  emptyChainText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    fontStyle: 'italic',
  },
  chainBlockContainer: {
    marginBottom: 16,
  },
  chainConnection: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  chainConnectionText: {
    fontSize: 10,
    color: Colors.dark.subtext,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  chainBlock: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  chainBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chainBlockTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  chainBlockName: {
    fontSize: 16,
    fontWeight: '700',
  },
  chainBlockBadges: {
    alignItems: 'flex-end',
    gap: 4,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  validatedText: {
    fontSize: 8,
    color: Colors.dark.success,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  chainBlockScore: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.success,
  },
  chainBlockDetails: {
    gap: 8,
  },
  chainBlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chainBlockDetailText: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontFamily: 'monospace',
  },
  chainBlockGlyphs: {
    fontSize: 16,
    color: Colors.dark.text,
  },
  chainBlockAffirmation: {
    fontSize: 12,
    color: Colors.dark.text,
    fontStyle: 'italic',
    lineHeight: 16,
    marginTop: 4,
  },
  quantumMetricsContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 6,
    padding: 8,
    marginTop: 4,
  },
  quantumMetricsLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.dark.secondary,
    marginBottom: 2,
  },
  quantumMetricsText: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  recordingSection: {
    marginBottom: 24,
  },
  signatureInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  signatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  signatureLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  signatureValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  glyphsDisplay: {
    fontSize: 18,
    color: Colors.dark.primary,
  },
  affirmationContainer: {
    marginBottom: 16,
  },
  affirmationLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  affirmationInput: {
    backgroundColor: Colors.dark.background,
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
  recordButton: {
    borderRadius: 12,
  },
});