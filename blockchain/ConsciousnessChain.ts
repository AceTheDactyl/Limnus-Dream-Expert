import { NeuralSigil } from '@/models/neural-sigil/sigilGenerator';
import { type NeuralSigilData } from '@/constants/neuralSigils';

export interface ConsciousnessBlock {
  id: string;
  sigilId: string;
  type: 'dream' | 'meditation' | 'consciousness';
  pattern: number[];
  metadata: Record<string, any>;
  timestamp: number;
  previousHash: string;
  hash: string;
  neuralSigilData?: NeuralSigilData;
}

export class ConsciousnessChain {
  private blocks: ConsciousnessBlock[] = [];
  private currentHash: string = 'genesis';

  private generateHash(block: Omit<ConsciousnessBlock, 'hash'>): string {
    const data = JSON.stringify(block);
    let hash = 0;
    if (data.length === 0) return '0000000000000000';
    
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive hex string and pad
    const hexHash = Math.abs(hash).toString(16);
    return hexHash.padStart(16, '0').slice(0, 16);
  }

  async addBlock(blockData: Omit<ConsciousnessBlock, 'id' | 'previousHash' | 'hash'>): Promise<ConsciousnessBlock> {
    const block: Omit<ConsciousnessBlock, 'hash'> = {
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      previousHash: this.currentHash,
      ...blockData
    };

    const hash = this.generateHash(block);
    const finalBlock: ConsciousnessBlock = { ...block, hash };

    this.blocks.push(finalBlock);
    this.currentHash = hash;

    return finalBlock;
  }

  getBlocks(): ConsciousnessBlock[] {
    return [...this.blocks];
  }

  getLatestBlock(): ConsciousnessBlock | null {
    return this.blocks.length > 0 ? this.blocks[this.blocks.length - 1] : null;
  }

  findBlocksBySigilId(sigilId: string): ConsciousnessBlock[] {
    return this.blocks.filter(block => block.sigilId === sigilId);
  }

  findBlocksByType(type: ConsciousnessBlock['type']): ConsciousnessBlock[] {
    return this.blocks.filter(block => block.type === type);
  }

  findBlocksByNeuralSigil(neuralSigilData: NeuralSigilData): ConsciousnessBlock[] {
    return this.blocks.filter(block => 
      block.neuralSigilData?.id === neuralSigilData.id ||
      block.neuralSigilData?.ternaryCode === neuralSigilData.ternaryCode
    );
  }
}