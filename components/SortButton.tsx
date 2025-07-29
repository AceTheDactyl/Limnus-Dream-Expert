import React from 'react';
import { StyleSheet, Text, Pressable } from 'react-native';
import { ArrowUpDown } from 'lucide-react-native';
import { useDreamStore } from '@/store/dreamStore';
import { getSortOption } from '@/constants/sortOptions';
import Colors from '@/constants/colors';

interface SortButtonProps {
  onPress: () => void;
  currentSort?: any;
}

export default function SortButton({ onPress }: SortButtonProps) {
  const { sortBy } = useDreamStore();
  const currentSort = getSortOption(sortBy);
  
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <ArrowUpDown size={18} color={Colors.dark.primary} />
      <Text style={styles.text}>
        {currentSort?.label || 'Sort'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.primary,
    marginLeft: 6,
  },
});