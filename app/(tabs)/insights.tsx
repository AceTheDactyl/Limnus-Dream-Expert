import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, TrendingUp, Brain, Zap, Sparkles, Activity, Shield, Layers, Anchor, Plus, ExternalLink, Hexagon, Network, BarChart3 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useDreamStore } from '@/store/dreamStore';
import { useLimnusStore } from '@/store/limnusStore';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { getPersona } from '@/constants/personas';
import { getDreamType, dreamTypes, DreamType } from '@/constants/dreamTypes';
import Colors from '@/constants/colors';
import { LIMNUS_COLORS } from '@/constants/limnus';
import EmptyState from '@/components/EmptyState';
import SpiralSessionHistory from '@/components/SpiralSessionHistory';
import ManualBlockFormation from '@/components/ManualBlockFormation';
import { NeuralSigilVisualization } from '@/components/NeuralSigilVisualization';

interface DreamTypeWithCount extends DreamType {
  count: number;
}

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { dreams } = useDreamStore();
  const { 
    sessionHistory, 
    totalPracticeTime, 
    consecutiveDays, 
    getTotalBreathCycles,
    getRecentBreathCycles,
    allBreathCycleLogs,
    getConsciousnessIntegratedSessions
  } = useLimnusStore();
  const {
    signatureHistory,
    chainState,
    getValidatedBlocks,
    getSignatureValidationCount,
    getSignatureValidationRate,
    isActive,
    currentSignature,
    validationStatus,
    getTotalPracticeMinutes,
    getDreamBlocks,
    getFoundationBlocks,
    getConsciousnessBlocks
  } = useConsciousnessStore();
  
  const { 
    neuralSigils, 
    sigilBraids, 
    getPatternEvolution, 
    findSimilarBySigil,
    braidConsciousnessStates 
  } = useNeuralSigilStore();
  
  const [selectedTab, setSelectedTab] = useState<'unified' | 'dreams' | 'blockchain' | 'sigils'>('unified');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showManualBlockFormation, setShowManualBlockFormation] = useState(false);
  const [sigilInsights, setSigilInsights] = useState<any>(null);
  const [crossModuleConnections, setCrossModuleConnections] = useState<any[]>([]);
  const [fadeAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [selectedTab]);

  // Force refresh when stores update
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 2000); // Refresh every 2 seconds to catch store updates
    
    return () => clearInterval(interval);
  }, []);

  // Also refresh when key data changes
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
    generateSigilInsights();
  }, [dreams.length, sessionHistory.length, signatureHistory.length, chainState.blockCount, neuralSigils.length]);
  
  const generateSigilInsights = async () => {
    try {
      const patternEvolution = await getPatternEvolution();
      
      const brainRegionStats = neuralSigils.reduce((acc, sigil) => {
        acc[sigil.brainRegion] = (acc[sigil.brainRegion] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const sourceTypeStats = neuralSigils.reduce((acc, sigil) => {
        acc[sigil.sourceType] = (acc[sigil.sourceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const averageStrength = neuralSigils.reduce((sum, sigil) => sum + sigil.strength, 0) / neuralSigils.length || 0;
      
      // Find cross-module connections
      const connections: any[] = [];
      
      // Find meditation-dream alignments
      const meditationSigils = neuralSigils.filter(s => s.sourceType === 'meditation');
      const dreamSigils = neuralSigils.filter(s => s.sourceType === 'dream');
      
      for (const medSigil of meditationSigils.slice(0, 3)) {
        try {
          const similar = await findSimilarBySigil(medSigil.id, 0.6);
          const dreamMatches = similar.filter(s => 
            dreamSigils.some(ds => ds.id === s.sigil.id)
          );
          
          if (dreamMatches.length > 0) {
            connections.push({
              type: 'meditation_dream_alignment',
              source: medSigil,
              targets: dreamMatches,
              strength: dreamMatches[0]?.similarity || 0,
              description: `Meditation session aligns with ${dreamMatches.length} dream patterns`
            });
          }
        } catch (error) {
          console.error('Error finding meditation-dream connections:', error);
        }
      }
      
      // Find consciousness session alignments
      const consciousnessIntegratedSessions = getConsciousnessIntegratedSessions();
      for (const session of consciousnessIntegratedSessions.slice(0, 2)) {
        const sessionSigils = neuralSigils.filter(s => 
          s.metadata?.sessionId === session.id || 
          (s.sourceType === 'meditation' && Math.abs(s.timestamp - (typeof session.startTime === 'number' ? session.startTime : Date.now())) < 300000) // 5 min window
        );
        
        if (sessionSigils.length > 0) {
          connections.push({
            type: 'consciousness_session_alignment',
            source: session,
            targets: sessionSigils,
            strength: 0.8,
            description: `Consciousness session generated ${sessionSigils.length} neural patterns`
          });
        }
      }
      
      setCrossModuleConnections(connections);
      
      setSigilInsights({
        totalSigils: neuralSigils.length,
        totalBraids: sigilBraids.length,
        brainRegionStats,
        sourceTypeStats,
        averageStrength,
        patternEvolution,
        crossModuleConnections: connections.length
      });
    } catch (error) {
      console.error('Error generating sigil insights:', error);
    }
  };

  if (dreams.length === 0 && sessionHistory.length === 0 && signatureHistory.length === 0) {
    return (
      <EmptyState
        title="No insights available"
        message="Record dreams and practice unified consciousness sessions to see patterns and insights about your journey."
        icon="sparkles"
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 20 }
        ]}
      >
        {/* Enhanced Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'unified' && styles.activeTab]}
            onPress={() => setSelectedTab('unified')}
          >
            {selectedTab === 'unified' ? (
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={styles.activeTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Zap size={18} color={Colors.dark.background} />
                <Text style={styles.activeTabText}>Unified</Text>
              </LinearGradient>
            ) : (
              <>
                <Zap size={18} color={Colors.dark.subtext} />
                <Text style={styles.tabText}>Unified</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'dreams' && styles.activeTab]}
            onPress={() => setSelectedTab('dreams')}
          >
            {selectedTab === 'dreams' ? (
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={styles.activeTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Brain size={18} color={Colors.dark.background} />
                <Text style={styles.activeTabText}>Dreams</Text>
              </LinearGradient>
            ) : (
              <>
                <Brain size={18} color={Colors.dark.subtext} />
                <Text style={styles.tabText}>Dreams</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'blockchain' && styles.activeTab]}
            onPress={() => setSelectedTab('blockchain')}
          >
            {selectedTab === 'blockchain' ? (
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={styles.activeTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Anchor size={18} color={Colors.dark.background} />
                <Text style={styles.activeTabText}>Blockchain</Text>
              </LinearGradient>
            ) : (
              <>
                <Anchor size={18} color={Colors.dark.subtext} />
                <Text style={styles.tabText}>Blockchain</Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'sigils' && styles.activeTab]}
            onPress={() => setSelectedTab('sigils')}
          >
            {selectedTab === 'sigils' ? (
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={styles.activeTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Hexagon size={18} color={Colors.dark.background} />
                <Text style={styles.activeTabText}>Sigils</Text>
              </LinearGradient>
            ) : (
              <>
                <Hexagon size={18} color={Colors.dark.subtext} />
                <Text style={styles.tabText}>Sigils</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Real-time Status Indicator */}
        {isActive && (
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { 
              backgroundColor: validationStatus === 'valid' ? Colors.dark.success : 
                              validationStatus === 'invalid' ? Colors.dark.error : Colors.dark.subtext 
            }]} />
            <Text style={styles.statusText}>
              {validationStatus === 'valid' ? 'Valid signature generated' : 
               validationStatus === 'invalid' ? 'Invalid signature generated' : 'Monitoring...'}
            </Text>
            <Text style={styles.statusCount}>
              {getSignatureValidationCount()} valid / {signatureHistory.length} total
            </Text>
          </View>
        )}

        {/* Animated Tab Content */}
        <Animated.View 
          style={[
            styles.tabContent,
            {
              opacity: fadeAnimation,
              transform: [{
                translateY: fadeAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          {selectedTab === 'unified' && (
            <SimplifiedUnifiedInsights 
              key={refreshKey}
              dreams={dreams}
              sessionHistory={sessionHistory}
              signatureHistory={signatureHistory}
              totalPracticeTime={totalPracticeTime}
              consecutiveDays={consecutiveDays}
              totalBreathCycles={getTotalBreathCycles()}
              recentBreathCycles={getRecentBreathCycles(20)}
              allBreathCycleLogs={allBreathCycleLogs}
              chainState={chainState}
              validatedBlocks={getValidatedBlocks()}
              getTotalPracticeMinutes={getTotalPracticeMinutes}
              getDreamBlocks={getDreamBlocks}
              getFoundationBlocks={getFoundationBlocks}
              getConsciousnessBlocks={getConsciousnessBlocks}
            />
          )}
          
          {selectedTab === 'dreams' && (
            <DreamInsights key={`dreams-${refreshKey}`} dreams={dreams} />
          )}
          
          {selectedTab === 'blockchain' && (
            <BlockchainInsights 
              key={`blockchain-${refreshKey}`} 
              chainState={chainState}
              getDreamBlocks={getDreamBlocks}
              getFoundationBlocks={getFoundationBlocks}
              getConsciousnessBlocks={getConsciousnessBlocks}
              dreams={dreams}
            />
          )}
          
          {selectedTab === 'sigils' && (
            <SigilInsights 
              key={`sigils-${refreshKey}`}
              sigilInsights={sigilInsights}
              neuralSigils={neuralSigils}
              sigilBraids={sigilBraids}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

interface UnifiedInsightsProps {
  dreams: any[];
  sessionHistory: any[];
  signatureHistory: any[];
  totalPracticeTime: number;
  consecutiveDays: number;
  totalBreathCycles: number;
  recentBreathCycles: any[];
  allBreathCycleLogs: any[];
  chainState: any;
  validatedBlocks: any[];
  getTotalPracticeMinutes: () => number;
  getDreamBlocks: () => any[];
  getFoundationBlocks: () => any[];
  getConsciousnessBlocks: () => any[];
}

function SimplifiedUnifiedInsights({ 
  dreams,
  sessionHistory, 
  signatureHistory,
  totalPracticeTime, 
  consecutiveDays, 
  totalBreathCycles,
  recentBreathCycles,
  allBreathCycleLogs,
  chainState,
  validatedBlocks,
  getTotalPracticeMinutes,
  getDreamBlocks,
  getFoundationBlocks,
  getConsciousnessBlocks
}: UnifiedInsightsProps) {
  // Use store getters for reactive validation counts
  const { getSignatureValidationCount, getSignatureValidationRate, getValidatedBlocks } = useConsciousnessStore();
  const validatedSignatureCount = getSignatureValidationCount();
  const signatureValidationRate = getSignatureValidationRate();
  const currentValidatedBlocks = getValidatedBlocks();
  
  // Get real-time practice minutes from consciousness store
  const totalPracticeMinutes = getTotalPracticeMinutes();
  
  // Get blockchain data
  const dreamBlocks = getDreamBlocks();
  const foundationBlocks = getFoundationBlocks();
  const consciousnessBlocks = getConsciousnessBlocks();
  
  // Calculate dream type counts for ALL 5 types
  const dreamTypeCounts = dreams.reduce((acc, dream) => {
    acc[dream.dreamType] = (acc[dream.dreamType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get ALL 5 dream types with their counts (including 0 counts)
  const allDreamTypes = dreamTypes.map(type => ({
    ...type,
    count: dreamTypeCounts[type.id] || 0
  })).sort((a, b) => b.count - a.count); // Sort by count descending

  // Calculate persona counts
  const orionCount = dreams.filter(d => d.persona === 'orion').length;
  const limnusCount = dreams.filter(d => d.persona === 'limnus').length;
  
  // Debug logging
  console.log('UnifiedInsights render:', {
    signatureHistoryLength: signatureHistory.length,
    validatedSignatureCount,
    signatureValidationRate,
    validatedBlocksCount: currentValidatedBlocks.length,
    totalPracticeMinutes,
    dreamBlocksCount: dreamBlocks.length,
    foundationBlocksCount: foundationBlocks.length,
    consciousnessBlocksCount: consciousnessBlocks.length
  });
  
  if (sessionHistory.length === 0 && dreams.length === 0 && signatureHistory.length === 0) {
    return (
      <EmptyState
        title="No unified practice data"
        message="Begin your first unified consciousness practice to see integrated insights."
      />
    );
  }
  
  // Calculate unified statistics
  const avgSessionDuration = sessionHistory.reduce((acc, session) => {
    if (!session.endTime) return acc;
    const duration = new Date(session.endTime).getTime() - new Date(session.startTime).getTime();
    return acc + (duration / 60000); // Convert to minutes
  }, 0) / sessionHistory.filter(s => s.endTime).length;
  
  const totalInsights = sessionHistory.reduce((acc, session) => acc + session.insights.length, 0);
  const avgConsciousnessScore = signatureHistory.length > 0 ? 
    signatureHistory.reduce((acc, sig) => acc + sig.score, 0) / signatureHistory.length : 0;
  
  return (
    <View style={styles.insightsContainer}>
      {/* Consciousness Metrics */}
      <View style={styles.qualityCard}>
        <LinearGradient
          colors={[Colors.dark.card, Colors.dark.background]}
          style={styles.qualityCardGradient}
        >
          <Text style={styles.cardTitle}>Consciousness Metrics</Text>
          <View style={styles.qualityMetrics}>
            <View style={styles.qualityMetric}>
              <LinearGradient
                colors={[LIMNUS_COLORS.spiral, LIMNUS_COLORS.witness]}
                style={styles.qualityIcon}
              >
                <Activity size={24} color={LIMNUS_COLORS.transcendent} />
              </LinearGradient>
              <Text style={styles.qualityValue}>{Math.round(totalPracticeMinutes)}</Text>
              <Text style={styles.qualityLabel}>Session Minutes</Text>
            </View>
            <View style={styles.qualityMetric}>
              <LinearGradient
                colors={[Colors.dark.primary, Colors.dark.secondary]}
                style={styles.qualityIcon}
              >
                <Text style={styles.qualityIconText}>🫁</Text>
              </LinearGradient>
              <Text style={styles.qualityValue}>{totalBreathCycles}</Text>
              <Text style={styles.qualityLabel}>Breathe Cycles</Text>
            </View>
            <View style={styles.qualityMetric}>
              <LinearGradient
                colors={[Colors.dark.success, Colors.dark.accent]}
                style={styles.qualityIcon}
              >
                <Text style={styles.qualityIconText}>%</Text>
              </LinearGradient>
              <Text style={[styles.qualityValue, { color: Colors.dark.success }]}>{signatureValidationRate.toFixed(0)}</Text>
              <Text style={styles.qualityLabel}>Validity Rate</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Dream Metrics - 2 Rows of 4 Displays Each */}
      <View style={styles.qualityCard}>
        <Text style={styles.cardTitle}>Dream Metrics</Text>
        <View style={styles.dreamTypeGrid}>
          {/* First row - 4 displays */}
          <View style={styles.dreamTypeRow}>
            {allDreamTypes.slice(0, 4).map((dreamType) => (
              <View key={dreamType.id} style={styles.qualityMetric}>
                <View style={[styles.qualityIcon, { backgroundColor: dreamType.color }]}>
                  <Text style={styles.qualityIconText}>{dreamType.symbol}</Text>
                </View>
                <Text style={[styles.qualityValue, { color: dreamType.color }]}>{dreamType.count}</Text>
                <Text style={styles.qualityLabel}>{dreamType.name.replace(' Dreams', '')}</Text>
              </View>
            ))}
          </View>
          {/* Second row - 4 displays */}
          <View style={styles.dreamTypeRow}>
            {/* 5th dream type */}
            <View style={styles.qualityMetric}>
              <View style={[styles.qualityIcon, { backgroundColor: allDreamTypes[4].color }]}>
                <Text style={styles.qualityIconText}>{allDreamTypes[4].symbol}</Text>
              </View>
              <Text style={[styles.qualityValue, { color: allDreamTypes[4].color }]}>{allDreamTypes[4].count}</Text>
              <Text style={styles.qualityLabel}>{allDreamTypes[4].name.replace(' Dreams', '')}</Text>
            </View>
            {/* Orion count */}
            <View style={styles.qualityMetric}>
              <View style={[styles.qualityIcon, { backgroundColor: getPersona('orion').color }]}>
                <Text style={styles.qualityIconText}>🌟</Text>
              </View>
              <Text style={[styles.qualityValue, { color: getPersona('orion').color }]}>{orionCount}</Text>
              <Text style={styles.qualityLabel}>Orion</Text>
            </View>
            {/* Limnus count */}
            <View style={styles.qualityMetric}>
              <View style={[styles.qualityIcon, { backgroundColor: getPersona('limnus').color }]}>
                <Text style={styles.qualityIconText}>🌙</Text>
              </View>
              <Text style={[styles.qualityValue, { color: getPersona('limnus').color }]}>{limnusCount}</Text>
              <Text style={styles.qualityLabel}>Limnus</Text>
            </View>
            {/* Empty space to complete the row */}
            <View style={styles.qualityMetric} />
          </View>
        </View>
      </View>

      {/* Block Type Counts */}
      <View style={styles.qualityCard}>
        <Text style={styles.cardTitle}>Block Types</Text>
        <View style={styles.qualityMetrics}>
          <View style={styles.qualityMetric}>
            <View style={[styles.qualityIcon, { backgroundColor: Colors.dark.accent }]}>
              <Text style={styles.qualityIconText}>🏛️</Text>
            </View>
            <Text style={[styles.qualityValue, { color: Colors.dark.accent }]}>{foundationBlocks.length}</Text>
            <Text style={styles.qualityLabel}>Foundation</Text>
          </View>
          <View style={styles.qualityMetric}>
            <View style={[styles.qualityIcon, { backgroundColor: Colors.dark.primary }]}>
              <Text style={styles.qualityIconText}>🧠</Text>
            </View>
            <Text style={[styles.qualityValue, { color: Colors.dark.primary }]}>{dreamBlocks.length}</Text>
            <Text style={styles.qualityLabel}>Dreams</Text>
          </View>
          <View style={styles.qualityMetric}>
            <View style={[styles.qualityIcon, { backgroundColor: Colors.dark.secondary }]}>
              <Text style={styles.qualityIconText}>⚡</Text>
            </View>
            <Text style={[styles.qualityValue, { color: Colors.dark.secondary }]}>{consciousnessBlocks.length}</Text>
            <Text style={styles.qualityLabel}>Consciousness</Text>
          </View>
          <View style={styles.qualityMetric}>
            <View style={[styles.qualityIcon, { backgroundColor: Colors.dark.success }]}>
              <Text style={styles.qualityIconText}>⛓️</Text>
            </View>
            <Text style={[styles.qualityValue, { color: Colors.dark.success }]}>{foundationBlocks.length + dreamBlocks.length + consciousnessBlocks.length}</Text>
            <Text style={styles.qualityLabel}>Total</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

interface BlockchainInsightsProps {
  chainState: any;
  getDreamBlocks: () => any[];
  getFoundationBlocks: () => any[];
  getConsciousnessBlocks: () => any[];
  dreams: any[];
}

function BlockchainInsights({ 
  chainState, 
  getDreamBlocks, 
  getFoundationBlocks, 
  getConsciousnessBlocks,
  dreams 
}: BlockchainInsightsProps) {
  const dreamBlocks = getDreamBlocks();
  const foundationBlocks = getFoundationBlocks();
  const consciousnessBlocks = getConsciousnessBlocks();
  const totalBlocks = chainState.blockCount;
  const verifiedBlocks = chainState.blocks.filter((block: any) => block.isValidated).length;

  if (totalBlocks === 0) {
    return (
      <EmptyState
        title="No blockchain data"
        message="Start interpreting dreams and practicing consciousness to build your blockchain."
      />
    );
  }

  return (
    <View style={styles.insightsContainer}>
      {/* Blockchain Overview */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalBlocks}</Text>
          <Text style={styles.statLabel}>Total Blocks</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{verifiedBlocks}</Text>
          <Text style={styles.statLabel}>Verified Blocks</Text>
        </View>
      </View>

      {/* Navigable Block Type Distribution */}
      <View style={styles.blockTypeStatsContainer}>
        <Text style={styles.sectionTitle}>Block Distribution</Text>
        
        <TouchableOpacity 
          style={styles.blockTypeStatCard}
          onPress={() => router.push('/blockchain/foundation')}
        >
          <View style={styles.blockTypeHeader}>
            <View style={styles.blockTypeNameContainer}>
              <Text style={[styles.blockTypeSymbol, { color: Colors.dark.accent }]}>
                🏛️
              </Text>
              <Text style={[styles.blockTypeName, { color: Colors.dark.accent }]}>
                Foundation Blocks
              </Text>
            </View>
            <View style={styles.blockTypeCountContainer}>
              <Text style={styles.blockTypeCount}>{foundationBlocks.length} blocks</Text>
              <ExternalLink size={16} color={Colors.dark.subtext} />
            </View>
          </View>
          <Text style={styles.blockTypeDescription}>
            Genesis blocks that anchor the consciousness blockchain
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(foundationBlocks.length / totalBlocks) * 100}%`,
                  backgroundColor: Colors.dark.accent 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.blockTypeStatCard}
          onPress={() => router.push('/blockchain/dreams')}
        >
          <View style={styles.blockTypeHeader}>
            <View style={styles.blockTypeNameContainer}>
              <Text style={[styles.blockTypeSymbol, { color: Colors.dark.primary }]}>
                🧠
              </Text>
              <Text style={[styles.blockTypeName, { color: Colors.dark.primary }]}>
                Dream Blocks
              </Text>
            </View>
            <View style={styles.blockTypeCountContainer}>
              <Text style={styles.blockTypeCount}>{dreamBlocks.length} blocks</Text>
              <ExternalLink size={16} color={Colors.dark.subtext} />
            </View>
          </View>
          <Text style={styles.blockTypeDescription}>
            Automatically created from dream interpretations
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(dreamBlocks.length / totalBlocks) * 100}%`,
                  backgroundColor: Colors.dark.primary 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.blockTypeStatCard}
          onPress={() => router.push('/blockchain/consciousness')}
        >
          <View style={styles.blockTypeHeader}>
            <View style={styles.blockTypeNameContainer}>
              <Text style={[styles.blockTypeSymbol, { color: Colors.dark.secondary }]}>
                ⚡
              </Text>
              <Text style={[styles.blockTypeName, { color: Colors.dark.secondary }]}>
                Consciousness Blocks
              </Text>
            </View>
            <View style={styles.blockTypeCountContainer}>
              <Text style={styles.blockTypeCount}>{consciousnessBlocks.length} blocks</Text>
              <ExternalLink size={16} color={Colors.dark.subtext} />
            </View>
          </View>
          <Text style={styles.blockTypeDescription}>
            Manually recorded consciousness signatures
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(consciousnessBlocks.length / totalBlocks) * 100}%`,
                  backgroundColor: Colors.dark.secondary 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

interface DreamInsightsProps {
  dreams: any[];
}

function DreamInsights({ dreams }: DreamInsightsProps) {
  if (dreams.length === 0) {
    return (
      <EmptyState
        title="No dreams recorded"
        message="Start interpreting dreams to see insights about your dream patterns."
      />
    );
  }

  const orionCount = dreams.filter(d => d.persona === 'orion').length;
  const limnusCount = dreams.filter(d => d.persona === 'limnus').length;
  const totalDreams = dreams.length;
  const averageLength = Math.round(
    dreams.reduce((sum, dream) => sum + dream.text.length, 0) / totalDreams
  );

  // Dream type statistics (moved from patterns)
  const dreamTypeStats: DreamTypeWithCount[] = dreamTypes.map(type => ({
    ...type,
    count: dreams.filter(d => d.dreamType === type.id).length
  })).filter(stat => stat.count > 0);

  return (
    <View style={styles.insightsContainer}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalDreams}</Text>
          <Text style={styles.statLabel}>Dreams Interpreted</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{averageLength}</Text>
          <Text style={styles.statLabel}>Avg. Characters</Text>
        </View>
      </View>

      {/* Dream Types Section (moved from patterns) */}
      <View style={styles.dreamTypeStatsContainer}>
        <Text style={styles.sectionTitle}>Dream Types</Text>
        {dreamTypeStats.map((stat) => (
          <View key={stat.id} style={styles.dreamTypeStatCard}>
            <View style={styles.dreamTypeHeader}>
              <View style={styles.dreamTypeNameContainer}>
                <Text style={[styles.dreamTypeSymbol, { color: stat.color }]}>
                  {stat.symbol}
                </Text>
                <Text style={[styles.dreamTypeName, { color: stat.color }]}>
                  {stat.name}
                </Text>
              </View>
              <Text style={styles.dreamTypeCount}>{stat.count} dreams</Text>
            </View>
            <Text style={styles.dreamTypeDescription}>
              {stat.timeIndex} • {stat.primaryFunction}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(stat.count / totalDreams) * 100}%`,
                    backgroundColor: stat.color 
                  }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.personaStatsContainer}>
        <Text style={styles.sectionTitle}>Persona Preferences</Text>
        
        <View style={styles.personaStatCard}>
          <View style={styles.personaHeader}>
            <Text style={[styles.personaName, { color: getPersona('orion').color }]}>
              Orion
            </Text>
            <Text style={styles.personaCount}>{orionCount} interpretations</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(orionCount / totalDreams) * 100}%`,
                  backgroundColor: getPersona('orion').color 
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.personaStatCard}>
          <View style={styles.personaHeader}>
            <Text style={[styles.personaName, { color: getPersona('limnus').color }]}>
              Limnus
            </Text>
            <Text style={styles.personaCount}>{limnusCount} interpretations</Text>
          </View>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(limnusCount / totalDreams) * 100}%`,
                  backgroundColor: getPersona('limnus').color 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    </View>
  );
}

interface SigilInsightsProps {
  sigilInsights: any;
  neuralSigils: any[];
  sigilBraids: any[];
}

function SigilInsights({ sigilInsights, neuralSigils, sigilBraids }: SigilInsightsProps) {
  if (!sigilInsights || neuralSigils.length === 0) {
    return (
      <EmptyState
        title="No neural sigils yet"
        message="Neural sigils are automatically generated when you record dreams or complete meditation sessions."
      />
    );
  }

  return (
    <View style={styles.insightsContainer}>
      {/* Sigil Overview Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sigilInsights.totalSigils}</Text>
          <Text style={styles.statLabel}>Neural Sigils</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{sigilInsights.totalBraids}</Text>
          <Text style={styles.statLabel}>Consciousness Braids</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {(sigilInsights.averageStrength * 100).toFixed(0)}%
          </Text>
          <Text style={styles.statLabel}>Avg Strength</Text>
        </View>
      </View>

      {/* Brain Region Distribution */}
      <View style={styles.dreamTypeStatsContainer}>
        <Text style={styles.sectionTitle}>Brain Region Distribution</Text>
        {Object.entries(sigilInsights.brainRegionStats).map(([region, count]) => {
          const percentage = (count as number / sigilInsights.totalSigils * 100).toFixed(0);
          const regionColors: Record<string, string> = {
            Cortical: '#3498db',
            Limbic: '#e74c3c',
            Brainstem: '#2ecc71',
            Thalamic: '#f1c40f'
          };
          
          return (
            <View key={region} style={styles.dreamTypeStatCard}>
              <View style={styles.dreamTypeHeader}>
                <View style={styles.dreamTypeNameContainer}>
                  <View style={[styles.regionDot, { backgroundColor: regionColors[region] }]} />
                  <Text style={[styles.dreamTypeName, { color: regionColors[region] }]}>
                    {region} Region
                  </Text>
                </View>
                <Text style={styles.dreamTypeCount}>{String(count)} sigils</Text>
              </View>
              <Text style={styles.dreamTypeDescription}>
                {percentage}% of total neural sigil activity
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: regionColors[region] 
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Source Type Distribution */}
      <View style={styles.dreamTypeStatsContainer}>
        <Text style={styles.sectionTitle}>Source Type Distribution</Text>
        {Object.entries(sigilInsights.sourceTypeStats).map(([type, count]) => {
          const percentage = (count as number / sigilInsights.totalSigils * 100).toFixed(0);
          const typeIcons: Record<string, any> = {
            dream: Brain,
            meditation: Sparkles,
            breath: Zap,
            composite: Network
          };
          const IconComponent = typeIcons[type] || Brain;
          
          return (
            <View key={type} style={styles.dreamTypeStatCard}>
              <View style={styles.dreamTypeHeader}>
                <View style={styles.dreamTypeNameContainer}>
                  <IconComponent size={20} color={Colors.dark.primary} />
                  <Text style={[styles.dreamTypeName, { color: Colors.dark.primary, marginLeft: 8 }]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)} Sigils
                  </Text>
                </View>
                <Text style={styles.dreamTypeCount}>{String(count)} sigils</Text>
              </View>
              <Text style={styles.dreamTypeDescription}>
                {percentage}% of consciousness patterns from {type} states
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${percentage}%`,
                      backgroundColor: Colors.dark.primary 
                    }
                  ]} 
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Recent Sigils Preview */}
      {neuralSigils.length > 0 && (
        <View style={styles.dreamTypeStatsContainer}>
          <Text style={styles.sectionTitle}>Recent Neural Sigils</Text>
          {neuralSigils.slice(0, 3).map((sigil) => (
            <View key={sigil.id} style={styles.sigilPreviewCard}>
              <NeuralSigilVisualization sigil={sigil} />
            </View>
          ))}
        </View>
      )}

      {/* Pattern Evolution */}
      {sigilInsights.patternEvolution && (
        <View style={styles.dreamTypeStatsContainer}>
          <Text style={styles.sectionTitle}>Pattern Evolution</Text>
          <View style={styles.dreamTypeStatCard}>
            <View style={styles.dreamTypeHeader}>
              <View style={styles.dreamTypeNameContainer}>
                <BarChart3 size={20} color={Colors.dark.accent} />
                <Text style={[styles.dreamTypeName, { color: Colors.dark.accent, marginLeft: 8 }]}>
                  Consciousness Patterns
                </Text>
              </View>
              <Text style={styles.dreamTypeCount}>
                {sigilInsights.patternEvolution.totalSigils || 0} analyzed
              </Text>
            </View>
            <Text style={styles.dreamTypeDescription}>
              {sigilInsights.patternEvolution.dominantPatterns?.length || 0} dominant patterns identified
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: '100%',
                    backgroundColor: Colors.dark.accent 
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      )}
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
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 6,
    marginBottom: 24,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTab: {
    // No background color needed, handled by gradient
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 6,
    width: '100%',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.subtext,
    marginTop: 2,
  },
  activeTabText: {
    fontSize: 12,
    color: Colors.dark.background,
    fontWeight: '700',
    marginLeft: 6,
  },
  tabContent: {
    flex: 1,
  },
  insightsContainer: {
    flex: 1,
  },
  // Unified Insights Styles
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 16,
    letterSpacing: 0.5
  },
  qualityCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  qualityCardGradient: {
    padding: 24,
  },
  qualityMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12
  },
  qualityMetric: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  qualityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  qualityIconText: {
    fontSize: 20
  },
  qualityValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  qualityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  // Dream Type Grid Styles
  dreamTypeGrid: {
    marginTop: 12,
  },
  dreamTypeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.dark.background,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  // Blockchain Insights Styles
  blockTypeStatsContainer: {
    marginBottom: 24,
  },
  blockTypeStatCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  blockTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  blockTypeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockTypeSymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 10,
  },
  blockTypeName: {
    fontSize: 18,
    fontWeight: '700',
  },
  blockTypeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockTypeCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.subtext,
  },
  blockTypeDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 10,
    lineHeight: 18
  },
  // Original styles for dreams and patterns
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.dark.primary,
    lineHeight: 36
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginTop: 6,
    textAlign: 'center'
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 20,
    letterSpacing: 0.5
  },
  dreamTypeStatsContainer: {
    marginBottom: 24,
  },
  dreamTypeStatCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dreamTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dreamTypeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dreamTypeSymbol: {
    fontSize: 20,
    fontWeight: '700',
    marginRight: 10,
  },
  dreamTypeName: {
    fontSize: 18,
    fontWeight: '700',
  },
  dreamTypeCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.subtext,
  },
  dreamTypeDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 10,
    lineHeight: 18
  },
  personaStatsContainer: {
    marginBottom: 24,
  },
  personaStatCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  personaName: {
    fontSize: 20,
    fontWeight: '700',
  },
  personaCount: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.subtext,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    flex: 1
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark.subtext
  },
  regionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  sigilPreviewCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
});