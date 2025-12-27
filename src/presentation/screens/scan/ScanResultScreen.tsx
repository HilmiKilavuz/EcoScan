import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScanStore } from '../../stores/scanStore';
import { WASTE_TYPE_TO_BIN } from '../../../core/constants/wasteTypes';
import { Button } from '../../components/common/Button';

export const ScanResultScreen = ({ navigation }: any) => {
    const { currentScan } = useScanStore();

    if (!currentScan) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Tarama sonucu bulunamadı</Text>
            </View>
        );
    }

    const { scan, isDuplicate } = currentScan;
    const binInfo = WASTE_TYPE_TO_BIN[scan.wasteType];

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={[styles.binCircle, { backgroundColor: binInfo.hexColor }]}>
                    <Text style={styles.emoji}>♻️</Text>
                </View>

                <Text style={styles.wasteType}>{scan.wasteType}</Text>

                <View style={styles.infoBox}>
                    <Text style={styles.infoLabel}>Bu atığı şu kutuya atın:</Text>
                    <Text style={[styles.binName, { color: binInfo.hexColor }]}>
                        {binInfo.color} - {binInfo.name}
                    </Text>
                    <Text style={styles.binDescription}>
                        Lütfen atığınızı doğru kutuya atın
                    </Text>
                </View>

                {isDuplicate ? (
                    <View style={styles.warningBox}>
                        <Text style={styles.warningTitle}>⚠️ Tekrar Tarama</Text>
                        <Text style={styles.warningText}>
                            Bu atığı daha önce taradınız. Puan kazanmadınız.
                        </Text>
                    </View>
                ) : (
                    <View style={styles.successBox}>
                        <Text style={styles.successText}>
                            🎉 +{scan.pointsEarned} Puan Kazandınız!
                        </Text>
                    </View>
                )}

                <Button
                    title="Yeni Tarama"
                    onPress={() => navigation.navigate('ScanCamera')}
                    variant="primary"
                />

                <View style={{ height: 12 }} />

                <Button
                    title="Ana Sayfa"
                    onPress={() => navigation.navigate('Home')}
                    variant="outline"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    binCircle: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    emoji: {
        fontSize: 64,
    },
    wasteType: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
    },
    infoBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: 24,
        marginBottom: 24,
        width: '100%',
    },
    infoLabel: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 8,
    },
    binName: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    binDescription: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
    },
    warningBox: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FCD34D',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    warningTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#92400E',
        textAlign: 'center',
    },
    warningText: {
        fontSize: 14,
        color: '#B45309',
        textAlign: 'center',
        marginTop: 4,
    },
    successBox: {
        backgroundColor: '#D1FAE5',
        borderWidth: 1,
        borderColor: '#6EE7B7',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },
    successText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#065F46',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#6B7280',
    },
});
