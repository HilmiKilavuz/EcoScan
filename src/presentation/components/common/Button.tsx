import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    loading = false,
}) => {
    const buttonStyle = [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        (disabled || loading) && styles.disabled,
    ];

    const textStyle = [
        styles.text,
        variant === 'outline' && styles.outlineText,
    ];

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            style={buttonStyle}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'outline' ? '#43A047' : '#FFFFFF'} />
            ) : (
                <Text style={textStyle}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primary: {
        backgroundColor: '#43A047',
    },
    secondary: {
        backgroundColor: '#2196F3',
    },
    outline: {
        borderWidth: 2,
        borderColor: '#43A047',
        backgroundColor: 'transparent',
    },
    disabled: {
        opacity: 0.5,
    },
    text: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 16,
    },
    outlineText: {
        color: '#43A047',
    },
});
