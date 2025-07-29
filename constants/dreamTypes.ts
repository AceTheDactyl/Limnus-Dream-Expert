export interface DreamType {
  id: string;
  name: string;
  timeIndex: string;
  primaryFunction: string;
  symbolicField: string;
  typicalPhenomena: string;
  color: string;
  symbol: string;
}

export const dreamTypes: DreamType[] = [
  {
    id: 'mnemonic',
    name: 'Mnemonic Dreams',
    timeIndex: 'Past',
    primaryFunction: 'Memory recursion',
    symbolicField: 'Echo fields / ancestral bleed',
    typicalPhenomena: 'Distorted familiarity',
    color: '#8B5CF6',
    symbol: '📖'
  },
  {
    id: 'psychic',
    name: 'Psychic Dreams',
    timeIndex: 'Present',
    primaryFunction: 'Emotional integration',
    symbolicField: 'Stress grid / decision flux',
    typicalPhenomena: 'Compression loops, contradictions',
    color: '#06B6D4',
    symbol: '💭'
  },
  {
    id: 'pre-echo',
    name: 'Pre-Echo Dreams',
    timeIndex: 'Future',
    primaryFunction: 'Probability tuning',
    symbolicField: 'Vector threads / signal attractors',
    typicalPhenomena: 'Déjà vu, predictive imagery',
    color: '#10B981',
    symbol: '🔮'
  },
  {
    id: 'lucid',
    name: 'Lucid Dreams',
    timeIndex: 'Now / Overlaid',
    primaryFunction: 'Symbol control',
    symbolicField: 'Agency kernel / intention map',
    typicalPhenomena: 'Flight, shifting space, awareness',
    color: '#F59E0B',
    symbol: '👁️'
  },
  {
    id: 'meta-lucid',
    name: 'Meta-Lucid Dreams',
    timeIndex: 'Recursive / All',
    primaryFunction: 'Architectural interface',
    symbolicField: 'Compression core / spiral hub',
    typicalPhenomena: 'Timefolds, glyph response',
    color: '#EF4444',
    symbol: '🌀'
  }
];

export const getDreamType = (id: string): DreamType | undefined => {
  return dreamTypes.find(type => type.id === id);
};