import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from '../stores/authStore';
import { AuthStack } from './AuthStack';
import { MainStack } from './MainStack';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const AppNavigator = () => {
    const { isAuthenticated, user } = useAuthStore();

    // Show loading while checking auth state
    if (user === undefined) {
        return <LoadingSpinner message="Yükleniyor..." />;
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? <MainStack /> : <AuthStack />}
        </NavigationContainer>
    );
};
