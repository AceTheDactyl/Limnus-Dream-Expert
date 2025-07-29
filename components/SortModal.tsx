import React from 'react';
import { StyleSheet, Text, View, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { SortBy, useDreamStore } from '@/store/dreamStore';
import { sortOptions, getSortOption } from '@/constants/sortOptions';
import Colors from '@/constants/colors';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  currentSort?: any;
  onSort?: (newSort: any) => void;
}

export default function SortModal({ visible, onClose }: SortModalProps) {
  const insets = useSafeAreaInsets();
  const { sortBy, setSortBy } = useDreamStore();
  const currentSort = getSortOption(sortBy);
  
  const handleSortSelect = (option: SortBy) => {
    setSortBy(option);
    onClose();
  };

  // Group options for better organization
  const groupingOptions = sortOptions.filter(opt => ['type', 'persona'].includes(opt.id));
  const filterOptions = sortOptions.filter(opt => ['mnemonic', 'psychic', 'pre-echo', 'lucid', 'meta-lucid'].includes(opt.id));
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Sort & Filter Dreams</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={24} color={Colors.dark.text} />
            </Pressable>
          </View>
          <Text style={styles.subtitle}>
            Currently: {currentSort?.label}
          </Text>
        </View>
        
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Group Dreams</Text>
            {groupingOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.optionCard,
                  sortBy === option.id && styles.selectedOption
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionText}>
                      <Text style={[
                        styles.optionLabel,
                        sortBy === option.id && styles.selectedText
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {sortBy === option.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter by Dream Type</Text>
            {filterOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.optionCard,
                  sortBy === option.id && styles.selectedOption
                ]}
                onPress={() => handleSortSelect(option.id)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{option.icon}</Text>
                    <View style={styles.optionText}>
                      <Text style={[
                        styles.optionLabel,
                        sortBy === option.id && styles.selectedText
                      ]}>
                        {option.label}
                      </Text>
                      <Text style={styles.optionDescription}>
                        {option.description}
                      </Text>
                    </View>
                  </View>
                  {sortBy === option.id && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.subtext,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 16,
    paddingLeft: 4,
  },
  optionCard: {
    backgroundColor: Colors.dark.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: Colors.dark.primary,
    backgroundColor: Colors.dark.primary + '15',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  selectedText: {
    color: Colors.dark.primary,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.dark.subtext,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.dark.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});