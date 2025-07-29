import { SortBy } from '@/store/dreamStore';

export interface SortOptionConfig {
  id: SortBy;
  label: string;
  description: string;
  icon: string;
}

export const sortOptions: SortOptionConfig[] = [
  {
    id: 'type',
    label: 'Group by Dream Type',
    description: 'Group dreams by classification',
    icon: '○'
  },
  {
    id: 'persona',
    label: 'Group by Persona',
    description: 'Group by Orion or Limnus',
    icon: '👤'
  },
  {
    id: 'mnemonic',
    label: 'Mnemonic Dreams Only',
    description: 'Show only memory recursion dreams',
    icon: '🧠'
  },
  {
    id: 'psychic',
    label: 'Psychic Dreams Only',
    description: 'Show only emotional integration dreams',
    icon: '💫'
  },
  {
    id: 'pre-echo',
    label: 'Pre-Echo Dreams Only',
    description: 'Show only probability tuning dreams',
    icon: '🔮'
  },
  {
    id: 'lucid',
    label: 'Lucid Dreams Only',
    description: 'Show only symbol control dreams',
    icon: '✨'
  },
  {
    id: 'meta-lucid',
    label: 'Meta-Lucid Dreams Only',
    description: 'Show only architectural interface dreams',
    icon: '🌀'
  }
];

export const getSortOption = (id: SortBy): SortOptionConfig | undefined => {
  return sortOptions.find(option => option.id === id);
};