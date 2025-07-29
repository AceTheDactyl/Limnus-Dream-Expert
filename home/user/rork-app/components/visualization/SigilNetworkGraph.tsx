import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { SigilBraid } from '@/store/neuralSigilStore';
import Colors from '@/constants/colors';

interface Props {
  sigils: NeuralSigil[];
  braids: SigilBraid[];
  selectedSigil?: string;
  onSelectSigil?: (sigilId: string) => void;
}

export const SigilNetworkGraph: React.FC<Props> = ({ 
  sigils, 
  braids, 
  selectedSigil,
  onSelectSigil 
}) => {
  const svgRef = useRef<any>(null);
  
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Only load d3 on web
      import('d3').then((d3) => {
        if (!svgRef.current || sigils.length === 0) return;
        
        const svg = d3.select(svgRef.current);
        const width = 800;
        const height = 600;
        
        svg.selectAll('*').remove();
        
        // Create links from braids
        const links = braids.flatMap(braid => 
          braid.connections.map(conn => ({
            source: conn.from,
            target: conn.to,
            strength: conn.strength,
            type: conn.type
          }))
        );
        
        // Create force simulation
        const simulation = d3.forceSimulation(sigils)
          .force('link', d3.forceLink(links)
            .id((d: any) => d.id)
            .strength(d => d.strength))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('collision', d3.forceCollide().radius(30));
        
        // Draw links
        const link = svg.append('g')
          .selectAll('line')
          .data(links)
          .enter().append('line')
          .attr('stroke', d => {
            const opacity = d.strength;
            return `rgba(52, 152, 219, ${opacity})`;
          })
          .attr('stroke-width', d => d.strength * 5);
        
        // Draw nodes
        const node = svg.append('g')
          .selectAll('g')
          .data(sigils)
          .enter().append('g')
          .attr('cursor', 'pointer')
          .on('click', (event, d) => onSelectSigil?.(d.id));
        
        // Brain region colors
        const regionColors: Record<string, string> = {
          Cortical: '#3498db',
          Limbic: '#e74c3c',
          Brainstem: '#2ecc71',
          Thalamic: '#f1c40f'
        };
        
        // Add circles
        node.append('circle')
          .attr('r', d => 15 + d.strength * 15)
          .attr('fill', d => regionColors[d.brainRegion])
          .attr('opacity', 0.8)
          .attr('stroke', d => d.id === selectedSigil ? '#fff' : 'none')
          .attr('stroke-width', 2);
        
        // Add pattern visualization
        node.each(function(d) {
          const g = d3.select(this);
          const pattern = d.pattern.slice(0, 8);
          
          pattern.forEach((val, i) => {
            const angle = (i / 8) * 2 * Math.PI;
            const radius = Math.abs(val) * 15;
            
            g.append('line')
              .attr('x1', 0)
              .attr('y1', 0)
              .attr('x2', Math.cos(angle) * radius)
              .attr('y2', Math.sin(angle) * radius)
              .attr('stroke', val > 0 ? '#00ff88' : '#ff0088')
              .attr('stroke-width', 1.5)
              .attr('opacity', 0.6);
          });
        });
        
        // Add labels
        node.append('text')
          .text(d => d.sourceType[0].toUpperCase())
          .attr('text-anchor', 'middle')
          .attr('dy', 4)
          .attr('fill', '#fff')
          .attr('font-size', 12)
          .attr('font-weight', 'bold');
        
        // Update positions on tick
        simulation.on('tick', () => {
          link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);
          
          node
            .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
        });
        
        // Cleanup
        return () => {
          simulation.stop();
        };
      });
    }
  }, [sigils, braids, selectedSigil, onSelectSigil]);
  
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.fallback}>
          {/* Simple fallback visualization for mobile */}
          {sigils.map((sigil, index) => (
            <View key={sigil.id} style={[styles.node, { 
              backgroundColor: getRegionColor(sigil.brainRegion),
              opacity: sigil.id === selectedSigil ? 1 : 0.7
            }]} />
          ))}
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="600" 
        viewBox="0 0 800 600"
        style={styles.svg}
      />
    </View>
  );
};

const getRegionColor = (region: string): string => {
  const colors: Record<string, string> = {
    Cortical: '#3498db',
    Limbic: '#e74c3c',
    Brainstem: '#2ecc71',
    Thalamic: '#f1c40f'
  };
  return colors[region] || '#666';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
    borderRadius: 12,
    overflow: 'hidden',
  },
  svg: {
    backgroundColor: Colors.dark.card,
  },
  fallback: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  node: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 5,
  },
});