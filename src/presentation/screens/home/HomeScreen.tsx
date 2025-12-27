import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { useScanStore } from '../../stores/scanStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const HomeScreen = ({ navigation }: any) => {
    const { user } = useAuthStore();
    const { scans, isLoading, fetchScans } = useScanStore();

    useEffect(() => {
        if (user) {
            fetchScans(user.id);
        }
    }, [user]);

    if (isLoading) {
        return <LoadingSpinner message="Yükleniyor..." />;
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.greeting}>Merhaba, {user?.displayName || 'Kullanıcı'}! 👋</Text>
                <Text style={styles.points}>Toplam Puan: {user?.totalPoints || 0} 🌟</Text>
            </View>

            <TouchableOpacity
                style={styles.scanButton}
                onPress={() => navigation.navigate('Scan')}
            >
                <Text style={styles.scanButtonText}>📸 Atık Tara</Text>
            </TouchableOpacity>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Son Taramalar</Text>
                {scans.length === 0 ? (
                    <Text style={styles.emptyText}>Henüz tarama yapmadınız</Text>
                ) : (
                    scans.slice(0, 5).map((scan) => (
                        <View key={scan.id} style={styles.scanItem}>
                            <Text style={styles.scanType}>{scan.wasteType}</Text>
                            <Text style={styles.scanPoints}>+{scan.pointsEarned} puan</Text>
                        </View>
                    ))
                )}
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
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    greeting: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    points: {
        fontSize: 18,
        color: '#FFFFFF',
    },
    scanButton: {
        backgroundColor: '#43A047',
        margin: 24,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
    },
    scanButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    section: {
        padding: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 16,
    },
    emptyText: {
        color: '#6B7280',
        textAlign: 'center',
        padding: 24,
    },
    scanItem: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scanType: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    scanPoints: {
        fontSize: 14,
        color: '#43A047',
        fontWeight: '600',
    },
});
