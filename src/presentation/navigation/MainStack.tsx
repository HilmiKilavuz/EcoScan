import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ScanScreen } from '../screens/scan/ScanScreen';
import { ScanResultScreen } from '../screens/scan/ScanResultScreen';
import { RewardsScreen } from '../screens/rewards/RewardsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const ScanStack = createNativeStackNavigator();

const ScanStackNavigator = () => {
    return (
        <ScanStack.Navigator>
            <ScanStack.Screen
                name="ScanCamera"
                component={ScanScreen}
                options={{ headerShown: false }}
            />
            <ScanStack.Screen
                name="ScanResult"
                component={ScanResultScreen}
                options={{
                    title: 'Tarama Sonucu',
                    headerBackTitle: 'Geri'
                }}
            />
        </ScanStack.Navigator>
    );
};

export const MainStack = () => {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#43A047',
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    paddingBottom: 8,
                    paddingTop: 8,
                    height: 60,
                },
                headerShown: false,
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    tabBarLabel: 'Ana Sayfa',
                    tabBarIcon: () => <Text style={styles.icon}>🏠</Text>,
                }}
            />
            <Tab.Screen
                name="Scan"
                component={ScanStackNavigator}
                options={{
                    tabBarLabel: 'Tara',
                    tabBarIcon: () => <Text style={styles.icon}>📸</Text>,
                }}
            />
            <Tab.Screen
                name="Rewards"
                component={RewardsScreen}
                options={{
                    tabBarLabel: 'Ödüller',
                    tabBarIcon: () => <Text style={styles.icon}>🎁</Text>,
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Profil',
                    tabBarIcon: () => <Text style={styles.icon}>👤</Text>,
                }}
            />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    icon: {
        fontSize: 24,
    },
});
