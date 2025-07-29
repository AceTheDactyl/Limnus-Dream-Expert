import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { personas, getPersona } from '@/constants/personas';
import Colors from '@/constants/colors';

interface PersonaSelectorProps {
  selectedPersona: 'orion' | 'limnus';
  onPersonaChange: (persona: 'orion' | 'limnus') => void;
}

export default function PersonaSelector({ selectedPersona, onPersonaChange }: PersonaSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose Your Interpreter</Text>
      <View style={styles.selectorContainer}>
        {personas.map((persona) => (
          <Pressable
            key={persona.id}
            style={[
              styles.personaOption,
              selectedPersona === persona.id && styles.selectedOption,
              selectedPersona === persona.id && { borderColor: persona.color }
            ]}
            onPress={() => onPersonaChange(persona.id)}
          >
            <Text style={[
              styles.personaName,
              selectedPersona === persona.id && styles.selectedText
            ]}>
              {persona.name}
            </Text>
            <Text style={[
              styles.personaDescription,
              selectedPersona === persona.id && styles.selectedDescription
            ]}>
              {persona.description}
            </Text>
          </Pressable>
        ))}
      </View>
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
  selectorContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  personaOption: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: Colors.dark.border,
    alignItems: 'center',
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    backgroundColor: Colors.dark.card,
    borderWidth: 2,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  personaName: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  personaDescription: {
    fontSize: 13,
    color: Colors.dark.subtext,
    textAlign: 'center',
    lineHeight: 18,
  },
  selectedText: {
    color: Colors.dark.text,
  },
  selectedDescription: {
    color: Colors.dark.textSecondary,
  },
});