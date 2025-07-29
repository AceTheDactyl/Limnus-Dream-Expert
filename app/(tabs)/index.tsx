import React, { useState, useCallback, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  RefreshControl,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Brain, Zap, Activity, Sparkles, Moon, Sun, TrendingUp, BookOpen, Plus, ArrowRight, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useLimnusStore } from '@/store/limnusStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { InterpretationService } from '@/services/interpretationService';
import { getPersona } from '@/constants/personas';
import Colors, { DesignTokens } from '@/constants/colors';
import { LIMNUS_COLORS } from '@/constants/limnus';
import PersonaSelector from '@/components/PersonaSelector';
import DreamInput from '@/components/DreamInput';
import Button from '@/components/Button';

const { width } = Dimensions.get('window');

// Helper function to format time greeting
const getTimeGreeting = (hour: number) => {
  if (hour < 6) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { addDream, generateDreamSigil, dreams, getGroupedDreams } = useDreamStore();
  const { generateNeuralSigil, neuralSigils } = useNeuralSigilStore();
  const { 
    connectDreamToSession, 
    currentSession, 
    sessionHistory, 
    allBreathCycleLogs,
    startSpiralSession
  } = useLimnusStore();
  
  const {
    recordDreamOnBlockchain,
    validateBlocksWithDream,
    chainState
  } = useConsciousnessStore();
  
  const [dreamText, setDreamText] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<'orion' | 'limnus'>('limnus');
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [glowAnimation] = useState(new Animated.Value(0));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    // Subtle glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  const isNightTime = currentTime.getHours() >= 20 || currentTime.getHours() <= 6;
  const TimeIcon = isNightTime ? Moon : Sun;
  const timeGreeting = isNightTime ? 'Good evening' : 'Good day';

  
  const handleInterpret = async () => {
    if (!dreamText.trim()) {
      Alert.alert('Empty Dream', 'Please enter your dream before interpreting.');
      return;
    }
    
    setIsInterpreting(true);
    
    try {
      const persona = getPersona(selectedPersona);
      
      // Pass practice data for enhanced interpretation
      const result = await InterpretationService.interpretDream(
        dreamText.trim(), 
        persona, 
        sessionHistory, 
        chainState.blocks,
        [],
        allBreathCycleLogs
      );
      
      const newDream = {
        title: result.name,
        content: dreamText.trim(),
        persona: selectedPersona,
        interpretation: result.interpretation,
        dreamType: result.dreamType,
        symbols: [],
        lucidity: 0.5,
        emotionalIntensity: 0.5,
        // Legacy properties for compatibility
        name: result.name,
        text: dreamText.trim(),
        date: new Date().toISOString(),
        blockchainValidated: result.blockchainValidated || false,
        alignedBlocks: result.alignedBlocks || []
      };
      
      // Add dream to store
      const savedDream = await addDream(newDream);
      
      // Generate neural sigil for the dream
      try {
        const dreamSigilText = `${newDream.name} - ${newDream.text} - ${newDream.dreamType} - ${newDream.persona}`;
        await generateNeuralSigil(dreamSigilText, 'dream');
        await generateDreamSigil(savedDream.id);
      } catch (sigilError) {
        console.error('Failed to generate neural sigil:', sigilError);
      }
      
      // Record dream on blockchain
      try {
        console.log('Recording dream on blockchain:', newDream.name);
        const dreamBlock = await recordDreamOnBlockchain({
          id: savedDream.id,
          name: savedDream.title || savedDream.name,
          dreamType: savedDream.dreamType,
          interpretation: savedDream.interpretation,
          persona: savedDream.persona
        });
        
        console.log('Dream block created:', dreamBlock.id);
        
        // If there were aligned blocks from interpretation, validate them with this dream
        if (result.alignedBlocks && result.alignedBlocks.length > 0) {
          console.log('Validating aligned blocks with dream:', result.alignedBlocks);
          validateBlocksWithDream(result.alignedBlocks, savedDream.id);
        }
        
      } catch (blockchainError) {
        console.error('Failed to record dream on blockchain:', blockchainError);
        // Don't fail the whole process if blockchain recording fails
      }
      
      // Connect dream to current session if active
      if (currentSession) {
        connectDreamToSession(savedDream.id);
      }
      
      Alert.alert(
        'Dream Interpreted! ✨',
        `Your dream "${savedDream.title || savedDream.name}" has been interpreted and saved.

🎯 Dream Type: ${savedDream.dreamType}
🔮 Persona: ${selectedPersona}
🔗 Blockchain: Recorded as dream block
${currentSession ? '🌀 Connected to your practice session' : ''}
${result.alignedBlocks && result.alignedBlocks.length > 0 ? `🎯 Aligned with ${result.alignedBlocks.length} consciousness blocks` : ''}`,
        [{ text: 'Excellent!', style: 'default' }]
      );
      
      setDreamText('');
      
    } catch (error) {
      Alert.alert(
        'Interpretation Failed', 
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsInterpreting(false);
    }
  };

  const handleStartMeditation = () => {
    console.log('handleStartMeditation called');
    try {
      console.log('Starting spiral session...');
      // Start the spiral session
      startSpiralSession();
      console.log('Spiral session started, navigating to practice tab');
      // Navigate to the practice tab (spiral)
      router.push('/(tabs)/spiral');
      console.log('Navigation completed');
    } catch (error) {
      console.error('Error in handleStartMeditation:', error);
      Alert.alert('Error', 'Failed to start practice session. Please try again.');
    }
  };

  const handleViewActivePractice = () => {
    // Navigate to the active practice session
    router.push('/(tabs)/spiral');
  };
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);
  
  const isInterpretDisabled = !dreamText.trim() || isInterpreting;
  const isPracticeActive = !!currentSession;
  
  const recentDreams = dreams.slice(0, 3);
  const todaysDreams = dreams.filter(dream => {
    const dreamDate = new Date(dream.timestamp);
    const today = new Date();
    return dreamDate.toDateString() === today.toDateString();
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      <ScrollView 
        style={styles.scrollView}
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
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <View style={styles.headerContent}>
            <View>
              <View style={styles.timeSection}>
                <TimeIcon size={14} color={Colors.dark.accent} />
                <Text style={styles.timeText}>{timeGreeting}</Text>
              </View>
              <Text style={styles.headerTitle}>Dream Journal</Text>
              <Text style={styles.headerSubtitle}>
                {todaysDreams.length > 0 
                  ? `${todaysDreams.length} dream${todaysDreams.length > 1 ? 's' : ''} today`
                  : 'Ready to capture your dreams'
                }
              </Text>
            </View>
            
            <TouchableOpacity 
              style={styles.quickAddButton}
              onPress={() => setShowQuickAdd(!showQuickAdd)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={Colors.dark.gradientPrimary.length >= 2 ? Colors.dark.gradientPrimary as [string, string, ...string[]] : ['#6366f1', '#8b5cf6']}
                style={styles.quickAddGradient}
              >
                <Plus size={20} color={Colors.dark.background} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/journal')}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconContainer, { backgroundColor: Colors.dark.primary + '20' }]}>
                <BookOpen size={18} color={Colors.dark.primary} />
              </View>
              <Text style={styles.statNumber}>{dreams.length}</Text>
              <Text style={styles.statLabel}>Total Dreams</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/sigils')}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconContainer, { backgroundColor: Colors.dark.secondary + '20' }]}>
                <Sparkles size={18} color={Colors.dark.secondary} />
              </View>
              <Text style={styles.statNumber}>{neuralSigils.length}</Text>
              <Text style={styles.statLabel}>Neural Sigils</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => router.push('/(tabs)/spiral')}
              activeOpacity={0.7}
            >
              <View style={[styles.statIconContainer, { backgroundColor: Colors.dark.accent + '20' }]}>
                <Activity size={18} color={Colors.dark.accent} />
              </View>
              <Text style={styles.statNumber}>{sessionHistory.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.primaryAction}
            onPress={isPracticeActive ? handleViewActivePractice : handleStartMeditation}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isPracticeActive 
                ? ([Colors.dark.secondary, Colors.dark.secondaryLight].length >= 2 ? [Colors.dark.secondary, Colors.dark.secondaryLight] as [string, string, ...string[]] : ['#10b981', '#34d399'])
                : (Colors.dark.gradientPrimary.length >= 2 ? Colors.dark.gradientPrimary as [string, string, ...string[]] : ['#6366f1', '#8b5cf6'])
              }
              style={styles.primaryActionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.primaryActionContent}>
                <View style={styles.primaryActionIcon}>
                  {isPracticeActive ? (
                    <Activity size={22} color={Colors.dark.background} />
                  ) : (
                    <Zap size={22} color={Colors.dark.background} />
                  )}
                </View>
                <View style={styles.primaryActionText}>
                  <Text style={styles.primaryActionTitle}>
                    {isPracticeActive ? 'Continue Session' : 'Begin Practice'}
                  </Text>
                  <Text style={styles.primaryActionSubtitle}>
                    {isPracticeActive ? 'Active meditation in progress' : 'Start consciousness exploration'}
                  </Text>
                </View>
                <ArrowRight size={18} color={Colors.dark.background} style={{ opacity: 0.8 }} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Dream Entry */}
        {showQuickAdd && (
          <Animated.View style={styles.quickEntrySection}>
            <View style={styles.quickEntryCard}>
              <Text style={styles.quickEntryTitle}>Quick Dream Entry</Text>
              
              <DreamInput
                value={dreamText}
                onChangeText={setDreamText}
                placeholder="Describe your dream..."
              />
              
              <PersonaSelector
                selectedPersona={selectedPersona}
                onPersonaChange={setSelectedPersona}
              />
              
              <View style={styles.quickEntryActions}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowQuickAdd(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <Button
                  label={isInterpreting ? "Interpreting..." : "Interpret Dream"}
                  onPress={handleInterpret}
                  disabled={isInterpretDisabled}
                  isLoading={isInterpreting}
                  style={styles.interpretButton}
                  icon={<Brain size={18} color={Colors.dark.background} />}
                />
              </View>
            </View>
          </Animated.View>
        )}

        {/* Recent Dreams */}
        {recentDreams.length > 0 && (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Dreams</Text>
              <TouchableOpacity 
                onPress={() => router.push('/(tabs)/journal')}
                style={styles.seeAllButton}
              >
                <Text style={styles.seeAllText}>See All</Text>
                <ArrowRight size={14} color={Colors.dark.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.dreamsList}>
              {recentDreams.map((dream, index) => (
                <TouchableOpacity 
                  key={dream.id}
                  style={styles.dreamCard}
                  onPress={() => router.push(`/dream/${dream.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dreamCardContent}>
                    <View style={styles.dreamCardHeader}>
                      <Text style={styles.dreamTitle} numberOfLines={1}>
                        {dream.title || dream.name || 'Untitled Dream'}
                      </Text>
                      <Text style={styles.dreamTime}>
                        {new Date(dream.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                    
                    <Text style={styles.dreamPreview} numberOfLines={2}>
                      {dream.content || dream.text || 'No content available'}
                    </Text>
                    
                    <View style={styles.dreamCardFooter}>
                      <View style={styles.dreamTags}>
                        {dream.dreamType && (
                          <View style={styles.dreamTag}>
                            <Text style={styles.dreamTagText}>{dream.dreamType}</Text>
                          </View>
                        )}
                        {dream.persona && (
                          <View style={[styles.dreamTag, styles.personaTag]}>
                            <Text style={styles.dreamTagText}>{dream.persona}</Text>
                          </View>
                        )}
                      </View>
                      
                      {dream.neuralSigil && (
                        <View style={styles.sigilIndicator}>
                          <Sparkles size={12} color={Colors.dark.secondary} />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Practice Connection Indicator */}
        {currentSession && (
          <View style={styles.practiceConnection}>
            <View style={styles.practiceConnectionIcon}>
              <Activity size={14} color={Colors.dark.secondary} />
            </View>
            <Text style={styles.practiceConnectionText}>
              Practice session active - dreams will be connected to your unified practice
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
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
  contentContainer: {
    paddingHorizontal: DesignTokens.spacing.xl,
  },
  
  // Header
  header: {
    marginBottom: DesignTokens.spacing.xxxl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.sm,
  },
  timeText: {
    fontSize: DesignTokens.typography.sizes.sm,
    color: Colors.dark.textTertiary,
    fontWeight: DesignTokens.typography.weights.medium as any,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.sizes.xxxl,
    fontWeight: DesignTokens.typography.weights.black as any,
    color: Colors.dark.text,
    marginBottom: DesignTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.sizes.base,
    color: Colors.dark.textSecondary,
    lineHeight: DesignTokens.typography.lineHeights.normal * DesignTokens.typography.sizes.base,
  },
  quickAddButton: {
    borderRadius: DesignTokens.borderRadius.md,
    ...DesignTokens.shadows.md,
  },
  quickAddGradient: {
    width: 48,
    height: 48,
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Stats Section
  statsSection: {
    marginBottom: DesignTokens.spacing.xxxl,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: DesignTokens.borderRadius.lg,
    padding: DesignTokens.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...DesignTokens.shadows.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: DesignTokens.spacing.sm,
  },
  statNumber: {
    fontSize: DesignTokens.typography.sizes.xl,
    fontWeight: DesignTokens.typography.weights.extrabold as any,
    color: Colors.dark.text,
    marginBottom: DesignTokens.spacing.xs,
  },
  statLabel: {
    fontSize: DesignTokens.typography.sizes.xs,
    color: Colors.dark.textTertiary,
    fontWeight: DesignTokens.typography.weights.semibold as any,
    textAlign: 'center',
  },
  
  // Actions Section
  actionsSection: {
    marginBottom: DesignTokens.spacing.xxxl,
  },
  primaryAction: {
    borderRadius: DesignTokens.borderRadius.xl,
    ...DesignTokens.shadows.lg,
  },
  primaryActionGradient: {
    borderRadius: DesignTokens.borderRadius.xl,
    overflow: 'hidden',
  },
  primaryActionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingVertical: DesignTokens.spacing.lg,
    gap: DesignTokens.spacing.md,
  },
  primaryActionIcon: {
    width: 44,
    height: 44,
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: Colors.dark.background + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: DesignTokens.typography.sizes.lg,
    fontWeight: DesignTokens.typography.weights.bold as any,
    color: Colors.dark.background,
    marginBottom: 2,
  },
  primaryActionSubtitle: {
    fontSize: DesignTokens.typography.sizes.sm,
    color: Colors.dark.background,
    opacity: 0.8,
    fontWeight: DesignTokens.typography.weights.medium as any,
  },
  
  // Quick Entry
  quickEntrySection: {
    marginBottom: DesignTokens.spacing.xxxl,
  },
  quickEntryCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: DesignTokens.borderRadius.xl,
    padding: DesignTokens.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    ...DesignTokens.shadows.md,
  },
  quickEntryTitle: {
    fontSize: DesignTokens.typography.sizes.lg,
    fontWeight: DesignTokens.typography.weights.bold as any,
    color: Colors.dark.text,
    marginBottom: DesignTokens.spacing.lg,
  },
  quickEntryActions: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.md,
    marginTop: DesignTokens.spacing.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: DesignTokens.borderRadius.md,
    paddingVertical: DesignTokens.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: DesignTokens.typography.sizes.base,
    fontWeight: DesignTokens.typography.weights.semibold as any,
    color: Colors.dark.textSecondary,
  },
  interpretButton: {
    flex: 2,
  },
  
  // Recent Dreams
  recentSection: {
    marginBottom: DesignTokens.spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignTokens.spacing.lg,
  },
  sectionTitle: {
    fontSize: DesignTokens.typography.sizes.xl,
    fontWeight: DesignTokens.typography.weights.bold as any,
    color: Colors.dark.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
  },
  seeAllText: {
    fontSize: DesignTokens.typography.sizes.base,
    fontWeight: DesignTokens.typography.weights.semibold as any,
    color: Colors.dark.primary,
  },
  dreamsList: {
    gap: DesignTokens.spacing.md,
  },
  dreamCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: DesignTokens.borderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
  },
  dreamCardContent: {
    padding: DesignTokens.spacing.lg,
  },
  dreamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing.sm,
  },
  dreamTitle: {
    fontSize: DesignTokens.typography.sizes.md,
    fontWeight: DesignTokens.typography.weights.semibold as any,
    color: Colors.dark.text,
    flex: 1,
    marginRight: DesignTokens.spacing.sm,
  },
  dreamTime: {
    fontSize: DesignTokens.typography.sizes.xs,
    color: Colors.dark.textTertiary,
    fontWeight: DesignTokens.typography.weights.medium as any,
  },
  dreamPreview: {
    fontSize: DesignTokens.typography.sizes.sm,
    color: Colors.dark.textSecondary,
    lineHeight: DesignTokens.typography.lineHeights.relaxed * DesignTokens.typography.sizes.sm,
    marginBottom: DesignTokens.spacing.md,
  },
  dreamCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dreamTags: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.xs,
    flex: 1,
  },
  dreamTag: {
    backgroundColor: Colors.dark.primary + '20',
    paddingHorizontal: DesignTokens.spacing.sm,
    paddingVertical: DesignTokens.spacing.xs,
    borderRadius: DesignTokens.borderRadius.sm,
  },
  personaTag: {
    backgroundColor: Colors.dark.secondary + '20',
  },
  dreamTagText: {
    fontSize: DesignTokens.typography.sizes.xs,
    fontWeight: DesignTokens.typography.weights.semibold as any,
    color: Colors.dark.text,
    textTransform: 'capitalize',
  },
  sigilIndicator: {
    width: 24,
    height: 24,
    borderRadius: DesignTokens.borderRadius.full,
    backgroundColor: Colors.dark.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Practice Connection
  practiceConnection: {
    backgroundColor: Colors.dark.surface,
    padding: DesignTokens.spacing.lg,
    borderRadius: DesignTokens.borderRadius.lg,
    marginTop: DesignTokens.spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.secondary + '30',
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.md,
  },
  practiceConnectionIcon: {
    width: 28,
    height: 28,
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: Colors.dark.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceConnectionText: {
    color: Colors.dark.textSecondary,
    fontSize: DesignTokens.typography.sizes.sm,
    flex: 1,
    lineHeight: DesignTokens.typography.lineHeights.relaxed * DesignTokens.typography.sizes.sm,
  },
});