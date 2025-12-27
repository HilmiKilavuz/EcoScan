import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../stores/authStore';
import { useScanStore } from '../../stores/scanStore';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const ScanScreen = ({ navigation }: any) => {
    const [facing, setFacing] = useState<'front' | 'back'>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const { user } = useAuthStore();
    const { classifyWaste, isLoading } = useScanStore();

    const takePicture = async () => {
        if (!cameraRef.current || !user) return;

        try {
            const photo = await cameraRef.current.takePictureAsync();
            if (photo) {
                await classifyWaste(user.id, photo.uri);
                navigation.navigate('ScanResult');
            }
        } catch (error) {
            Alert.alert('Hata', 'Fotoğraf çekilirken bir hata oluştu');
        }
    };

    const pickImage = async () => {
        if (!user) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets[0]) {
            try {
                await classifyWaste(user.id, result.assets[0].uri);
                navigation.navigate('ScanResult');
            } catch (error) {
                Alert.alert('Hata', 'Görsel işlenirken bir hata oluştu');
            }
        }
    };

    if (!permission) {
        return <LoadingSpinner message="Kamera izni bekleniyor..." />;
    }

    if (!permission.granted) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', padding: 24 }}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>📷</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 8, textAlign: 'center' }}>
                    Kamera İzni Gerekli
                </Text>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 }}>
                    Atık taraması yapabilmek için kamera erişimine izin vermeniz gerekiyor.
                </Text>
                <Button
                    title="İzin Ver"
                    onPress={requestPermission}
                    variant="primary"
                />
                <View style={{ height: 12 }} />
                <Button
                    title="Galeriden Seç"
                    onPress={pickImage}
                    variant="outline"
                />
            </View>
        );
    }

    if (isLoading) {
        return <LoadingSpinner message="Atık analiz ediliyor..." />;
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#000' }}>
            <CameraView
                ref={cameraRef}
                style={{ flex: 1 }}
                facing={facing}
            >
                <View style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'flex-end', paddingBottom: 40 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ color: '#FFF', fontSize: 18, marginBottom: 16, textAlign: 'center', paddingHorizontal: 24 }}>
                            Atığı kamera ile çerçeveleyin
                        </Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity
                                onPress={pickImage}
                                style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 50, padding: 16 }}
                            >
                                <Text style={{ color: '#FFF', fontSize: 24 }}>🖼️</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={takePicture}
                                style={{ backgroundColor: '#FFF', borderRadius: 50, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <View style={{ backgroundColor: '#43A047', borderRadius: 50, width: 64, height: 64 }} />
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                                style={{ backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 50, padding: 16 }}
                            >
                                <Text style={{ color: '#FFF', fontSize: 24 }}>🔄</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CameraView>
        </View>
    );
};
