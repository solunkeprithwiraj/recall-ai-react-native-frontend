import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { storage } from "../lib/storage";
import { ToastProvider } from "../utils/toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await storage.getItem("authToken");
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
    };

    checkAuth();
  }, []);

  // Re-check auth when segments change (e.g., after login/logout)
  useEffect(() => {
    const checkAuthOnRouteChange = async () => {
      if (segments.length === 0) return;
      
      const token = await storage.getItem("authToken");
      const authenticated = !!token;
      setIsAuthenticated(authenticated);
    };

    checkAuthOnRouteChange();
  }, [segments]);

  useEffect(() => {
    // Wait until auth state is determined and segments are available
    if (isAuthenticated === null || segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === "(tabs)";

    // Use setTimeout to ensure navigation happens after mount
    const timeoutId = setTimeout(() => {
      if (!isAuthenticated && inAuthGroup) {
        // Redirect to login if trying to access protected routes without auth
        router.replace("/login");
      } else if (isAuthenticated && (segments[0] === "login" || segments[0] === "signup")) {
        // Redirect to home if logged in and trying to access login/signup
        router.replace("/(tabs)");
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [segments, isAuthenticated, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="modal" />
      <Stack.Screen name="module-detail" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ToastProvider>
          <RootLayoutNav />
          </ToastProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
