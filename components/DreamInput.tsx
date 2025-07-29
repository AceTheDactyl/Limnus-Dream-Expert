import React from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';
import Colors from '@/constants/colors';

interface DreamInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function DreamInput({ 
  value, 
  onChangeText, 
  placeholder = "Describe your dream in detail..." 
}: DreamInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Your Dream</Text>
      <TextInput
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.dark.subtext}
        multiline
        textAlignVertical="top"
        scrollEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textInput: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    color: Colors.dark.text,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 140,
    maxHeight: 220,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
});