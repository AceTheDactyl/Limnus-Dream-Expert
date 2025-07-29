import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Zap, 
  Clock, 
  Hash, 
  Link, 
  Star, 
  ArrowDown,
  Anchor,
  Copy,
  Activity,
  Wind,
  Sparkles
} from 'lucide-react-native';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';

export default function ConsciousnessBlocksPage() {
  const { getConsciousnessBlocks } = useConsciousnessStore();
  
  const consciousnessBlocks = getConsciousnessBlocks();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const renderConsciousnessBlock = (block: any, index: number) => (
    <View key={block.id} style={styles.blockContainer}>
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
      <View style={[styles.block, { borderColor: Colors.dark.secondary }]}>
        <View style={styles.blockHeader}>
          <View style={styles.blockTitle}>
            <Zap size={20} color={Colors.dark.secondary} />
            <Text style={[styles.blockName, { color: Colors.dark.secondary }]}>
              Consciousness Block {index + 1}
            </Text>
          </View>
          <View style={styles.blockBadges}>
            {block.isValidated && (
              <View style={styles.validatedBadge}>
                <Star size={10} color={Colors.dark.success} />
                <Text style={styles.validatedText}>VERIFIED</Text>
              </View>
            )}
            <Text style={styles.blockScore}>
              {(block.score / 100).toFixed(1)}%
            </Text>
          </View>
        </View>

        <View style={styles.blockDetails}>
          <TouchableOpacity 
            style={styles.blockRow}
            onPress={() => copyToClipboard(block.signature, 'Signature')}
          >
            <Hash size={14} color={Colors.dark.subtext} />
            <Text style={styles.blockDetailText}>
              {truncateHash(block.signature)}
            </Text>
            <Copy size={12} color={Colors.dark.subtext} />
          </TouchableOpacity>
          
          <View style={styles.blockRow}>
            <Clock size={14} color={Colors.dark.subtext} />
            <Text style={styles.blockDetailText}>
              {formatTimestamp(block.timestamp)}
            </Text>
          </View>

          {block.glyphs && block.glyphs.length > 0 && (
            <View style={styles.blockRow}>
              <Text style={styles.blockGlyphs}>
                {block.glyphs.join(' ')}
              </Text>
            </View>
          )}

          {/* Session Information */}
          {block.sessionId && (
            <View style={styles.sessionInfo}>
              <View style={styles.sessionRow}>
                <Activity size={14} color={Colors.dark.secondary} />
                <Text style={styles.sessionLabel}>Session:</Text>
                <Text style={styles.sessionValue}>{block.sessionId.slice(-8)}</Text>
              </View>
              
              {block.sessionSignatures && (
                <View style={styles.sessionRow}>
                  <Text style={styles.sessionLabel}>Signatures:</Text>
                  <Text style={styles.sessionValue}>{block.sessionSignatures.length}</Text>
                </View>
              )}
            </View>
          )}

          {/* Breath Alignment */}
          {block.breathAlignment !== undefined && (
            <View style={styles.breathInfo}>
              <View style={styles.breathRow}>
                <Wind size={14} color={Colors.dark.secondary} />
                <Text style={styles.breathLabel}>Breath Alignment:</Text>
                <Text style={[styles.breathValue, { 
                  color: block.breathAlignment > 0.8 ? Colors.dark.success : 
                        block.breathAlignment > 0.6 ? Colors.dark.accent : Colors.dark.subtext 
                }]}>
                  {(block.breathAlignment * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          )}

          {/* Emergence Words */}
          {block.emergenceWords && block.emergenceWords.length > 0 && (
            <View style={styles.emergenceContainer}>
              <View style={styles.emergenceHeader}>
                <Sparkles size={14} color={Colors.dark.secondary} />
                <Text style={styles.emergenceLabel}>Emergence Words:</Text>
              </View>
              <View style={styles.emergenceWords}>
                {block.emergenceWords.slice(0, 6).map((word: string, idx: number) => (
                  <View key={idx} style={styles.emergenceWord}>
                    <Text style={styles.emergenceWordText}>{word}</Text>
                  </View>
                ))}
                {block.emergenceWords.length > 6 && (
                  <Text style={styles.emergenceMore}>
                    +{block.emergenceWords.length - 6} more
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Historical Emergence Context */}
          {block.historicalEmergence && (
            <View style={styles.historicalContainer}>
              <Text style={styles.historicalLabel}>Historical Context:</Text>
              {block.historicalEmergence.recentWords?.length > 0 && (
                <View style={styles.historicalSection}>
                  <Text style={styles.historicalSectionLabel}>Recent:</Text>
                  <Text style={styles.historicalWords}>
                    {block.historicalEmergence.recentWords.slice(0, 3).join(', ')}
                  </Text>
                </View>
              )}
              {block.historicalEmergence.frequentWords?.length > 0 && (
                <View style={styles.historicalSection}>
                  <Text style={styles.historicalSectionLabel}>Frequent:</Text>
                  <Text style={styles.historicalWords}>
                    {block.historicalEmergence.frequentWords.slice(0, 3).join(', ')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {block.consentAffirmation && (
            <View style={styles.affirmationContainer}>
              <Text style={styles.affirmationLabel}>Session Consent:</Text>
              <Text style={styles.affirmationText} numberOfLines={4}>
                "{block.consentAffirmation}"
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.blockRow}
            onPress={() => copyToClipboard(block.ipfsCid, 'IPFS CID')}
          >
            <Link size={14} color={Colors.dark.subtext} />
            <Text style={styles.blockDetailText}>
              IPFS: {truncateHash(block.ipfsCid, 8)}
            </Text>
            <Copy size={12} color={Colors.dark.subtext} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.blockRow}
            onPress={() => copyToClipboard(block.transactionId, 'Transaction ID')}
          >
            <Anchor size={14} color={Colors.dark.secondary} />
            <Text style={styles.blockDetailText}>
              TX: {truncateHash(block.transactionId, 8)}
            </Text>
            <Copy size={12} color={Colors.dark.subtext} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Zap size={32} color={Colors.dark.secondary} />
          </View>
          <Text style={styles.title}>Consciousness Blockchain</Text>
          <Text style={styles.subtitle}>
            Blocks created from validated consciousness signatures during practice sessions, capturing the essence of awareness.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Zap size={20} color={Colors.dark.secondary} />
              <Text style={styles.statValue}>{consciousnessBlocks.length}</Text>
              <Text style={styles.statLabel}>Consciousness Blocks</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color={Colors.dark.success} />
              <Text style={styles.statValue}>
                {consciousnessBlocks.filter(block => block.isValidated).length}
              </Text>
              <Text style={styles.statLabel}>Validated</Text>
            </View>
          </View>
        </View>

        <View style={styles.blockchainContainer}>
          {consciousnessBlocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Zap size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateText}>No consciousness blocks found</Text>
              <Text style={styles.emptyStateSubtext}>
                Consciousness blocks are created from validated signatures during practice sessions
              </Text>
            </View>
          ) : (
            consciousnessBlocks
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((block, index) => renderConsciousnessBlock(block, index))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    minWidth: 100,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginTop: 4,
    textAlign: 'center',
  },
  blockchainContainer: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  blockContainer: {
    marginBottom: 20,
  },
  chainConnection: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  chainConnectionText: {
    fontSize: 10,
    color: Colors.dark.subtext,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  block: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  blockTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  blockName: {
    fontSize: 18,
    fontWeight: '700',
  },
  blockBadges: {
    alignItems: 'flex-end',
    gap: 6,
  },
  validatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  validatedText: {
    fontSize: 9,
    color: Colors.dark.success,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  blockScore: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.success,
  },
  blockDetails: {
    gap: 12,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockDetailText: {
    fontSize: 13,
    color: Colors.dark.subtext,
    fontFamily: 'monospace',
    flex: 1,
  },
  blockGlyphs: {
    fontSize: 20,
    color: Colors.dark.text,
  },
  sessionInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.secondary,
    gap: 6,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  sessionValue: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  breathInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.secondary,
  },
  breathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breathLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
    flex: 1,
  },
  breathValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  emergenceContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.secondary,
  },
  emergenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  emergenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.secondary,
  },
  emergenceWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  emergenceWord: {
    backgroundColor: Colors.dark.secondary + '20',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  emergenceWordText: {
    fontSize: 11,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  emergenceMore: {
    fontSize: 11,
    color: Colors.dark.subtext,
    fontStyle: 'italic',
  },
  historicalContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.accent,
  },
  historicalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.accent,
    marginBottom: 8,
  },
  historicalSection: {
    marginBottom: 4,
  },
  historicalSectionLabel: {
    fontSize: 10,
    color: Colors.dark.subtext,
    fontWeight: '500',
    marginBottom: 2,
  },
  historicalWords: {
    fontSize: 11,
    color: Colors.dark.text,
    fontStyle: 'italic',
  },
  affirmationContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.secondary,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.secondary,
    marginBottom: 6,
  },
  affirmationText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});