import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { ProposalsScreen } from '../screens/ProposalsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ImprovedProfileScreen } from '../screens/ImprovedProfileScreen';
import { ImprovedQuoteModalScreen } from '../screens/ImprovedQuoteModalScreen';

import { COLORS, SIZES } from '../constants/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab Navigator for authenticated users
const MainTabs = () => {
  const { getTotalUnreadCount } = useMessages();
  const unreadCount = getTotalUnreadCount();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: SIZES.sm,
          paddingBottom: SIZES.xs,
          height: 70,
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: SIZES.fontSm,
          fontWeight: '600',
          marginBottom: SIZES.xs,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Discover"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Découvrir',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="🔥" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Proposals"
        component={ProposalsScreen}
        options={{
          tabBarLabel: 'Propositions',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="📝" color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="💬" color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ImprovedProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => (
            <TabIcon icon="👤" color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Simple icon component
const TabIcon = ({ icon, color }: { icon: string; color: string }) => (
  <Text style={{ fontSize: 24 }}>{icon}</Text>
);

// Main Stack Navigator
export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth
  if (isLoading) {
    return null; // Could add a SplashScreen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth screens
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          // App screens
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="QuoteModal"
              component={ImprovedQuoteModalScreen}
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
