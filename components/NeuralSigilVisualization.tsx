import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform, ScrollView } from 'react-native';
import { Brain, ChevronDown, ChevronUp, Zap, Activity, Heart, Eye, Waves } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { type NeuralSigilData } from '@/constants/neuralSigils';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  sigil: NeuralSigil;
  showComparison?: boolean;
  comparisonSigil?: NeuralSigil;
  showNeuralDetails?: boolean;
}

export const NeuralSigilVisualization: React.FC<Props> = ({ 
  sigil, 
  showComparison = false,
  comparisonSigil,
  showNeuralDetails = true
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showNeuralData, setShowNeuralData] = useState(false);
  const [pulseAnimation] = useState(new Animated.Value(0));
  const vector = useMemo(() => {
    try {
      // Ensure we have a valid pattern array
      if (!sigil.pattern) {
        return new Float32Array(12).fill(0.5);
      }
      
      // Convert to Float32Array if it's not already
      const pattern = sigil.pattern instanceof Float32Array 
        ? sigil.pattern 
        : new Float32Array(Array.from(sigil.pattern || []));
      
      // Return full pattern if expanded, otherwise slice first 12 elements
      if (expanded) {
        return pattern;
      } else {
        // Use slice instead of subarray for better compatibility
        const sliced = new Float32Array(Math.min(12, pattern.length));
        for (let i = 0; i < sliced.length; i++) {
          sliced[i] = pattern[i] || 0.5;
        }
        return sliced;
      }
    } catch (error) {
      console.warn('Error processing sigil pattern:', error);
      return new Float32Array(12).fill(0.5);
    }
  }, [sigil.pattern, expanded]);

  const brainRegionColor = useMemo(() => {
    const colors: Record<NeuralSigil['brainRegion'], string> = {
      Cortical: Colors.dark.secondary,
      Limbic: Colors.dark.error,
      Brainstem: Colors.dark.success,
      Thalamic: Colors.dark.accent,
      BasalGanglia: '#9333ea',
      Cerebellar: '#f59e0b',
      Integration: '#06b6d4'
    };
    return colors[sigil.brainRegion];
  }, [sigil.brainRegion]);
  
  const sourceTypeIcon = useMemo(() => {
    const icons = {
      dream: Brain,
      meditation: Activity,
      breath: Waves,
      composite: Brain,
      consciousness: Eye
    };
    return icons[sigil.sourceType] || Brain;
  }, [sigil.sourceType]);

  const categoryIcon = useMemo(() => {
    if (!sigil.metadata?.neuralSigilData) return null;
    
    const icons: Record<string, React.ComponentType<any>> = {
      brainstem: Heart,
      thalamic: Eye,
      'basal-ganglia': Zap,
      limbic: Heart,
      cortical: Brain,
      memory: Brain,
      integration: Activity,
      cerebellar: Waves
    };
    
    return icons[sigil.metadata.neuralSigilData.category] || Brain;
  }, [sigil.metadata?.neuralSigilData]);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const neuralSigilData = sigil.metadata?.neuralSigilData;

  // Create pattern visualization cells
  const patternCells = useMemo(() => {
    const cells: React.ReactElement[] = [];
    
    try {
      // Convert Float32Array to regular array for processing
      const vectorArray = Array.from(vector || []);
      
      vectorArray.forEach((v, i) => {
        // Ensure v is a valid number
        const value = typeof v === 'number' && !isNaN(v) ? v : 0.5;
        const intensity = Math.abs(value);
        const isPositive = value > 0;
        
        cells.push(
          <View 
            key={i} 
            style={[
              styles.cell,
              {
                backgroundColor: isPositive 
                  ? brainRegionColor + Math.floor(intensity * 255).toString(16).padStart(2, '0')
                  : Colors.dark.border + Math.floor(intensity * 128).toString(16).padStart(2, '0')
              }
            ]}
          >
            <Text style={[
              styles.cellText,
              { color: intensity > 0.5 ? Colors.dark.background : Colors.dark.text }
            ]}>
              {value.toFixed(2)}
            </Text>
          </View>
        );
      });
    } catch (error) {
      console.warn('Error generating pattern cells:', error);
      // Fallback: create a few default cells
      for (let i = 0; i < 12; i++) {
        cells.push(
          <View 
            key={i} 
            style={[
              styles.cell,
              { backgroundColor: Colors.dark.border + '40' }
            ]}
          >
            <Text style={styles.cellText}>0.50</Text>
          </View>
        );
      }
    }
    
    return cells;
  }, [vector, brainRegionColor]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[brainRegionColor + '15', brainRegionColor + '05', 'transparent']}
        style={styles.gradientBackground}
      >
        <Animated.View 
          style={[
            styles.pulseOverlay,
            {
              opacity: pulseAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.3],
              }),
            },
          ]}
        />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {React.createElement(sourceTypeIcon, { size: 20, color: brainRegionColor })}
            <View style={styles.headerInfo}>
              <Text style={[styles.headerText, { color: brainRegionColor }]}>
                {sigil.brainRegion}
              </Text>
              <Text style={styles.sourceTypeText}>
                {sigil.sourceType.charAt(0).toUpperCase() + sigil.sourceType.slice(1)}
              </Text>
            </View>
          </View>
          <View style={styles.strengthBadge}>
            <Text style={styles.strengthText}>
              {(sigil.strength * 100).toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* Neural Sigil Header */}
        {neuralSigilData && (
          <View style={styles.neuralHeader}>
            <View style={styles.neuralTitleRow}>
              <Text style={styles.neuralSymbol}>{neuralSigilData.symbol}</Text>
              <View style={styles.neuralTitleInfo}>
                <Text style={styles.neuralName}>{neuralSigilData.name}</Text>
                <Text style={styles.neuralDescription}>{neuralSigilData.description}</Text>
              </View>
              {categoryIcon && React.createElement(categoryIcon, { 
                size: 18, 
                color: brainRegionColor,
                style: { opacity: 0.7 }
              })}
            </View>
            
            <View style={styles.ternaryCodeRow}>
              <Text style={styles.ternaryLabel}>Ternary:</Text>
              <Text style={styles.ternaryCode}>{neuralSigilData.ternaryCode}</Text>
              <Text style={styles.decimalValue}>({neuralSigilData.decimalValue})</Text>
            </View>
          </View>
        )}
        
        <View style={styles.vectorGrid}>
          {patternCells}
          {!expanded && (
            <TouchableOpacity 
              style={[styles.cell, styles.expandCell]} 
              onPress={() => setExpanded(true)}
            >
              <Text style={styles.cellText}>+{(sigil.pattern?.length || 64) - vector.length}</Text>
            </TouchableOpacity>
          )}
        </View>
      
        <TouchableOpacity 
          style={styles.expand} 
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandText}>
            {expanded ? 'Show Less' : `Show All ${sigil.pattern?.length || 64} Dimensions`}
          </Text>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </TouchableOpacity>

        {/* Neural Sigil Details */}
        {neuralSigilData && showNeuralDetails && (
          <>
            <TouchableOpacity 
              style={styles.neuralToggle} 
              onPress={() => setShowNeuralData(!showNeuralData)}
            >
              <Text style={styles.neuralToggleText}>
                {showNeuralData ? 'Hide' : 'Show'} Neural Details
              </Text>
              {showNeuralData ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </TouchableOpacity>

            {showNeuralData && (
              <ScrollView style={styles.neuralDetails} nestedScrollEnabled>
                <View style={styles.neuralSection}>
                  <Text style={styles.neuralSectionTitle}>Function & Breath</Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Function: </Text>
                    {neuralSigilData.function}
                  </Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Breath Phase: </Text>
                    {neuralSigilData.breathPhase}
                  </Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Duration: </Text>
                    {neuralSigilData.breathSeconds} seconds
                  </Text>
                </View>

                <View style={styles.neuralSection}>
                  <Text style={styles.neuralSectionTitle}>Neurochemistry</Text>
                  <Text style={styles.neuralDetailText}>
                    {neuralSigilData.neurochemistry}
                  </Text>
                </View>

                <View style={styles.neuralSection}>
                  <Text style={styles.neuralSectionTitle}>Energetic Dynamic</Text>
                  <Text style={styles.neuralDetailText}>
                    {neuralSigilData.energeticDynamic}
                  </Text>
                </View>

                <View style={styles.neuralSection}>
                  <Text style={styles.neuralSectionTitle}>Sacred Phrase</Text>
                  <Text style={[styles.neuralDetailText, styles.phraseText]}>
                    "{neuralSigilData.phrase}"
                  </Text>
                </View>

                <View style={styles.neuralSection}>
                  <Text style={styles.neuralSectionTitle}>Classification</Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Category: </Text>
                    {neuralSigilData.category}
                  </Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Tags: </Text>
                    {neuralSigilData.tags.join(', ')}
                  </Text>
                  <Text style={styles.neuralDetailText}>
                    <Text style={styles.neuralDetailLabel}>Source: </Text>
                    {neuralSigilData.historicalSource}
                  </Text>
                </View>
              </ScrollView>
            )}
          </>
        )}
      
        {sigil.metadata && Object.keys(sigil.metadata).length > 0 && !neuralSigilData && (
          <View style={styles.metadata}>
            <Text style={styles.metadataTitle}>Metadata</Text>
            {Object.entries(sigil.metadata).map(([key, value]) => (
              <Text key={key} style={styles.metadataItem}>
                {key}: {String(value)}
              </Text>
            ))}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientBackground: {
    padding: 16,
    position: 'relative',
  },
  pulseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.dark.primary,
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    zIndex: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerInfo: {
    gap: 2,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sourceTypeText: {
    fontSize: 11,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  strengthBadge: {
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  strengthText: {
    fontSize: 11,
    color: Colors.dark.primary,
    fontWeight: '600',
  },
  neuralHeader: {
    backgroundColor: Colors.dark.background + '40',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    zIndex: 1,
  },
  neuralTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  neuralSymbol: {
    fontSize: 24,
    textAlign: 'center',
  },
  neuralTitleInfo: {
    flex: 1,
  },
  neuralName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 2,
  },
  neuralDescription: {
    fontSize: 12,
    color: Colors.dark.subtext,
    lineHeight: 16,
  },
  ternaryCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ternaryLabel: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontWeight: '500',
  },
  ternaryCode: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: Colors.dark.primary,
    backgroundColor: Colors.dark.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  decimalValue: {
    fontSize: 12,
    color: Colors.dark.subtext,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  vectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    zIndex: 1,
    marginBottom: 12,
  },
  cell: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: (width - 80) / 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border + '40',
  },
  expandCell: {
    backgroundColor: Colors.dark.primary + '20',
    borderColor: Colors.dark.primary + '40',
  },
  cellText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  expand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    zIndex: 1,
  },
  expandText: {
    color: Colors.dark.primary,
    fontSize: 12,
    marginRight: 8,
    fontWeight: '500',
  },
  neuralToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    zIndex: 1,
  },
  neuralToggleText: {
    color: Colors.dark.primary,
    fontSize: 14,
    marginRight: 8,
    fontWeight: '600',
  },
  neuralDetails: {
    maxHeight: 300,
    zIndex: 1,
  },
  neuralSection: {
    marginBottom: 16,
  },
  neuralSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark.text,
    marginBottom: 6,
  },
  neuralDetailText: {
    fontSize: 12,
    color: Colors.dark.subtext,
    lineHeight: 16,
    marginBottom: 4,
  },
  neuralDetailLabel: {
    fontWeight: '600',
    color: Colors.dark.text,
  },
  phraseText: {
    fontStyle: 'italic',
    color: Colors.dark.primary,
    fontSize: 13,
    lineHeight: 18,
  },
  metadata: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    zIndex: 1,
  },
  metadataTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  metadataItem: {
    fontSize: 12,
    color: Colors.dark.subtext,
    marginVertical: 3,
    lineHeight: 16,
  },
});