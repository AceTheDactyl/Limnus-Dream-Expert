import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield, Link, Anchor, Brain, Hexagon, Zap } from 'lucide-react-native';
import { Dream } from '@/store/dreamStore';
import { getPersona } from '@/constants/personas';
import { getDreamType } from '@/constants/dreamTypes';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { NeuralSigilVisualization } from '@/components/NeuralSigilVisualization';
import Colors from '@/constants/colors';

interface DreamLogItemProps {
  dream: Dream;
  showGroupHeader?: boolean;
  groupTitle?: string;
  showSigilView?: boolean;
  onPress?: () => void;
}

export default function DreamLogItem({ dream, showGroupHeader, groupTitle, showSigilView = false, onPress }: DreamLogItemProps) {
  const router = useRouter();
  const { getDreamSigil, generateDreamSigil, findSimilarDreams } = useDreamStore();
  const { findSimilarBySigil } = useNeuralSigilStore();
  const [dreamSigil, setDreamSigil] = useState<any>(getDreamSigil(dream.id));
  const [similarDreams, setSimilarDreams] = useState<{ dream: Dream; similarity: number }[]>([]);
  const [isGeneratingSigil, setIsGeneratingSigil] = useState(false);
  
  const persona = getPersona((dream.persona as 'orion' | 'limnus') || 'orion');
  const dreamType = getDreamType(dream.dreamType || '');
  
  useEffect(() => {
    const sigil = getDreamSigil(dream.id);
    setDreamSigil(sigil);
    
    if (sigil && showSigilView) {
      loadSimilarDreams();
    }
  }, [dream.id, showSigilView]);
  
  const loadSimilarDreams = async () => {
    try {
      const similar = await findSimilarDreams(dream.id, 0.7);
      setSimilarDreams(similar);
    } catch (error) {
      console.error('Error loading similar dreams:', error);
    }
  };
  
  const handleGenerateSigil = async () => {
    setIsGeneratingSigil(true);
    try {
      const sigil = await generateDreamSigil(dream.id);
      setDreamSigil(sigil);
      if (showSigilView) {
        await loadSimilarDreams();
      }
    } catch (error) {
      console.error('Error generating sigil:', error);
    } finally {
      setIsGeneratingSigil(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/dream/${dream.id}`);
    }
  };
  
  return (
    <View>
      {showGroupHeader && groupTitle && (
        <View style={styles.groupHeader}>
          <Text style={styles.groupTitle}>{groupTitle}</Text>
        </View>
      )}
      
      <Pressable style={styles.container} onPress={handlePress}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.dreamName}>{dream.name || dream.title || 'Untitled Dream'}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.personaBadge, { backgroundColor: persona.color + '33' }]}>
                <Text style={[styles.personaText, { color: persona.color }]}>
                  {persona.name}
                </Text>
              </View>
              {dreamType && (
                <View style={[styles.dreamTypeBadge, { backgroundColor: dreamType.color + '33' }]}>
                  <Text style={[styles.dreamTypeSymbol, { color: dreamType.color }]}>
                    {dreamType.symbol}
                  </Text>
                  <Text style={[styles.dreamTypeText, { color: dreamType.color }]}>
                    {dreamType.name}
                  </Text>
                </View>
              )}
              {/* Blockchain Badge - Always show for dreams since they auto-create blocks */}
              <View style={[styles.blockchainBadge, { backgroundColor: Colors.dark.accent + '33' }]}>
                <Anchor size={12} color={Colors.dark.accent} />
                <Text style={[styles.blockchainText, { color: Colors.dark.accent }]}>
                  Blockchain
                </Text>
              </View>
              {dream.blockchainValidated && (
                <View style={[styles.validationBadge, { backgroundColor: Colors.dark.success + '33' }]}>
                  <Shield size={12} color={Colors.dark.success} />
                  <Text style={[styles.validationText, { color: Colors.dark.success }]}>
                    Verified
                  </Text>
                </View>
              )}
              {dream.alignedBlocks && dream.alignedBlocks.length > 0 && (
                <View style={[styles.blocksBadge, { backgroundColor: Colors.dark.primary + '33' }]}>
                  <Link size={12} color={Colors.dark.primary} />
                  <Text style={[styles.blocksText, { color: Colors.dark.primary }]}>
                    {dream.alignedBlocks.length} Link{dream.alignedBlocks.length > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.date}>{formatDate(dream.date || new Date(dream.timestamp).toISOString())}</Text>
        </View>
        
        <Text style={styles.dreamText}>
          {truncateText(dream.text || dream.content || '')}
        </Text>
        
        <View style={styles.interpretationContainer}>
          <Text style={styles.interpretationLabel}>Interpretation:</Text>
          <Text style={styles.interpretationText}>
            {truncateText(dream.interpretation || 'No interpretation available', 150)}
          </Text>
        </View>
        
        {showSigilView && (
          <View style={styles.sigilSection}>
            {dreamSigil ? (
              <View>
                <NeuralSigilVisualization sigil={dreamSigil} />
                {similarDreams.length > 0 && (
                  <View style={styles.similarDreams}>
                    <Text style={styles.similarDreamsTitle}>
                      Similar Dreams ({similarDreams.length})
                    </Text>
                    {similarDreams.slice(0, 3).map(({ dream: similarDream, similarity }) => (
                      <View key={similarDream.id} style={styles.similarDreamItem}>
                        <Text style={styles.similarDreamName}>{similarDream.name}</Text>
                        <Text style={styles.similarDreamSimilarity}>
                          {(similarity * 100).toFixed(0)}% match
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.generateSigilButton}
                onPress={handleGenerateSigil}
                disabled={isGeneratingSigil}
              >
                <Zap size={16} color={Colors.dark.background} />
                <Text style={styles.generateSigilText}>
                  {isGeneratingSigil ? 'Generating...' : 'Generate Neural Sigil'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.lengthIndicator}>
              {(dream.text || dream.content || '').length} characters
            </Text>
            {dreamSigil && (
              <View style={styles.sigilIndicator}>
                <Hexagon size={10} color={Colors.dark.primary} />
                <Text style={styles.sigilIndicatorText}>Neural Sigil</Text>
              </View>
            )}
          </View>
          <View style={styles.footerRight}>
            <View style={styles.blockchainIndicator}>
              <Brain size={12} color={Colors.dark.accent} />
              <Text style={styles.blockchainIndicatorText}>
                Dream Block Created
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  groupHeader: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginTop: 8,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  dreamName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 10,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  personaBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  personaText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dreamTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dreamTypeSymbol: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 6,
  },
  dreamTypeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  blockchainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  blockchainText: {
    fontSize: 11,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
    textAlign: 'right',
    fontWeight: '500',
  },
  dreamText: {
    fontSize: 15,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  interpretationContainer: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  interpretationLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  interpretationText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 20,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  lengthIndicator: {
    fontSize: 12,
    color: Colors.dark.subtext,
    opacity: 0.7,
  },
  blockchainIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dark.accent + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  blockchainIndicatorText: {
    fontSize: 10,
    color: Colors.dark.accent,
    fontWeight: '600',
  },
  sigilSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  generateSigilButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  generateSigilText: {
    fontSize: 14,
    color: Colors.dark.background,
    fontWeight: '600',
  },
  similarDreams: {
    marginTop: 12,
    padding: 12,
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
  },
  similarDreamsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  similarDreamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  similarDreamName: {
    fontSize: 12,
    color: Colors.dark.text,
    flex: 1,
  },
  similarDreamSimilarity: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  sigilIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.dark.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  sigilIndicatorText: {
    fontSize: 9,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  validationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  validationText: {
    fontSize: 11,
    fontWeight: '600',
  },
  blocksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  blocksText: {
    fontSize: 11,
    fontWeight: '600',
  },
});