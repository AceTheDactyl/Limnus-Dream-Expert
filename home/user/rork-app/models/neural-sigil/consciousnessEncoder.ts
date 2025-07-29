import { BiometricData, EmotionalState } from '@/store/consciousnessStore';
import { BreathCycleLog } from '@/store/limnusStore';

export interface ConsciousnessSnapshot {
  timestamp: number;
  biometrics: BiometricData;
  emotional: EmotionalState;
  breath?: BreathCycleLog;
  coherence: number;
  depth: number;
}

export class ConsciousnessEncoder {
  encodeSnapshot(snapshot: ConsciousnessSnapshot): number[] {
    const vector: number[] = [];
    
    // Encode biometric data
    vector.push(
      snapshot.biometrics.heartRate / 100,
      snapshot.biometrics.brainwaves.alpha,
      snapshot.biometrics.brainwaves.beta,
      snapshot.biometrics.brainwaves.theta,
      snapshot.biometrics.brainwaves.delta,
      snapshot.biometrics.breathingRate / 20,
      snapshot.biometrics.skinConductance
    );
    
    // Encode emotional state
    const emotionMap: Record<string, number> = {
      'joy': 1, 'peace': 0.8, 'neutral': 0.5, 
      'anxiety': 0.3, 'fear': 0.1
    };
    vector.push(
      emotionMap[snapshot.emotional.hue] || 0.5,
      snapshot.emotional.intensity,
      snapshot.emotional.polarity
    );
    
    // Encode breath if available
    if (snapshot.breath) {
      vector.push(
        snapshot.breath.consciousnessScore || 0.5,
        snapshot.breath.breathAlignment || 0.5
      );
    } else {
      // Add default values if breath data is not available
      vector.push(0.5, 0.5);
    }
    
    // Add coherence and depth
    vector.push(snapshot.coherence, snapshot.depth);
    
    // Pad or truncate to 64 dimensions
    while (vector.length < 64) vector.push(0);
    return vector.slice(0, 64);
  }
  
  decodeVector(vector: number[]): Partial<ConsciousnessSnapshot> {
    return {
      biometrics: {
        heartRate: vector[0] * 100,
        brainwaves: {
          alpha: vector[1],
          beta: vector[2],
          theta: vector[3],
          delta: vector[4],
          gamma: 0.2 // Add missing gamma property with default value
        },
        breathingRate: vector[5] * 20,
        skinConductance: vector[6],
        fibonacciRhythm: 0.5, // Add missing properties with defaults
        goldenBreathing: 0.5
      },
      coherence: vector[vector.length - 2] || 0.5,
      depth: vector[vector.length - 1] || 0.5
    };
  }
}