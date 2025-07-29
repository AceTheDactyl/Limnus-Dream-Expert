import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text } from "react-native";
import Colors from "@/constants/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { useNeuralSigilStore } from "@/store/neuralSigilStore";
import React from "react";

// Simple Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.dark.background, padding: 20 }}>
          <Text style={{ color: Colors.dark.text, fontSize: 18, fontWeight: '600', marginBottom: 12 }}>Something went wrong</Text>
          <Text style={{ color: Colors.dark.subtext, textAlign: 'center', lineHeight: 20 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
useEffect(() => {
    // Initialize neural sigil system on app start
    const initSystem = async () => {
      try {
        console.log('Starting neural system initialization...');
        const neuralSigilStore = useNeuralSigilStore.getState();
        
        if (neuralSigilStore.initializeNeuralSystem) {
          await neuralSigilStore.initializeNeuralSystem();
          console.log('Neural system initialized successfully');
          
          // Test neural sigil generation
          try {
            const testSigil = await neuralSigilStore.generateNeuralSigil('test dream about flying', 'dream');
            console.log('Test sigil generated successfully:', testSigil.id);
          } catch (error) {
            console.error('Test sigil generation failed:', error);
          }
        } else {
          console.warn('Neural system initialization method not found');
        }
      } catch (error) {
        console.error('Failed to initialize neural system:', error);
      }
    };
    
    initSystem();
  }, []);
  
  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: Colors.dark.background,
              },
              headerTintColor: Colors.dark.text,
              headerTitleStyle: {
                fontWeight: '700',
                fontSize: 17,
              },
              contentStyle: {
                backgroundColor: Colors.dark.background,
              },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="dream/[id]" 
              options={{ 
                title: "Dream Details",
                presentation: "card",
              }} 
            />
          </Stack>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}