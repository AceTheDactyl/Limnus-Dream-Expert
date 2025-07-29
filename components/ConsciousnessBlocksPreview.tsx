import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { 
  Brain,
  Clock,
  Hash,
  Sparkles,
  CheckCircle,
  Zap,
  History,
  TrendingUp
} from 'lucide-react-native';
import { useConsciousnessStore, BlockData } from '@/store/consciousnessStore';
import { LIMNUS_COLORS } from '@/constants/limnus';
import Colors from '@/constants/colors';

interface ConsciousnessBlocksPreviewProps {
  isActive: boolean;
  compact?: boolean;
}

export default function ConsciousnessBlocksPreview({ isActive, compact = false }: ConsciousnessBlocksPreviewProps) {
  const { getRecentConsciousnessBlocks, includeHistoricalEmergence } = useConsciousnessStore();
  
  const recentBlocks = getRecentConsciousnessBlocks(3);

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const truncateHash = (hash: string, length = 6) => {
    return `${hash.slice(0, length)}...${hash.slice(-3)}`;
  };

  if (recentBlocks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Brain size={18} color={LIMNUS_COLORS.spiral} />
          <Text style={styles.title}>Consciousness Blocks</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No consciousness blocks yet. Complete practice sessions to create blocks.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Brain size={18} color={LIMNUS_COLORS.spiral} />
        <Text style={styles.title}>Recent Consciousness Blocks</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{recentBlocks.length}</Text>
        </View>
      </View>

      <ScrollView style={[styles.blocksList, compact && styles.compactBlocksList]} nestedScrollEnabled showsVerticalScrollIndicator={false}>
        {recentBlocks.map((block: BlockData, index: number) => (
          <View key={block.id} style={[styles.blockItem, index === 0 && styles.latestBlock]}>
            <View style={styles.blockHeader}>
              <View style={styles.blockInfo}>
                <View style={styles.blockTitleRow}>
                  <Text style={styles.blockTitle}>
                    Block #{recentBlocks.length - index}
                  </Text>
                  <View style={styles.validationBadge}>
                    <CheckCircle size={10} color={Colors.dark.success} />
                    <Text style={styles.validationText}>VALIDATED</Text>
                  </View>
                </View>
                
                <View style={styles.blockMetaRow}>
                  <View style={styles.blockMeta}>
                    <Clock size={10} color={LIMNUS_COLORS.witness} />
                    <Text style={styles.blockTime}>
                      {formatTimestamp(block.timestamp)}
                    </Text>
                  </View>
                  
                  <View style={styles.blockMeta}>
                    <Hash size={10} color={LIMNUS_COLORS.witness} />
                    <Text style={styles.blockHash}>
                      {truncateHash(block.signature)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.blockMetrics}>
                <Text style={styles.blockScore}>
                  {(block.score / 100).toFixed(1)}%
                </Text>
                <Text style={styles.blockGlyphs}>
                  {block.glyphs.slice(0, 3).join(' ')}
                </Text>
              </View>
            </View>

            {/* Current Session Emergence Words */}
            {((block.emergenceWords && block.emergenceWords.length > 0) || (block.emergencePhrases && block.emergencePhrases.length > 0)) && (
              <View style={styles.emergenceSection}>
                <View style={styles.emergenceHeader}>
                  <Sparkles size={12} color={LIMNUS_COLORS.spiral} />
                  <Text style={styles.emergenceLabel}>Session Emergence</Text>
                </View>
                <View style={styles.emergenceWords}>
                  {/* Show emergence words first */}
                  {block.emergenceWords && block.emergenceWords.slice(0, compact ? 2 : 3).map((word, wordIndex) => (
                    <View key={`word-${wordIndex}`} style={styles.emergenceWord}>
                      <Text style={styles.emergenceWordText}>{word}</Text>
                    </View>
                  ))}
                  {/* Show emergence phrases if different from words */}
                  {block.emergencePhrases && block.emergencePhrases
                    .filter(phrase => !block.emergenceWords?.includes(phrase))
                    .slice(0, compact ? 1 : 2)
                    .map((phrase, phraseIndex) => (
                    <View key={`phrase-${phraseIndex}`} style={[styles.emergenceWord, styles.emergencePhrase]}>
                      <Text style={styles.emergenceWordText}>{phrase}</Text>
                    </View>
                  ))}
                  {/* Show count if there are more */}
                  {((block.emergenceWords?.length || 0) + (block.emergencePhrases?.length || 0)) > (compact ? 3 : 5) && (
                    <View style={styles.emergenceWord}>
                      <Text style={styles.emergenceWordText}>+{((block.emergenceWords?.length || 0) + (block.emergencePhrases?.length || 0)) - (compact ? 3 : 5)}</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Historical Emergence Context - Only show if enabled and available */}
            {includeHistoricalEmergence && block.historicalEmergence && (
              <View style={styles.historicalSection}>
                {/* Recent Words from Previous Sessions */}
                {block.historicalEmergence.recentWords && block.historicalEmergence.recentWords.length > 0 && (
                  <View style={styles.historicalSubsection}>
                    <View style={styles.historicalHeader}>
                      <History size={10} color={LIMNUS_COLORS.witness} />
                      <Text style={styles.historicalLabel}>Recent Context</Text>
                    </View>
                    <View style={styles.emergenceWords}>
                      {block.historicalEmergence.recentWords.slice(0, compact ? 2 : 3).map((word, wordIndex) => (
                        <View key={`recent-${wordIndex}`} style={[styles.emergenceWord, styles.historicalWord]}>
                          <Text style={styles.historicalWordText}>{word}</Text>
                        </View>
                      ))}
                      {block.historicalEmergence.recentWords.length > (compact ? 2 : 3) && (
                        <View style={[styles.emergenceWord, styles.historicalWord]}>
                          <Text style={styles.historicalWordText}>+{block.historicalEmergence.recentWords.length - (compact ? 2 : 3)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Evolution Pattern */}
                {block.historicalEmergence.evolutionPattern && block.historicalEmergence.evolutionPattern.length > 0 && (
                  <View style={styles.historicalSubsection}>
                    <View style={styles.historicalHeader}>
                      <TrendingUp size={10} color={LIMNUS_COLORS.transcendent} />
                      <Text style={styles.historicalLabel}>Evolution</Text>
                    </View>
                    <View style={styles.emergenceWords}>
                      {block.historicalEmergence.evolutionPattern.slice(0, compact ? 2 : 3).map((word, wordIndex) => (
                        <View key={`evolution-${wordIndex}`} style={[styles.emergenceWord, styles.evolutionWord]}>
                          <Text style={styles.evolutionWordText}>{word}</Text>
                        </View>
                      ))}
                      {block.historicalEmergence.evolutionPattern.length > (compact ? 2 : 3) && (
                        <View style={[styles.emergenceWord, styles.evolutionWord]}>
                          <Text style={styles.evolutionWordText}>+{block.historicalEmergence.evolutionPattern.length - (compact ? 2 : 3)}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.blockDetails}>
              <View style={styles.blockDetail}>
                <Zap size={10} color={LIMNUS_COLORS.witness} />
                <Text style={styles.blockDetailText}>
                  Depth: {block.spiralDepth} | {block.spiralNode}
                </Text>
              </View>
              
              {block.breathAlignment && (
                <View style={styles.blockDetail}>
                  <Text style={styles.blockDetailText}>
                    Breath: {(block.breathAlignment * 100).toFixed(0)}%
                  </Text>
                </View>
              )}
              
              {block.sessionSignatures && (
                <View style={styles.blockDetail}>
                  <Text style={styles.blockDetailText}>
                    Sigs: {block.sessionSignatures.length}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.activeDot} />
          <Text style={styles.activeText}>Recording consciousness signatures...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.spiral + '20'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent,
    flex: 1
  },
  countBadge: {
    backgroundColor: LIMNUS_COLORS.spiral + '30',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center'
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: LIMNUS_COLORS.spiral
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20
  },
  emptyText: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    lineHeight: 20
  },
  blocksList: {
    maxHeight: 320
  },
  compactBlocksList: {
    maxHeight: 200
  },
  blockItem: {
    backgroundColor: LIMNUS_COLORS.void + '80',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.spiral + '15'
  },
  latestBlock: {
    borderColor: LIMNUS_COLORS.spiral + '40',
    backgroundColor: LIMNUS_COLORS.void + 'CC'
  },
  blockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8
  },
  blockInfo: {
    flex: 1
  },
  blockTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  blockTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: LIMNUS_COLORS.transcendent
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.success + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2
  },
  validationText: {
    fontSize: 8,
    color: Colors.dark.success,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  blockMetaRow: {
    flexDirection: 'row',
    gap: 12
  },
  blockMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  blockTime: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness
  },
  blockHash: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: LIMNUS_COLORS.spiral
  },
  blockMetrics: {
    alignItems: 'flex-end'
  },
  blockScore: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.success,
    marginBottom: 2
  },
  blockGlyphs: {
    fontSize: 14,
    color: LIMNUS_COLORS.transcendent
  },
  emergenceSection: {
    marginVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LIMNUS_COLORS.spiral + '20'
  },
  emergenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6
  },
  emergenceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: LIMNUS_COLORS.spiral,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emergenceWords: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  emergenceWord: {
    backgroundColor: LIMNUS_COLORS.spiral + '25',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  emergenceWordText: {
    fontSize: 10,
    color: LIMNUS_COLORS.spiral,
    fontWeight: '600'
  },
  emergencePhrase: {
    backgroundColor: LIMNUS_COLORS.transcendent + '25',
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.transcendent + '40'
  },
  historicalSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: LIMNUS_COLORS.witness + '15'
  },
  historicalSubsection: {
    marginBottom: 6
  },
  historicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4
  },
  historicalLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: LIMNUS_COLORS.witness,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  historicalWord: {
    backgroundColor: LIMNUS_COLORS.witness + '20',
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.witness + '30'
  },
  historicalWordText: {
    fontSize: 9,
    color: LIMNUS_COLORS.witness,
    fontWeight: '500'
  },
  evolutionWord: {
    backgroundColor: LIMNUS_COLORS.transcendent + '20',
    borderWidth: 1,
    borderColor: LIMNUS_COLORS.transcendent + '30'
  },
  evolutionWordText: {
    fontSize: 9,
    color: LIMNUS_COLORS.transcendent,
    fontWeight: '500'
  },
  blockDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4
  },
  blockDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  blockDetailText: {
    fontSize: 10,
    color: LIMNUS_COLORS.witness
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: LIMNUS_COLORS.spiral + '20',
    gap: 6
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.success
  },
  activeText: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    fontStyle: 'italic'
  }
});