import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/common/Button';

export const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.emoji}>👤</Text>
                <Text style={styles.name}>{user?.displayName || 'Kullanıcı'}</Text>
                <Text style={styles.email}>{user?.email}</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{user?.totalPoints || 0}</Text>
                    <Text style={styles.statLabel}>Toplam Puan</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Button
                    title="Çıkış Yap"
                    onPress={handleLogout}
                    variant="outline"
                />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        backgroundColor: '#43A047',
        padding: 24,
        paddingTop: 60,
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    emoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    statsContainer: {
        padding: 24,
    },
    statBox: {
        backgroundColor: '#FFFFFF',
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#43A047',
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
    },
    section: {
        padding: 24,
    },
});
