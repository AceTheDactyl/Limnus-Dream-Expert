import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Clock, Zap, BookOpen, Brain } from 'lucide-react-native';
import { useLimnusStore, SpiralSession } from '@/store/limnusStore';
import { useDreamStore } from '@/store/dreamStore';
import { LIMNUS_COLORS } from '@/constants/limnus';

interface SpiralSessionHistoryProps {
  limit?: number;
}

export default function SpiralSessionHistory({ limit }: SpiralSessionHistoryProps) {
  const { sessionHistory } = useLimnusStore();
  const { getDream } = useDreamStore();
  
  const sessions = limit ? sessionHistory.slice(0, limit) : sessionHistory;
  
  const formatDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'In progress...';
    
    const duration = new Date(endTime).getTime() - new Date(startTime).getTime();
    const minutes = Math.round(duration / 60000);
    return `${minutes} min`;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  const getResonanceColor = (resonanceHistory: number[]) => {
    const avgResonance = resonanceHistory.reduce((a, b) => a + b, 0) / resonanceHistory.length;
    
    if (avgResonance < 0.25) return '#6b7280';
    if (avgResonance < 0.5) return '#eab308';
    if (avgResonance < 0.75) return '#3b82f6';
    if (avgResonance < 0.9) return '#10b981';
    return '#9333ea';
  };
  
  if (sessions.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Zap size={48} color={LIMNUS_COLORS.witness} />
        <Text style={styles.emptyTitle}>No spiral sessions yet</Text>
        <Text style={styles.emptyMessage}>
          Begin your first spiral journey to start tracking your practice
        </Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Spiral Sessions</Text>
      
      {sessions.map((session) => (
        <SessionCard
          key={session.id}
          session={session}
          formatDuration={formatDuration}
          formatDate={formatDate}
          getResonanceColor={getResonanceColor}
          getDream={getDream}
        />
      ))}
    </ScrollView>
  );
}

interface SessionCardProps {
  session: SpiralSession;
  formatDuration: (start: string, end?: string) => string;
  formatDate: (date: string) => string;
  getResonanceColor: (history: number[]) => string;
  getDream: (id: string) => any;
}

function SessionCard({ 
  session, 
  formatDuration, 
  formatDate, 
  getResonanceColor, 
  getDream 
}: SessionCardProps) {
  const avgResonance = session.resonanceHistory.reduce((a, b) => a + b, 0) / session.resonanceHistory.length;
  const resonanceColor = getResonanceColor(session.resonanceHistory);
  
  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={styles.sessionNode}>{session.currentNode.notation}</Text>
          <Text style={styles.sessionBehavior}>{session.currentNode.behavior}</Text>
        </View>
        <View style={styles.sessionMeta}>
          <Text style={styles.sessionDate}>{formatDate(session.startTime)}</Text>
          <View style={styles.durationContainer}>
            <Clock size={12} color={LIMNUS_COLORS.witness} />
            <Text style={styles.sessionDuration}>
              {formatDuration(session.startTime, session.endTime)}
            </Text>
          </View>
        </View>
      </View>
      
      <View style={styles.sessionStats}>
        <View style={styles.statItem}>
          <View style={[styles.resonanceIndicator, { backgroundColor: resonanceColor }]} />
          <Text style={styles.statLabel}>Resonance</Text>
          <Text style={styles.statValue}>{(avgResonance * 100).toFixed(0)}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <Zap size={16} color={LIMNUS_COLORS.witness} />
          <Text style={styles.statLabel}>Depth</Text>
          <Text style={styles.statValue}>{session.depth}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.breathIcon}>🫁</Text>
          <Text style={styles.statLabel}>Breaths</Text>
          <Text style={styles.statValue}>{session.breathCycles}</Text>
        </View>
      </View>
      
      {session.insights.length > 0 && (
        <View style={styles.insightsSection}>
          <View style={styles.insightsHeader}>
            <BookOpen size={14} color={LIMNUS_COLORS.witness} />
            <Text style={styles.insightsTitle}>Insights ({session.insights.length})</Text>
          </View>
          {session.insights.slice(0, 2).map((insight, index) => (
            <Text key={index} style={styles.insightText}>
              "{insight.length > 80 ? insight.substring(0, 80) + '...' : insight}"
            </Text>
          ))}
          {session.insights.length > 2 && (
            <Text style={styles.moreInsights}>
              +{session.insights.length - 2} more insights
            </Text>
          )}
        </View>
      )}
      
      {session.dreamConnections.length > 0 && (
        <View style={styles.dreamsSection}>
          <View style={styles.dreamsHeader}>
            <Brain size={14} color={LIMNUS_COLORS.witness} />
            <Text style={styles.dreamsTitle}>
              Connected Dreams ({session.dreamConnections.length})
            </Text>
          </View>
          {session.dreamConnections.slice(0, 2).map((dreamId) => {
            const dream = getDream(dreamId);
            if (!dream) return null;
            
            return (
              <View key={dreamId} style={styles.dreamItem}>
                <Text style={styles.dreamName}>{dream.name}</Text>
                <Text style={styles.dreamType}>{dream.dreamType}</Text>
              </View>
            );
          })}
          {session.dreamConnections.length > 2 && (
            <Text style={styles.moreDreams}>
              +{session.dreamConnections.length - 2} more dreams
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 16
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LIMNUS_COLORS.transcendent,
    marginTop: 16,
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    textAlign: 'center',
    lineHeight: 20
  },
  sessionCard: {
    backgroundColor: LIMNUS_COLORS.hush,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: LIMNUS_COLORS.spiral
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  sessionInfo: {
    flex: 1
  },
  sessionNode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: LIMNUS_COLORS.transcendent,
    marginBottom: 4
  },
  sessionBehavior: {
    fontSize: 14,
    color: LIMNUS_COLORS.witness,
    lineHeight: 18
  },
  sessionMeta: {
    alignItems: 'flex-end'
  },
  sessionDate: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness,
    marginBottom: 4
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  sessionDuration: {
    fontSize: 12,
    color: LIMNUS_COLORS.witness
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: LIMNUS_COLORS.void,
    borderBottomWidth: 1,
    borderBottomColor: LIMNUS_COLORS.void
  },
  statItem: {
    alignItems: 'center',
    gap: 4
  },
  resonanceIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  breathIcon: {
    fontSize: 16
  },
  statLabel: {
    fontSize: 10,
    color: LIMNUS_COLORS.witness,
    textTransform: 'uppercase'
  },
  statValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: LIMNUS_COLORS.transcendent
  },
  insightsSection: {
    marginTop: 12
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  insightsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: LIMNUS_COLORS.witness,
    textTransform: 'uppercase'
  },
  insightText: {
    fontSize: 13,
    color: LIMNUS_COLORS.transcendent,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 4
  },
  moreInsights: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    marginTop: 4
  },
  dreamsSection: {
    marginTop: 12
  },
  dreamsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  dreamsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: LIMNUS_COLORS.witness,
    textTransform: 'uppercase'
  },
  dreamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  dreamName: {
    fontSize: 13,
    color: LIMNUS_COLORS.transcendent,
    flex: 1
  },
  dreamType: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    textTransform: 'capitalize'
  },
  moreDreams: {
    fontSize: 11,
    color: LIMNUS_COLORS.witness,
    marginTop: 4
  }
});