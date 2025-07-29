import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  Text, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Animated,
  Dimensions,
  TextInput
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Hexagon, Brain, Zap, Network, TrendingUp, Sparkles, Activity, Search, Filter, Hash, Type } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import { useDreamStore } from '@/store/dreamStore';
import { NeuralSigilVisualization } from '@/components/NeuralSigilVisualization';
import { neuralSigils, getNeuralSigilByTernary, balancedTernaryToDecimal, decimalToBalancedTernary, validateTernaryCode, type NeuralSigilData } from '@/constants/neuralSigils';
import Colors from '@/constants/colors';
import EmptyState from '@/components/EmptyState';

const { width } = Dimensions.get('window');

type ViewMode = 'grid' | 'network' | 'patterns' | 'decoder' | 'search';

export default function SigilsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSigil, setSelectedSigil] = useState<string | undefined>();
  const [headerAnimation] = useState(new Animated.Value(0));
  
  // Decoder state
  const [ternaryInput, setTernaryInput] = useState('');
  const [decimalInput, setDecimalInput] = useState('');
  const [decodedSigil, setDecodedSigil] = useState<NeuralSigilData | undefined>();
  const [decoderError, setDecoderError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NeuralSigilData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const { 
    neuralSigils: generatedSigils, 
    sigilBraids, 
    findSimilarBySigil,
    braidConsciousnessStates,
    getPatternEvolution,
    searchNeuralSigils,
    generateFromNeuralSigilData,
    initializeNeuralSystem
  } = useNeuralSigilStore();
  
  const { dreams } = useDreamStore();
  
  const [patternStats, setPatternStats] = useState<any>(null);
  
  useEffect(() => {
    initializeNeuralSystem();
    loadPatternStats();
  }, []);
  
  useEffect(() => {
    loadPatternStats();
  }, [generatedSigils]);
  
  const loadPatternStats = async () => {
    try {
      const stats = await getPatternEvolution();
      setPatternStats(stats);
    } catch (error) {
      console.error('Error loading pattern stats:', error);
    }
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPatternStats().finally(() => setRefreshing(false));
  }, []);
  
  const handleSigilPress = async (sigilId: string) => {
    setSelectedSigil(sigilId);
    
    try {
      const similar = await findSimilarBySigil(sigilId, 0.6);
      if (similar.length > 0) {
        Alert.alert(
          'Pattern Matches Found',
          `Found ${similar.length} similar consciousness patterns with this sigil.`,
          [{ text: 'Interesting!', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error finding similar sigils:', error);
    }
  };
  
  const handleBraidCreation = async () => {
    if (generatedSigils.length < 2) {
      Alert.alert('Need More Sigils', 'At least 2 sigils are needed to create a consciousness braid.');
      return;
    }
    
    try {
      const recentSigils = generatedSigils.slice(0, 5).map(s => s.id);
      const braid = await braidConsciousnessStates(recentSigils);
      
      Alert.alert(
        'Consciousness Braid Created',
        `Created braid with ${braid.connections.length} connections and strength ${(braid.strength * 100).toFixed(0)}%`,
        [{ text: 'Amazing!', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create consciousness braid.');
    }
  };

  // Decoder functions
  const handleTernaryDecode = () => {
    setDecoderError(null);
    const validation = validateTernaryCode(ternaryInput);
    
    if (!validation.isValid) {
      setDecoderError(validation.error || 'Invalid ternary code');
      return;
    }
    
    const sigil = getNeuralSigilByTernary(ternaryInput);
    if (sigil) {
      setDecodedSigil(sigil);
      setDecimalInput(sigil.decimalValue.toString());
    } else {
      setDecoderError('No neural sigil found for this ternary code');
    }
  };

  const handleDecimalDecode = () => {
    setDecoderError(null);
    const decimal = parseInt(decimalInput);
    
    if (isNaN(decimal) || decimal < -121 || decimal > 121) {
      setDecoderError('Decimal must be between -121 and 121');
      return;
    }
    
    const ternaryCode = decimalToBalancedTernary(decimal);
    const sigil = getNeuralSigilByTernary(ternaryCode);
    
    if (sigil) {
      setDecodedSigil(sigil);
      setTernaryInput(ternaryCode);
    } else {
      setDecoderError('No neural sigil found for this decimal value');
    }
  };

  const handleGenerateFromDecoded = async () => {
    if (!decodedSigil) return;
    
    try {
      await generateFromNeuralSigilData(decodedSigil, 'consciousness');
      Alert.alert('Success', 'Neural sigil generated and added to your collection!');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate neural sigil');
    }
  };

  // Search functions
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const results = await searchNeuralSigils(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(handleSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const categories = ['brainstem', 'thalamic', 'basal-ganglia', 'limbic', 'cortical', 'memory', 'integration', 'cerebellar'];
  
  const renderViewModeSelector = () => (
    <View style={styles.viewModeSelector}>
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'grid' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('grid')}
      >
        <Hexagon size={16} color={viewMode === 'grid' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'grid' && styles.viewModeTextActive]}>
          Grid
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'decoder' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('decoder')}
      >
        <Hash size={16} color={viewMode === 'decoder' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'decoder' && styles.viewModeTextActive]}>
          Decoder
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'search' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('search')}
      >
        <Search size={16} color={viewMode === 'search' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'search' && styles.viewModeTextActive]}>
          Search
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.viewModeButton, viewMode === 'patterns' && styles.viewModeButtonActive]}
        onPress={() => setViewMode('patterns')}
      >
        <TrendingUp size={16} color={viewMode === 'patterns' ? Colors.dark.background : Colors.dark.subtext} />
        <Text style={[styles.viewModeText, viewMode === 'patterns' && styles.viewModeTextActive]}>
          Patterns
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderStatsHeader = () => (
    <Animated.View 
      style={[
        styles.statsHeader,
        {
          opacity: headerAnimation,
          transform: [{
            translateY: headerAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0],
            }),
          }],
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.dark.card, Colors.dark.background]}
        style={styles.statsGradient}
      >
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Hexagon size={20} color={Colors.dark.primary} />
          </View>
          <Text style={styles.statNumber}>{generatedSigils.length}</Text>
          <Text style={styles.statLabel}>Generated Sigils</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Brain size={20} color={Colors.dark.secondary} />
          </View>
          <Text style={styles.statNumber}>{neuralSigils.length}</Text>
          <Text style={styles.statLabel}>Neural Database</Text>
        </View>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <Network size={20} color={Colors.dark.accent} />
          </View>
          <Text style={styles.statNumber}>{sigilBraids.length}</Text>
          <Text style={styles.statLabel}>Consciousness Braids</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
  
  const renderGridView = () => (
    <ScrollView 
      style={styles.gridContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
          colors={[Colors.dark.primary]}
        />
      }
    >
      {generatedSigils.map((sigil) => (
        <TouchableOpacity
          key={sigil.id}
          onPress={() => handleSigilPress(sigil.id)}
          activeOpacity={0.8}
        >
          <NeuralSigilVisualization 
            sigil={sigil}
            showComparison={selectedSigil === sigil.id}
            showNeuralDetails={true}
          />
        </TouchableOpacity>
      ))}
      
      {generatedSigils.length > 1 && (
        <TouchableOpacity style={styles.braidButton} onPress={handleBraidCreation}>
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.secondary]}
            style={styles.braidButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Brain size={20} color={Colors.dark.background} />
            <Text style={styles.braidButtonText}>Create Consciousness Braid</Text>
            <Sparkles size={16} color={Colors.dark.background} style={{ opacity: 0.8 }} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderDecoderView = () => (
    <ScrollView style={styles.decoderContainer}>
      <View style={styles.decoderSection}>
        <Text style={styles.sectionTitle}>Ternary to Neural Sigil</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={ternaryInput}
            onChangeText={setTernaryInput}
            placeholder="Enter 5-digit ternary (e.g., TTTTT)"
            placeholderTextColor={Colors.dark.subtext}
            maxLength={5}
          />
          <TouchableOpacity style={styles.decodeButton} onPress={handleTernaryDecode}>
            <Type size={16} color={Colors.dark.background} />
            <Text style={styles.decodeButtonText}>Decode</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.decoderSection}>
        <Text style={styles.sectionTitle}>Decimal to Neural Sigil</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={decimalInput}
            onChangeText={setDecimalInput}
            placeholder="Enter decimal (-121 to 121)"
            placeholderTextColor={Colors.dark.subtext}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.decodeButton} onPress={handleDecimalDecode}>
            <Hash size={16} color={Colors.dark.background} />
            <Text style={styles.decodeButtonText}>Decode</Text>
          </TouchableOpacity>
        </View>
      </View>

      {decoderError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{decoderError}</Text>
        </View>
      )}

      {decodedSigil && (
        <View style={styles.decodedResult}>
          <View style={styles.decodedHeader}>
            <Text style={styles.decodedSymbol}>{decodedSigil.symbol}</Text>
            <View style={styles.decodedInfo}>
              <Text style={styles.decodedName}>{decodedSigil.name}</Text>
              <Text style={styles.decodedDescription}>{decodedSigil.description}</Text>
            </View>
          </View>
          
          <View style={styles.decodedDetails}>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Function: </Text>
              {decodedSigil.function}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Breath Phase: </Text>
              {decodedSigil.breathPhase}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.detailLabel}>Category: </Text>
              {decodedSigil.category}
            </Text>
            <Text style={styles.phraseText}>"{decodedSigil.phrase}"</Text>
          </View>

          <TouchableOpacity style={styles.generateButton} onPress={handleGenerateFromDecoded}>
            <LinearGradient
              colors={[Colors.dark.primary, Colors.dark.secondary]}
              style={styles.generateButtonGradient}
            >
              <Sparkles size={16} color={Colors.dark.background} />
              <Text style={styles.generateButtonText}>Generate Neural Sigil</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderSearchView = () => (
    <ScrollView style={styles.searchContainer}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search neural sigils..."
          placeholderTextColor={Colors.dark.subtext}
        />
      </View>

      <View style={styles.categoryFilter}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.categoryButton, !selectedCategory && styles.categoryButtonActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryButtonText, !selectedCategory && styles.categoryButtonTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.searchResults}>
        {(searchResults.length > 0 ? searchResults : neuralSigils)
          .filter(sigil => !selectedCategory || sigil.category === selectedCategory)
          .map(sigil => (
            <TouchableOpacity
              key={sigil.id}
              style={styles.searchResultItem}
              onPress={() => {
                setTernaryInput(sigil.ternaryCode);
                setDecimalInput(sigil.decimalValue.toString());
                setDecodedSigil(sigil);
                setViewMode('decoder');
              }}
            >
              <Text style={styles.resultSymbol}>{sigil.symbol}</Text>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>{sigil.name}</Text>
                <Text style={styles.resultDescription}>{sigil.description}</Text>
                <Text style={styles.resultTernary}>{sigil.ternaryCode} ({sigil.decimalValue})</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
  
  const renderPatternsView = () => (
    <ScrollView 
      style={styles.patternsContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.dark.primary}
          colors={[Colors.dark.primary]}
        />
      }
    >
      {patternStats && (
        <View style={styles.patternStats}>
          <Text style={styles.patternStatsTitle}>Pattern Evolution</Text>
          
          {patternStats.categoryDistribution && (
            <View style={styles.distributionSection}>
              <Text style={styles.distributionTitle}>Brain Region Distribution</Text>
              {Object.entries(patternStats.categoryDistribution).map(([category, count]) => (
                <View key={category} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{category}</Text>
                  <Text style={styles.distributionCount}>{String(count)}</Text>
                </View>
              ))}
            </View>
          )}

          {patternStats.breathPhaseDistribution && (
            <View style={styles.distributionSection}>
              <Text style={styles.distributionTitle}>Breath Phase Distribution</Text>
              {Object.entries(patternStats.breathPhaseDistribution).map(([phase, count]) => (
                <View key={phase} style={styles.distributionItem}>
                  <Text style={styles.distributionLabel}>{phase}</Text>
                  <Text style={styles.distributionCount}>{String(count)}</Text>
                </View>
              ))}
            </View>
          )}

          {patternStats.neuralInsights && (
            <View style={styles.insightsSection}>
              <Text style={styles.insightsTitle}>Neural Insights</Text>
              <Text style={styles.insightText}>
                Most Active Brain Region: {patternStats.neuralInsights.mostActiveBrainRegion}
              </Text>
              <Text style={styles.insightText}>
                Dominant Breath Phase: {patternStats.neuralInsights.dominantBreathPhase}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
  
  if (generatedSigils.length === 0 && viewMode === 'grid') {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        {renderStatsHeader()}
        {renderViewModeSelector()}
        <EmptyState
          title="No Neural Sigils Yet"
          message="Neural sigils are automatically generated when you record dreams or complete meditation sessions. You can also decode them from ternary codes or search the neural database."
          icon="activity"
          action={{
            label: "Explore Neural Database",
            onPress: () => setViewMode('search')
          }}
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-30, 0],
              }),
            }],
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.dark.primary + '20', 'transparent']}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitleRow}>
              <Activity size={28} color={Colors.dark.primary} />
              <Text style={styles.headerTitle}>Neural Sigils</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              Consciousness patterns mapped across neural dimensions
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
      
      {renderStatsHeader()}
      {renderViewModeSelector()}
      
      {viewMode === 'grid' && renderGridView()}
      {viewMode === 'decoder' && renderDecoderView()}
      {viewMode === 'search' && renderSearchView()}
      {viewMode === 'patterns' && renderPatternsView()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    marginHorizontal: -16,
    marginBottom: 8,
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsHeader: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statsGradient: {
    flexDirection: 'row',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.dark.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    textAlign: 'center',
    fontWeight: '500',
  },
  viewModeSelector: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.dark.primary,
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.subtext,
  },
  viewModeTextActive: {
    color: Colors.dark.background,
  },
  gridContainer: {
    flex: 1,
    padding: 16,
  },
  patternsContainer: {
    flex: 1,
    padding: 16,
  },
  decoderContainer: {
    flex: 1,
    padding: 16,
  },
  searchContainer: {
    flex: 1,
    padding: 16,
  },
  braidButton: {
    borderRadius: 16,
    marginTop: 16,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  braidButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 12,
  },
  braidButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.background,
    flex: 1,
    textAlign: 'center',
  },
  // Decoder styles
  decoderSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
  },
  decodeButton: {
    backgroundColor: Colors.dark.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  decodeButtonText: {
    color: Colors.dark.background,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: Colors.dark.error + '20',
    borderWidth: 1,
    borderColor: Colors.dark.error,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.dark.error,
    fontSize: 14,
  },
  decodedResult: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  decodedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  decodedSymbol: {
    fontSize: 32,
  },
  decodedInfo: {
    flex: 1,
  },
  decodedName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  decodedDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  decodedDetails: {
    marginBottom: 20,
  },
  detailText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '600',
    color: Colors.dark.text,
  },
  phraseText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.dark.primary,
    marginTop: 8,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  generateButtonText: {
    color: Colors.dark.background,
    fontWeight: '600',
    fontSize: 16,
  },
  // Search styles
  searchSection: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: Colors.dark.text,
    fontSize: 16,
  },
  categoryFilter: {
    marginBottom: 20,
  },
  categoryButton: {
    backgroundColor: Colors.dark.card,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  categoryButtonText: {
    color: Colors.dark.subtext,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: Colors.dark.background,
    fontWeight: '600',
  },
  searchResults: {
    gap: 12,
  },
  searchResultItem: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  resultSymbol: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
  resultTernary: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontFamily: 'monospace',
  },
  // Pattern styles
  patternStats: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  patternStatsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  distributionSection: {
    marginBottom: 20,
  },
  distributionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 12,
  },
  distributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  distributionLabel: {
    fontSize: 14,
    color: Colors.dark.text,
  },
  distributionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
  },
  insightsSection: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: Colors.dark.subtext,
    marginBottom: 4,
  },
});