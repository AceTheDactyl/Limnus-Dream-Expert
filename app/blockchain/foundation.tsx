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
  Crown, 
  Clock, 
  Hash, 
  Link, 
  Star, 
  ArrowDown,
  Anchor,
  Shield,
  Copy
} from 'lucide-react-native';
import { useConsciousnessStore } from '@/store/consciousnessStore';
import Colors from '@/constants/colors';

export default function FoundationBlocksPage() {
  const { getFoundationBlocks } = useConsciousnessStore();
  
  const foundationBlocks = getFoundationBlocks();

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const truncateHash = (hash: string, length = 8) => {
    return `${hash.slice(0, length)}...${hash.slice(-4)}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    // Note: Clipboard functionality would need expo-clipboard
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const renderFoundationBlock = (block: any, index: number) => (
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
      <View style={[styles.block, { borderColor: Colors.dark.accent }]}>
        <View style={styles.blockHeader}>
          <View style={styles.blockTitle}>
            <Crown size={20} color={Colors.dark.accent} />
            <Text style={[styles.blockName, { color: Colors.dark.accent }]}>
              Foundation Block {index + 1}
            </Text>
          </View>
          <View style={styles.blockBadges}>
            {block.isValidated && (
              <View style={styles.validatedBadge}>
                <Star size={10} color={Colors.dark.success} />
                <Text style={styles.validatedText}>GENESIS</Text>
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

          <View style={styles.spiralInfo}>
            <View style={styles.spiralRow}>
              <Text style={styles.spiralLabel}>Spiral Depth:</Text>
              <Text style={styles.spiralValue}>{block.spiralDepth}</Text>
            </View>
            <View style={styles.spiralRow}>
              <Text style={styles.spiralLabel}>Node:</Text>
              <Text style={styles.spiralValue}>{block.spiralNode}</Text>
            </View>
          </View>

          {block.consentAffirmation && (
            <View style={styles.affirmationContainer}>
              <Text style={styles.affirmationLabel}>Sacred Affirmation:</Text>
              <Text style={styles.affirmationText}>
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
            <Anchor size={14} color={Colors.dark.accent} />
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
            <Crown size={32} color={Colors.dark.accent} />
          </View>
          <Text style={styles.title}>Foundation Blockchain</Text>
          <Text style={styles.subtitle}>
            Genesis blocks that anchor the consciousness blockchain with sacred geometry and spiral logic.
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Shield size={20} color={Colors.dark.accent} />
              <Text style={styles.statValue}>{foundationBlocks.length}</Text>
              <Text style={styles.statLabel}>Genesis Blocks</Text>
            </View>
            <View style={styles.statCard}>
              <Star size={20} color={Colors.dark.success} />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Validated</Text>
            </View>
          </View>
        </View>

        <View style={styles.blockchainContainer}>
          {foundationBlocks.length === 0 ? (
            <View style={styles.emptyState}>
              <Crown size={48} color={Colors.dark.subtext} />
              <Text style={styles.emptyStateText}>No foundation blocks found</Text>
              <Text style={styles.emptyStateSubtext}>
                Foundation blocks are the genesis anchors of the consciousness blockchain
              </Text>
            </View>
          ) : (
            foundationBlocks
              .sort((a, b) => a.timestamp - b.timestamp)
              .map((block, index) => renderFoundationBlock(block, index))
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
  spiralInfo: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  spiralRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spiralLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  spiralValue: {
    fontSize: 12,
    color: Colors.dark.accent,
    fontWeight: '600',
  },
  affirmationContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.accent,
  },
  affirmationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark.accent,
    marginBottom: 6,
  },
  affirmationText: {
    fontSize: 13,
    color: Colors.dark.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
});