import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.message}>{message}</Text>
            {onRetry && (
                <TouchableOpacity onPress={onRetry} style={styles.button}>
                    <Text style={styles.buttonText}>Tekrar Dene</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: 24,
    },
    emoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    message: {
        fontSize: 16,
        color: '#EF4444',
        textAlign: 'center',
        marginBottom: 16,
    },
    button: {
        backgroundColor: '#43A047',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
