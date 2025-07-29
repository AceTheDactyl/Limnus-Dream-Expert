import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Share, Platform, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Share2, Trash2, Copy, Hexagon, Zap, TrendingUp, Brain, Network } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Colors from '@/constants/colors';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { getPersona } from '@/constants/personas';
import { getDreamType } from '@/constants/dreamTypes';
import { NeuralSigilVisualization } from '@/components/NeuralSigilVisualization';
import Button from '@/components/Button';

export default function DreamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { getDream, deleteDream, getDreamSigil, generateDreamSigil, findSimilarDreams } = useDreamStore();
  const { findSimilarBySigil, braidConsciousnessStates } = useNeuralSigilStore();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [dreamSigil, setDreamSigil] = useState<any>(id ? getDreamSigil(id) : null);
  const [similarDreams, setSimilarDreams] = useState<{ dream: any; similarity: number }[]>([]);
  const [isGeneratingSigil, setIsGeneratingSigil] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [patternAnalysis, setPatternAnalysis] = useState<any>(null);
  const [showSigilView, setShowSigilView] = useState(false);
  
  const dream = id ? getDream(id) : null;
  
  useEffect(() => {
    if (id) {
      loadDreamData();
    }
  }, [id]);
  
  const loadDreamData = async () => {
    if (!id) return;
    const sigil = getDreamSigil(id);
    setDreamSigil(sigil);
    
    if (sigil) {
      await loadSimilarDreams();
      await loadPatternAnalysis();
    }
  };
  
  const loadSimilarDreams = async () => {
    if (!id) return;
    try {
      const similar = await findSimilarDreams(id, 0.6);
      setSimilarDreams(similar);
    } catch (error) {
      console.error('Error loading similar dreams:', error);
    }
  };
  
  const loadPatternAnalysis = async () => {
    if (!id) return;
    const sigil = getDreamSigil(id);
    if (!sigil) return;
    
    try {
      const similar = await findSimilarBySigil(sigil.id, 0.5);
      setPatternAnalysis({
        totalMatches: similar.length,
        averageSimilarity: similar.reduce((sum, s) => sum + s.similarity, 0) / similar.length || 0,
        strongMatches: similar.filter(s => s.similarity > 0.8).length
      });
    } catch (error) {
      console.error('Error loading pattern analysis:', error);
    }
  };
  
  const handleGenerateSigil = async () => {
    if (!id) return;
    setIsGeneratingSigil(true);
    try {
      const sigil = await generateDreamSigil(id);
      setDreamSigil(sigil);
      await loadSimilarDreams();
      await loadPatternAnalysis();
    } catch (error) {
      console.error('Error generating sigil:', error);
      Alert.alert('Error', 'Failed to generate neural sigil');
    } finally {
      setIsGeneratingSigil(false);
    }
  };
  
  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadDreamData();
    setRefreshing(false);
  }, [id]);
  
  if (!dream) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Dream not found</Text>
        <Button
          label="Go Back"
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        />
      </View>
    );
  }
  
  const persona = getPersona((dream?.persona as 'orion' | 'limnus') || 'orion');
  const dreamType = getDreamType(dream?.dreamType || '');
  
  const formatDate = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getShareContent = () => {
    if (!dream) return '';
    return `${dream.title || dream.name}

My Dream (${dreamType?.name || 'Unknown Type'}):

${dream.content || dream.text}

${persona.name}'s Interpretation:

${dream.interpretation}

Interpreted on ${formatDate(dream.timestamp || (typeof dream.date === 'string' ? new Date(dream.date).getTime() : dream.date) || Date.now())}`;
  };
  
  const handleShare = async () => {
    const shareContent = getShareContent();
    
    try {
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && 
            navigator.share && 
            typeof navigator.canShare === 'function') {
          try {
            const shareData = { title: dream?.title || dream?.name || 'Dream', text: shareContent };
            if (navigator.canShare(shareData)) {
              await navigator.share(shareData);
              return;
            }
          } catch (shareError) {
            console.log('Navigator share failed, falling back to clipboard');
          }
        }
        await handleCopyToClipboard();
      } else {
        await Share.share({
          title: dream?.title || dream?.name || 'Dream',
          message: shareContent,
        });
      }
    } catch (error: any) {
      console.error('Share error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
        if (Platform.OS === 'web') {
          await handleCopyToClipboard();
        } else {
          Alert.alert(
            'Share Not Available',
            'Would you like to copy the interpretation to your clipboard instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Copy', onPress: handleCopyToClipboard }
            ]
          );
        }
      } else {
        await handleCopyToClipboard();
      }
    }
  };
  
  const handleCopyToClipboard = async () => {
    try {
      const shareContent = getShareContent();
      
      if (Platform.OS === 'web') {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(shareContent);
            alert('Dream interpretation copied to clipboard!');
            return;
          } catch (clipboardError) {
            console.log('Modern clipboard API failed, trying expo-clipboard');
          }
        }
        
        try {
          await Clipboard.setStringAsync(shareContent);
          alert('Dream interpretation copied to clipboard!');
        } catch (expoError) {
          console.error('All clipboard methods failed:', expoError);
          alert('Unable to copy to clipboard. Please select and copy the text manually.');
        }
      } else {
        await Clipboard.setStringAsync(shareContent);
        Alert.alert('Copied!', 'Dream interpretation copied to clipboard');
      }
    } catch (error) {
      console.error('Clipboard error:', error);
      if (Platform.OS === 'web') {
        alert('Failed to copy to clipboard');
      } else {
        Alert.alert('Error', 'Failed to copy to clipboard');
      }
    }
  };
  
  const handleDelete = () => {
    if (!id) return;
    if (showDeleteConfirm) {
      deleteDream(id);
      router.back();
    } else {
      setShowDeleteConfirm(true);
    }
  };
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + 20 }
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
          colors={[Colors.dark.primary]}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.dreamTitle}>{dream?.title || dream?.name}</Text>
          <TouchableOpacity
            style={styles.sigilToggle}
            onPress={() => setShowSigilView(!showSigilView)}
          >
            <Hexagon size={20} color={showSigilView ? Colors.dark.background : Colors.dark.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.metaContainer}>
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
            {dreamSigil && (
              <View style={styles.sigilBadge}>
                <Hexagon size={12} color={Colors.dark.primary} />
                <Text style={styles.sigilBadgeText}>Neural Sigil</Text>
              </View>
            )}
          </View>
          <Text style={styles.date}>{formatDate(dream?.timestamp || (typeof dream?.date === 'string' ? new Date(dream.date).getTime() : dream?.date) || Date.now())}</Text>
        </View>
      </View>
      
      {dreamType && (
        <View style={styles.dreamTypeInfoContainer}>
          <Text style={styles.dreamTypeInfoTitle}>Dream Classification</Text>
          <View style={styles.dreamTypeInfoGrid}>
            <View style={styles.dreamTypeInfoItem}>
              <Text style={styles.dreamTypeInfoLabel}>Time Index:</Text>
              <Text style={styles.dreamTypeInfoValue}>{dreamType.timeIndex}</Text>
            </View>
            <View style={styles.dreamTypeInfoItem}>
              <Text style={styles.dreamTypeInfoLabel}>Function:</Text>
              <Text style={styles.dreamTypeInfoValue}>{dreamType.primaryFunction}</Text>
            </View>
            <View style={styles.dreamTypeInfoItem}>
              <Text style={styles.dreamTypeInfoLabel}>Symbolic Field:</Text>
              <Text style={styles.dreamTypeInfoValue}>{dreamType.symbolicField}</Text>
            </View>
            <View style={styles.dreamTypeInfoItem}>
              <Text style={styles.dreamTypeInfoLabel}>Phenomena:</Text>
              <Text style={styles.dreamTypeInfoValue}>{dreamType.typicalPhenomena}</Text>
            </View>
          </View>
        </View>
      )}
      
      <View style={styles.dreamContainer}>
        <Text style={styles.sectionTitle}>Your Dream</Text>
        <Text style={styles.dreamText}>{dream?.content || dream?.text}</Text>
      </View>
      
      <View style={styles.interpretationContainer}>
        <Text style={styles.sectionTitle}>
          {persona.name}'s Interpretation
        </Text>
        <Text style={styles.interpretationText}>{dream?.interpretation}</Text>
      </View>
      
      {/* Neural Sigil Section */}
      {showSigilView && (
        <View style={styles.sigilSection}>
          <View style={styles.sigilHeader}>
            <Hexagon size={20} color={Colors.dark.primary} />
            <Text style={styles.sectionTitle}>Neural Sigil Analysis</Text>
          </View>
          
          {dreamSigil ? (
            <View>
              <NeuralSigilVisualization sigil={dreamSigil} />
              
              {patternAnalysis && (
                <View style={styles.patternAnalysis}>
                  <Text style={styles.analysisTitle}>Pattern Analysis</Text>
                  <View style={styles.analysisGrid}>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisNumber}>{patternAnalysis.totalMatches}</Text>
                      <Text style={styles.analysisLabel}>Total Matches</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisNumber}>{patternAnalysis.strongMatches}</Text>
                      <Text style={styles.analysisLabel}>Strong Matches</Text>
                    </View>
                    <View style={styles.analysisItem}>
                      <Text style={styles.analysisNumber}>
                        {(patternAnalysis.averageSimilarity * 100).toFixed(0)}%
                      </Text>
                      <Text style={styles.analysisLabel}>Avg Similarity</Text>
                    </View>
                  </View>
                </View>
              )}
              
              {similarDreams.length > 0 && (
                <View style={styles.similarDreamsSection}>
                  <Text style={styles.analysisTitle}>Similar Dreams</Text>
                  {similarDreams.slice(0, 5).map((item) => {
                    const similarDream = item.dream || item; // Handle both formats
                    const similarity = item.similarity || 0.5;
                    return (
                    <TouchableOpacity
                      key={similarDream.id}
                      style={styles.similarDreamCard}
                      onPress={() => router.push(`/dream/${similarDream.id}`)}
                    >
                      <View style={styles.similarDreamContent}>
                        <Text style={styles.similarDreamName}>{similarDream.name}</Text>
                        <Text style={styles.similarDreamType}>{similarDream.dreamType}</Text>
                      </View>
                      <View style={styles.similarityBadge}>
                        <Text style={styles.similarityText}>
                          {(similarity * 100).toFixed(0)}%
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                  })}
                </View>
              )}
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.generateSigilButton}
              onPress={handleGenerateSigil}
              disabled={isGeneratingSigil}
            >
              <Zap size={20} color={Colors.dark.background} />
              <Text style={styles.generateSigilText}>
                {isGeneratingSigil ? 'Generating Neural Sigil...' : 'Generate Neural Sigil'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      <View style={styles.actionsContainer}>
        <Button
          label="Share Interpretation"
          onPress={handleShare}
          variant="outline"
          style={styles.shareButton}
          icon={<Share2 size={20} color={Colors.dark.primary} style={{ marginRight: 8 }} />}
        />
        
        <Pressable 
          style={styles.copyButton}
          onPress={handleCopyToClipboard}
        >
          <Copy size={20} color={Colors.dark.subtext} />
        </Pressable>
        
        <Pressable 
          style={[styles.deleteButton, showDeleteConfirm && styles.deleteConfirmButton]} 
          onPress={handleDelete}
        >
          <Trash2 size={24} color={showDeleteConfirm ? Colors.dark.error : Colors.dark.subtext} />
        </Pressable>
      </View>
      
      {showDeleteConfirm && (
        <Text style={styles.deleteConfirmText}>
          Tap the delete button again to confirm
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dreamTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
    lineHeight: 30,
    flex: 1,
    marginRight: 16,
  },
  sigilToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  badgeContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  personaBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  personaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dreamTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  dreamTypeSymbol: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  dreamTypeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sigilBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: Colors.dark.primary + '20',
    gap: 6,
  },
  sigilBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  date: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginLeft: 16,
    textAlign: 'right',
  },
  dreamTypeInfoContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  dreamTypeInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  dreamTypeInfoGrid: {
    gap: 8,
  },
  dreamTypeInfoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dreamTypeInfoLabel: {
    fontSize: 14,
    color: Colors.dark.subtext,
    flex: 1,
  },
  dreamTypeInfoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 2,
    textAlign: 'right',
  },
  dreamContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  interpretationContainer: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sigilSection: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sigilHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  dreamText: {
    fontSize: 16,
    color: Colors.dark.text,
    lineHeight: 24,
  },
  interpretationText: {
    fontSize: 16,
    color: Colors.dark.text,
    lineHeight: 24,
  },
  generateSigilButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
  },
  generateSigilText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.background,
  },
  patternAnalysis: {
    marginTop: 16,
    padding: 16,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  analysisGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  analysisItem: {
    alignItems: 'center',
  },
  analysisNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  analysisLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textAlign: 'center',
  },
  similarDreamsSection: {
    marginTop: 16,
  },
  similarDreamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  similarDreamContent: {
    flex: 1,
  },
  similarDreamName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  similarDreamType: {
    fontSize: 12,
    color: Colors.dark.subtext,
  },
  similarityBadge: {
    backgroundColor: Colors.dark.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  similarityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  shareButton: {
    flex: 1,
    marginRight: 12,
  },
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deleteButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteConfirmButton: {
    backgroundColor: Colors.dark.error + '33',
  },
  deleteConfirmText: {
    color: Colors.dark.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: Colors.dark.text,
    textAlign: 'center',
  },
});