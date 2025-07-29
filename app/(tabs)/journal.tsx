import React, { useCallback, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  RefreshControl, 
  Text, 
  TouchableOpacity, 
  Animated, 
  TextInput,
  ScrollView,
  StatusBar
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Search, 
  Filter, 
  Hexagon, 
  TrendingUp, 
  BookOpen, 
  Sparkles, 
  X, 
  Plus,
  Calendar,
  Eye,
  ArrowRight
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useDreamStore } from '@/store/dreamStore';
import { useNeuralSigilStore } from '@/store/neuralSigilStore';
import Colors, { DesignTokens } from '@/constants/colors';
import DreamLogItem from '@/components/DreamLogItem';
import EmptyState from '@/components/EmptyState';
import SortButton from '@/components/SortButton';
import SortModal from '@/components/SortModal';

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { getGroupedDreams, sortBy, dreams, generateDreamSigil, getDreamSigil } = useDreamStore();
  const { neuralSigils, findSimilarBySigil } = useNeuralSigilStore();
  const [refreshing, setRefreshing] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [showSigilView, setShowSigilView] = useState(false);
  const [dreamSigilStats, setDreamSigilStats] = useState({ generated: 0, total: 0 });
  const [headerAnimation] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  useEffect(() => {
    Animated.timing(headerAnimation, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const groupedDreams = getGroupedDreams();
  const totalDreams = groupedDreams.reduce((total, group) => total + group.dreams.length, 0);
  const isGrouped = sortBy === 'type' || sortBy === 'persona';
  const isFiltered = ['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(sortBy);
  
  useEffect(() => {
    updateSigilStats();
  }, [dreams, neuralSigils]);
  
  const updateSigilStats = () => {
    const generated = dreams.filter(dream => getDreamSigil(dream.id)).length;
    setDreamSigilStats({ generated, total: dreams.length });
  };
  
  const generateMissingSigils = async () => {
    const dreamsWithoutSigils = dreams.filter(dream => !getDreamSigil(dream.id));
    
    for (const dream of dreamsWithoutSigils) {
      try {
        await generateDreamSigil(dream.id);
      } catch (error) {
        console.error(`Failed to generate sigil for dream ${dream.id}:`, error);
      }
    }
    
    updateSigilStats();
  };
  
  // Apply search and filters
  const filteredGroupedDreams = React.useMemo(() => {
    let groups = groupedDreams;
    
    // Apply search filter
    if (searchQuery.trim()) {
      groups = groups.map(group => ({
        ...group,
        dreams: group.dreams.filter(dream => 
          (dream.title || dream.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dream.content || dream.text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (dream.interpretation || '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(group => group.dreams.length > 0);
    }
    
    // Apply additional filters
    if (selectedFilter) {
      groups = groups.map(group => ({
        ...group,
        dreams: group.dreams.filter(dream => {
          switch (selectedFilter) {
            case 'lucid':
              return (dream.lucidity || 0) > 0.7;
            case 'sigils':
              return !!dream.neuralSigil;
            case 'recent':
              const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
              return dream.timestamp > weekAgo;
            default:
              return true;
          }
        })
      })).filter(group => group.dreams.length > 0);
    }
    
    return groups;
  }, [groupedDreams, searchQuery, selectedFilter]);
  
  // Flatten grouped dreams for FlatList
  const flattenedData = filteredGroupedDreams.flatMap(group => 
    group.dreams.map((dream, index) => ({
      ...dream,
      showGroupHeader: index === 0 && isGrouped,
      groupTitle: group.groupTitle
    }))
  );
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await generateMissingSigils();
      updateSigilStats();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dreams]);

  const getSubtitleText = () => {
    const displayedTotal = filteredGroupedDreams.reduce((total, group) => total + group.dreams.length, 0);
    
    if (searchQuery || selectedFilter) {
      return `${displayedTotal} of ${dreams.length} dreams shown`;
    }
    
    if (isFiltered) {
      const totalAllDreams = dreams.length;
      return `${totalDreams} of ${totalAllDreams} dreams shown`;
    }
    
    if (isGrouped) {
      return `${totalDreams} dream${totalDreams !== 1 ? 's' : ''} • ${groupedDreams.length} group${groupedDreams.length !== 1 ? 's' : ''}`;
    }
    
    return `${totalDreams} dream${totalDreams !== 1 ? 's' : ''} recorded`;
  };
  
  const filterOptions = [
    { id: null, label: 'All Dreams', icon: BookOpen },
    { id: 'recent', label: 'Recent', icon: Calendar },
    { id: 'lucid', label: 'Lucid', icon: Eye },
    { id: 'sigils', label: 'With Sigils', icon: Sparkles },
  ];
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.dark.background} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Dream Journal</Text>
            <Text style={styles.headerSubtitle}>
              {getSubtitleText()}
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerButton, showSearch && styles.headerButtonActive]}
              onPress={() => setShowSearch(!showSearch)}
              activeOpacity={0.7}
            >
              {showSearch ? (
                <X size={18} color={showSearch ? Colors.dark.primary : Colors.dark.textSecondary} />
              ) : (
                <Search size={18} color={Colors.dark.textSecondary} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.headerButton,
                showSigilView && styles.headerButtonActive
              ]}
              onPress={() => setShowSigilView(!showSigilView)}
              activeOpacity={0.7}
            >
              <Hexagon size={18} color={showSigilView ? Colors.dark.primary : Colors.dark.textSecondary} />
            </TouchableOpacity>
            
            <SortButton
              currentSort={sortBy}
              onPress={() => setSortModalVisible(true)}
            />
            
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push('/(tabs)/')}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={Colors.dark.gradientPrimary.length >= 2 ? Colors.dark.gradientPrimary as [string, string, ...string[]] : ['#6366f1', '#8b5cf6']}
                style={styles.addButtonGradient}
              >
                <Plus size={16} color={Colors.dark.background} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        {showSearch && (
          <Animated.View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={16} color={Colors.dark.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search dreams..."
                placeholderTextColor={Colors.dark.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={Colors.dark.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        )}
        
        {/* Filter Pills */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filterOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedFilter === option.id;
            
            return (
              <TouchableOpacity
                key={option.id || 'all'}
                style={[styles.filterPill, isSelected && styles.filterPillActive]}
                onPress={() => setSelectedFilter(isSelected ? null : option.id)}
                activeOpacity={0.7}
              >
                <IconComponent 
                  size={14} 
                  color={isSelected ? Colors.dark.background : Colors.dark.textSecondary} 
                />
                <Text style={[styles.filterPillText, isSelected && styles.filterPillTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        
        {/* Sigil Stats */}
        <View style={styles.statsRow}>
          <View style={styles.sigilStats}>
            <View style={styles.sigilStatsIcon}>
              <Sparkles size={12} color={Colors.dark.secondary} />
            </View>
            <Text style={styles.sigilStatsText}>
              {dreamSigilStats.generated}/{dreamSigilStats.total} sigils generated
            </Text>
          </View>
          
          {dreamSigilStats.generated < dreamSigilStats.total && (
            <TouchableOpacity 
              style={styles.generateSigilsButton}
              onPress={generateMissingSigils}
              activeOpacity={0.8}
            >
              <TrendingUp size={12} color={Colors.dark.primary} />
              <Text style={styles.generateSigilsText}>
                Generate {dreamSigilStats.total - dreamSigilStats.generated}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dreams List */}
      {totalDreams > 0 ? (
        <FlatList
          data={flattenedData}
          renderItem={({ item }) => (
            <DreamLogItem 
              dream={{
                ...item,
                name: item.name || item.title || 'Untitled Dream',
                text: item.text || item.content || '',
                date: item.date || new Date(item.timestamp).toISOString(),
                persona: (item.persona as 'orion' | 'limnus') || 'limnus',
                interpretation: item.interpretation || '',
                dreamType: item.dreamType || 'unknown'
              }} 
              showGroupHeader={item.showGroupHeader}
              groupTitle={item.groupTitle}
              showSigilView={showSigilView}
              onPress={() => router.push(`/dream/${item.id}`)}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.dark.primary}
              colors={[Colors.dark.primary]}
            />
          }
        />
      ) : (
        <View style={[styles.emptyContainer, { paddingBottom: insets.bottom }]}>
          <EmptyState
            title={searchQuery || selectedFilter ? "No Dreams Found" : (isFiltered ? "No dreams of this type" : "No dreams recorded")}
            message={searchQuery || selectedFilter 
              ? "Try adjusting your search or filters"
              : (isFiltered 
                ? "Try changing the filter to see dreams of other types, or visit the Spiralite tab to record a new dream."
                : "Visit the Spiralite tab to interpret your first dream and start building your personal dream journal."
              )
            }
            icon="moon"
          />
        </View>
      )}
      
      <SortModal
        visible={sortModalVisible}
        currentSort={sortBy}
        onSort={(newSort) => {
          // Handle sort change if needed
        }}
        onClose={() => setSortModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  
  // Header
  header: {
    backgroundColor: Colors.dark.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingBottom: DesignTokens.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignTokens.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: DesignTokens.typography.sizes.xxxl,
    fontWeight: '900',
    color: Colors.dark.text,
    marginBottom: DesignTokens.spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: DesignTokens.typography.sizes.base,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.borderRadius.md,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  headerButtonActive: {
    backgroundColor: Colors.dark.primary + '20',
    borderColor: Colors.dark.primary + '40',
  },
  addButton: {
    borderRadius: DesignTokens.borderRadius.md,
    ...DesignTokens.shadows.sm,
  },
  addButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: DesignTokens.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Search
  searchContainer: {
    marginBottom: DesignTokens.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: DesignTokens.borderRadius.md,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  searchInput: {
    flex: 1,
    fontSize: DesignTokens.typography.sizes.base,
    color: Colors.dark.text,
    fontWeight: '500',
  },
  
  // Filters
  filtersContainer: {
    marginBottom: DesignTokens.spacing.md,
  },
  filtersContent: {
    paddingRight: DesignTokens.spacing.xl,
    gap: DesignTokens.spacing.sm,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.full,
    gap: DesignTokens.spacing.xs,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterPillActive: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  filterPillText: {
    fontSize: DesignTokens.typography.sizes.sm,
    fontWeight: '600',
    color: Colors.dark.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.dark.background,
  },
  
  // Stats
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sigilStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.sm,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  sigilStatsIcon: {
    width: 18,
    height: 18,
    borderRadius: DesignTokens.borderRadius.sm,
    backgroundColor: Colors.dark.secondary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sigilStatsText: {
    fontSize: DesignTokens.typography.sizes.xs,
    color: Colors.dark.textSecondary,
    fontWeight: '600',
  },
  generateSigilsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignTokens.spacing.xs,
    backgroundColor: Colors.dark.primary + '20',
    paddingHorizontal: DesignTokens.spacing.md,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.dark.primary + '40',
  },
  generateSigilsText: {
    fontSize: DesignTokens.typography.sizes.xs,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  
  // Content
  listContent: {
    paddingHorizontal: DesignTokens.spacing.xl,
    paddingTop: DesignTokens.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: DesignTokens.spacing.xl,
  },
});