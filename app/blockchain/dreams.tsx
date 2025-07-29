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
  Brain, 
  Clock, 
  Hash, 
  Link, 
  Star, 
  ArrowDown,
  Anchor,
  Copy,
  Sparkles,
  Eye
} from 'lucide-react-native';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';

export default function DreamBlocksPage() {
  const { getDreamBlocks } = useConsciousnessStore();
  
  const dreamBlocks = getDreamBlocks();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const getDreamTypeColor = (dreamType: string) => {
    switch (dreamType) {
      case 'meta-lucid': return Colors.dark.primary;
      case 'lucid': return '#9333ea';
      case 'psychic': return '#ec4899';
      case 'pre-echo': return '#f59e0b';
      case 'mnemonic': return '#10b981';
      default: return Colors.dark.subtext;
    }
  };

  const getDreamTypeIcon = (dreamType: string) => {
    switch (dreamType) {
      case 'meta-lucid': return <Sparkles size={16} color={getDreamTypeColor(dreamType)} />;
      case 'lucid': return <Eye size={16} color={getDreamTypeColor(dreamType)} />;
      case 'psychic': return <Brain size={16} color={getDreamTypeColor(dreamType)} />;
      default: return <Brain size={16} color={getDreamTypeColor(dreamType)} />;
    }
  };

  const renderDreamBlock = (block: any, index: number) => (
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
      <View style={[styles.block, { borderColor: Colors.dark.primary }]}>
        <View style={styles.blockHeader}>
          <View style={styles.blockTitle}>
            <Brain size={20} color={Colors.dark.primary} />
            <View style={styles.blockTitleText}>
              <Text style={[styles.blockName, { color: Colors.dark.primary }]}>
                {block.dreamName || `Dream Block ${index + 1}`}
              </Text>
              {block.dreamType && (
                <View style={styles.dreamTypeContainer}>
                  {getDreamTypeIcon(block.dreamType)}
                  <Text style={[styles.dreamType, { color: getDreamTypeColor(block.dreamType) }]}>
                    {block.dreamType.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
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

          {block.dreamId && (
            <View style={styles.dreamInfo}>
              <Text style={styles.dreamInfoLabel}>Dream Integration:</Text>
              <Text style={styles.dreamInfoValue}>ID: {block.dreamId.slice(0, 12)}...</Text>
            </View>
          )}

          {block.consentAffirmation && (
            <View style={styles.affirmationContainer}>
              <Text style={styles.affirmationLabel}>Dream Consent:</Text>
              <Text style={styles.affirmationText} numberOfLines={3}>
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
            <Anchor size={14} color={Colors.dark.primary} />
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
            <Brain size={32} color={Colors.dark.primary} />
          </View>
          <Text style={styles.title}>Dream Blockchain</Text>
          <Text style={styles.subtitle}>
            Blocks automatically created from dream interpretations, preserving symbolic essence and oneiric wisdom.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Brain size={20} color={Colors.dark.primary} />
              <Text style={styles.statValue}>{dreamBlocks.length}</Text>
              <Text style={styles.statLabel}>Dream Blocks</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color={Colors.dark.success} />
              <Text style={styles.statValue}>
                {dreamBlocks.filter(block => block.isValidated).length}
              </Text>
              <Text style={styles.statLabel}>Validated</Text>
            </View>
          </View>
        </View>

        <View style={styles.blockchainContainer}>
          {dreamBlocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Brain size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateText}>No dream blocks found</Text>
              <Text style={styles.emptyStateSubtext}>
                Dream blocks are created automatically when dreams are interpreted and anchored on the blockchain
              </Text>
            </View>
          ) : (
            dreamBlocks
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((block, index) => renderDreamBlock(block, index))
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
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  blockTitleText: {
    flex: 1,
  },
  blockName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  dreamTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dreamType: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
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
  dreamInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.primary,
  },
  dreamInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginBottom: 4,
  },
  dreamInfoValue: {
    fontSize: 12,
    color: Colors.dark.text,
    fontFamily: 'monospace',
  },
  affirmationContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.primary,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginBottom: 6,
  },
  affirmationText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});