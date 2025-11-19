import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { ProposalsScreen } from '../screens/ProposalsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { ImprovedProfileScreen } from '../screens/ImprovedProfileScreen';
import { ImprovedQuoteModalScreen } from '../screens/ImprovedQuoteModalScreen';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';

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
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.white,
          borderTopWidth: 0,
          borderRadius: SIZES.radiusXl,
          paddingBottom: Platform.OS === 'ios' ? 10 : 8,
          paddingTop: 8,
          ...SHADOWS.large,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={95}
              tint="light"
              style={styles.blurContainer}
            />
          ) : (
            <View style={styles.androidBackground} />
          )
        ),
        tabBarLabelStyle: {
          fontSize: SIZES.fontXs,
          fontWeight: '600',
          marginTop: -4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Discover"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'Découvrir',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="flame" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: 'Matches',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="heart" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Proposals"
        component={ProposalsScreen}
        options={{
          tabBarLabel: 'Propositions',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="document-text" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Messages',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="chatbubble-ellipses" 
              color={color} 
              focused={focused}
            />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: COLORS.primary,
            color: COLORS.white,
            fontSize: 10,
            fontWeight: 'bold',
            minWidth: 18,
            height: 18,
            borderRadius: 9,
            top: 2,
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ImprovedProfileScreen}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name="person" 
              color={color} 
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Enhanced icon component with animation
const TabIcon = ({ 
  name, 
  color, 
  focused 
}: { 
  name: keyof typeof Ionicons.glyphMap; 
  color: string; 
  focused: boolean;
}) => {
  return (
    <View style={[
      styles.iconContainer,
      focused && styles.iconContainerActive
    ]}>
      <Ionicons 
        name={focused ? name : `${name}-outline` as any} 
        size={26} 
        color={color}
      />
    </View>
  );
};

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

// Styles for the modern tab bar
const styles = StyleSheet.create({
  blurContainer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radiusXl,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  androidBackground: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: SIZES.radiusXl,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 36,
    borderRadius: SIZES.radiusMd,
    marginTop: 4,
  },
  iconContainerActive: {
    backgroundColor: `${COLORS.primary}10`,
    transform: [{ scale: 1.05 }],
  },
});
