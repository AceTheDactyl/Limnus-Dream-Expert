import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Moon, Brain, Sparkles, Activity } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: 'moon' | 'brain' | 'sparkles' | 'activity';
  action?: {
    label: string;
    onPress: () => void;
  };
}

export default function EmptyState({ 
  title = "No dreams yet", 
  message = "Start recording your dreams to unlock insights into your subconscious mind.",
  icon = 'moon',
  action
}: EmptyStateProps) {
  const router = useRouter();
  const [fadeAnimation] = useState(new Animated.Value(0));
  const [floatAnimation] = useState(new Animated.Value(0));
  
  const iconComponents = {
    moon: Moon,
    brain: Brain,
    sparkles: Sparkles,
    activity: Activity,
  };
  
  const IconComponent = iconComponents[icon];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnimation,
        },
      ]}
    >
      <LinearGradient
        colors={[Colors.dark.backgroundSecondary, Colors.dark.background]}
        style={styles.backgroundGradient}
      >
        <Animated.View
          style={[
            styles.iconContainer,
            {
              transform: [{
                translateY: floatAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -10],
                }),
              }],
            },
          ]}
        >
          <View style={styles.iconBackground}>
            <IconComponent size={48} color={Colors.dark.primary} />
          </View>
        </Animated.View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        
        {action && (
          <Button 
            label={action.label}
            onPress={action.onPress}
            variant="gradient"
            size="large"
            style={styles.button}
          />
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  backgroundGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.dark.text,
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    color: Colors.dark.subtext,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    maxWidth: 300,
  },
  button: {
    marginTop: 8,
  },
});