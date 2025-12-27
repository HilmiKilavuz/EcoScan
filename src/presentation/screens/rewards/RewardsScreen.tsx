import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRewardsStore } from '../../stores/rewardsStore';
import { useAuthStore } from '../../stores/authStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Button } from '../../components/common/Button';

export const RewardsScreen = () => {
    const { user } = useAuthStore();
    const { rewards, isLoading, fetchRewards, redeemReward } = useRewardsStore();

    useEffect(() => {
        fetchRewards();
    }, []);

    const handleRedeem = async (rewardId: string) => {
        if (user) {
            await redeemReward(user.id, rewardId);
        }
    };

    if (isLoading) {
        return <LoadingSpinner message="Ödüller yükleniyor..." />;
    }

    const userPoints = user?.totalPoints || 0;

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Ödüller 🎁</Text>
                <Text style={styles.subtitle}>Puanlarınızla ödül kazanın</Text>
                <View style={styles.pointsBox}>
                    <Text style={styles.pointsLabel}>Mevcut Puanınız</Text>
                    <Text style={styles.pointsValue}>{userPoints}</Text>
                </View>
            </View>

            <View style={styles.rewardsContainer}>
                {rewards.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyEmoji}>🎁</Text>
                        <Text style={styles.emptyText}>Henüz ödül bulunmuyor</Text>
                    </View>
                ) : (
                    rewards.map((reward) => {
                        const canAfford = userPoints >= reward.requiredPoints;
                        return (
                            <View key={reward.id} style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}>
                                <View style={styles.rewardIcon}>
                                    <Text style={styles.rewardEmoji}>🎁</Text>
                                </View>
                                <View style={styles.rewardInfo}>
                                    <Text style={styles.rewardName}>{reward.name}</Text>
                                    <Text style={styles.rewardDescription}>{reward.description}</Text>
                                    <Text style={styles.rewardPoints}>{reward.requiredPoints} puan</Text>
                                </View>
                                <Button
                                    title={canAfford ? "Al" : "Yetersiz"}
                                    onPress={() => handleRedeem(reward.id)}
                                    variant={canAfford ? "primary" : "outline"}
                                    disabled={!canAfford}
                                />
                            </View>
                        );
                    })
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
        paddingTop: 60,
        paddingBottom: 32,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    pointsBox: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
    },
    pointsLabel: {
        fontSize: 14,
        color: '#FFFFFF',
    },
    pointsValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    rewardsContainer: {
        padding: 24,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
    },
    rewardCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    rewardCardDisabled: {
        opacity: 0.6,
    },
    rewardIcon: {
        backgroundColor: '#E8F5E9',
        borderRadius: 32,
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    rewardEmoji: {
        fontSize: 32,
    },
    rewardInfo: {
        flex: 1,
    },
    rewardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 4,
    },
    rewardDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    rewardPoints: {
        fontSize: 14,
        color: '#43A047',
        fontWeight: '600',
    },
});
