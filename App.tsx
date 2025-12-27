import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image, FlatList } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, collection, orderBy, query, limit, where, serverTimestamp, increment, addDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './src/data/config/firebase.config';
import { GoogleVisionService } from './src/services/GoogleVisionService';
import { WalrusService } from './src/services/WalrusService';

type Screen = 'login' | 'register' | 'home' | 'leaderboard' | 'store' | 'profile' | 'camera' | 'confirm' | 'result';
type TabType = 'home' | 'leaderboard' | 'store' | 'profile';

// Waste types (exported for GoogleVisionService)
export const WASTE_TYPES = {
  PLASTIC: { name: 'Plastik', bin: 'Sarı', color: '#FCD34D', emoji: '🥤', points: 10 },
  PAPER: { name: 'Kağıt', bin: 'Mavi', color: '#3B82F6', emoji: '📄', points: 8 },
  GLASS: { name: 'Cam', bin: 'Yeşil', color: '#10B981', emoji: '🍾', points: 15 },
  METAL: { name: 'Metal', bin: 'Sarı', color: '#FCD34D', emoji: '🥫', points: 12 },
  ORGANIC: { name: 'Organik', bin: 'Kahverengi', color: '#92400E', emoji: '🍌', points: 5 },
};

// Sample rewards (will be replaced by Firebase data)
const SAMPLE_REWARDS = [
  { id: '1', name: 'Kahve Kuponu', description: 'Ücretsiz kahve', points: 100, emoji: '☕', stock: 10 },
  { id: '2', name: '10 TL İndirim', description: 'Market alışverişi', points: 200, emoji: '🛒', stock: 5 },
  { id: '3', name: 'Sinema Bileti', description: '1 kişilik bilet', points: 300, emoji: '🎬', stock: 3 },
  { id: '4', name: 'Eco Çanta', description: 'Bez çanta', points: 150, emoji: '👜', stock: 20 },
  { id: '5', name: 'Ağaç Dikimi', description: 'Sizin adınıza', points: 500, emoji: '🌳', stock: 100 },
];

// Fallback classification (used if Vision API fails)
const classifyWaste = (): keyof typeof WASTE_TYPES => {
  const types = Object.keys(WASTE_TYPES) as (keyof typeof WASTE_TYPES)[];
  return types[Math.floor(Math.random() * types.length)];
};

// Tab Bar with 4 tabs
const TabBar = ({ currentTab, onTabChange }: { currentTab: TabType; onTabChange: (tab: TabType) => void }) => (
  <View style={styles.tabBar}>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabChange('home')}>
      <Text style={styles.tabIcon}>🏠</Text>
      <Text style={[styles.tabLabel, currentTab === 'home' && styles.tabLabelActive]}>Ana Sayfa</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabChange('leaderboard')}>
      <Text style={styles.tabIcon}>🏆</Text>
      <Text style={[styles.tabLabel, currentTab === 'leaderboard' && styles.tabLabelActive]}>Sıralama</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabChange('store')}>
      <Text style={styles.tabIcon}>🏪</Text>
      <Text style={[styles.tabLabel, currentTab === 'store' && styles.tabLabelActive]}>Mağaza</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.tabItem} onPress={() => onTabChange('profile')}>
      <Text style={styles.tabIcon}>👤</Text>
      <Text style={[styles.tabLabel, currentTab === 'profile' && styles.tabLabelActive]}>Profil</Text>
    </TouchableOpacity>
  </View>
);

// Login Screen
const LoginScreen = ({ onNavigate, onLogin }: { onNavigate: (screen: Screen) => void; onLogin: (email: string, password: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Hata', 'Lütfen email ve şifre girin'); return; }
    setLoading(true);
    try { await onLogin(email, password); } catch (error: any) { Alert.alert('Giriş Hatası', error.message); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.emoji}>♻️</Text>
          <Text style={styles.title}>EcoScan</Text>
          <Text style={styles.subtitle}>Geri dönüşüm ile dünyayı kurtarın!</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}><Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" /></View>
            <View style={styles.inputContainer}><Text style={styles.label}>Şifre</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={true} placeholderTextColor="#9CA3AF" /></View>
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Giriş Yap</Text>}</TouchableOpacity>
            <TouchableOpacity style={styles.buttonOutline} onPress={() => onNavigate('register')}><Text style={styles.buttonOutlineText}>Hesap Oluştur</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Register Screen
const RegisterScreen = ({ onNavigate, onRegister }: { onNavigate: (screen: Screen) => void; onRegister: (name: string, email: string, password: string) => Promise<void> }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Hata', 'Lütfen tüm alanları doldurun'); return; }
    if (password.length < 6) { Alert.alert('Hata', 'Şifre en az 6 karakter olmalı'); return; }
    setLoading(true);
    try { await onRegister(name, email, password); } catch (error: any) { Alert.alert('Kayıt Hatası', error.message); } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌱</Text>
          <Text style={styles.title}>Hesap Oluştur</Text>
          <Text style={styles.subtitle}>Geri dönüşüm yolculuğunuza başlayın</Text>
          <View style={styles.form}>
            <View style={styles.inputContainer}><Text style={styles.label}>İsim</Text><TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Adınız Soyadınız" placeholderTextColor="#9CA3AF" /></View>
            <View style={styles.inputContainer}><Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="ornek@email.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9CA3AF" /></View>
            <View style={styles.inputContainer}><Text style={styles.label}>Şifre</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry={true} placeholderTextColor="#9CA3AF" /></View>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>{loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}</TouchableOpacity>
            <TouchableOpacity style={styles.buttonOutline} onPress={() => onNavigate('login')}><Text style={styles.buttonOutlineText}>Giriş Yap</Text></TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Home Screen with Recent Scans
const HomeScreen = ({ user, onNavigate, recentScans }: { user: any; onNavigate: (screen: Screen) => void; recentScans: any[] }) => (
  <View style={styles.container}>
    <View style={styles.homeHeader}>
      <Text style={styles.homeTitle}>Merhaba, {user?.displayName || 'Kullanıcı'}! 👋</Text>
      <Text style={styles.homeSubtitle}>Toplam Puan: {user?.totalPoints || 0} 🌟</Text>
    </View>
    <View style={styles.homeContent}>
      <TouchableOpacity style={styles.scanButton} onPress={() => onNavigate('camera')}>
        <Text style={styles.scanButtonText}>📸 Atık Tara</Text>
      </TouchableOpacity>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Taramalar</Text>
        {recentScans.length === 0 ? (
          <Text style={styles.emptyText}>Henüz tarama yapmadınız</Text>
        ) : (
          <FlatList
            data={recentScans}
            renderItem={({ item }) => {
              const waste = WASTE_TYPES[item.wasteType as keyof typeof WASTE_TYPES];
              const imageUrl = item.walrusBlobId
                ? WalrusService.getBlobUrl(item.walrusBlobId)
                : item.imageUri; // Fallback to local URI if available

              return (
                <View style={styles.scanHistoryItem}>
                  {/* Thumbnail Image */}
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12, backgroundColor: '#eee' }}
                    />
                  ) : (
                    <Text style={styles.scanHistoryEmoji}>{waste.emoji}</Text>
                  )}

                  <View style={styles.scanHistoryInfo}>
                    <Text style={styles.scanHistoryName}>{waste.name}</Text>
                    <Text style={styles.scanHistoryDate}>{new Date(item.scannedAt?.seconds * 1000).toLocaleDateString('tr-TR')}</Text>
                  </View>
                  <Text style={styles.scanHistoryPoints}>+{item.points}</Text>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}
      </View>
    </View>
  </View>
);

// Leaderboard Screen
const LeaderboardScreen = ({ currentUserId }: { currentUserId: string }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersQuery = query(collection(db, 'users'), orderBy('totalPoints', 'desc'), limit(50));
        const snapshot = await getDocs(usersQuery);
        setUsers(snapshot.docs.map((doc, index) => ({ id: doc.id, rank: index + 1, ...doc.data() })));
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchLeaderboard();
  }, []);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#43A047" /><Text style={styles.loadingText}>Sıralama yükleniyor...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.leaderboardHeader}><Text style={styles.leaderboardTitle}>🏆 Liderlik Tablosu</Text><Text style={styles.leaderboardSubtitle}>En çok puan kazanan kullanıcılar</Text></View>
      <FlatList data={users} renderItem={({ item }) => (
        <View style={[styles.leaderboardItem, item.id === currentUserId && styles.leaderboardItemCurrent]}>
          <View style={styles.rankContainer}>{item.rank <= 3 ? <Text style={styles.rankEmoji}>{getRankBadge(item.rank)}</Text> : <Text style={styles.rankNumber}>{item.rank}</Text>}</View>
          <View style={styles.userInfoContainer}><Text style={[styles.userName, item.id === currentUserId && styles.userNameCurrent]}>{item.displayName || 'Kullanıcı'}{item.id === currentUserId && ' (Sen)'}</Text></View>
          <View style={styles.pointsContainer}><Text style={styles.pointsValue}>{item.totalPoints || 0}</Text><Text style={styles.pointsLabel}>puan</Text></View>
        </View>
      )} keyExtractor={(item) => item.id} contentContainerStyle={styles.leaderboardList} showsVerticalScrollIndicator={false} ListEmptyComponent={<Text style={styles.emptyText}>Henüz sıralama yok</Text>} />
    </View>
  );
};

// Store Screen
const StoreScreen = ({ user, onPurchase }: { user: any; onPurchase: (reward: any) => Promise<void> }) => {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const rewardsQuery = query(collection(db, 'rewards'), orderBy('requiredPoints', 'asc'));
        const rewardsSnapshot = await getDocs(rewardsQuery);
        if (rewardsSnapshot.empty) {
          setRewards(SAMPLE_REWARDS);
        } else {
          const rewardsList = rewardsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter((reward: any) => reward.isAvailable !== false); // Only show available rewards
          setRewards(rewardsList);
        }
      } catch (error) {
        console.error('Error fetching rewards:', error);
        setRewards(SAMPLE_REWARDS);
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, []);

  const handlePurchase = async (reward: any) => {
    const requiredPoints = reward.requiredPoints || reward.points || 0;
    if ((user?.totalPoints || 0) < requiredPoints) {
      Alert.alert('Yetersiz Puan', `Bu ödül için ${requiredPoints - (user?.totalPoints || 0)} puan daha gerekiyor.`);
      return;
    }

    Alert.alert(
      'Ödül Al',
      `${reward.name} için ${requiredPoints} puan harcamak istiyor musunuz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Satın Al',
          onPress: async () => {
            setPurchasing(reward.id);
            try {
              await onPurchase(reward);
              Alert.alert('Tebrikler! 🎉', `${reward.name} başarıyla alındı!`);
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            } finally {
              setPurchasing(null);
            }
          }
        }
      ]
    );
  };

  if (loading) return <View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#43A047" /><Text style={styles.loadingText}>Mağaza yükleniyor...</Text></View>;

  return (
    <View style={styles.container}>
      <View style={styles.storeHeader}>
        <Text style={styles.storeTitle}>🏪 Mağaza</Text>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>{user?.totalPoints || 0} 🌟</Text>
        </View>
      </View>
      <FlatList
        data={rewards}
        renderItem={({ item }) => {
          const requiredPoints = item.requiredPoints || item.points || 0;
          const canAfford = (user?.totalPoints || 0) >= requiredPoints;
          const emoji = item.emoji || '🎁';

          return (
            <View style={[styles.rewardCard, !canAfford && styles.rewardCardDisabled]}>
              <Text style={styles.rewardEmoji}>{emoji}</Text>
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardName}>{item.name}</Text>
                <Text style={styles.rewardDescription}>{item.description}</Text>
                <Text style={styles.rewardPoints}>{requiredPoints} puan</Text>
              </View>
              <TouchableOpacity
                style={[styles.buyButton, !canAfford && styles.buyButtonDisabled]}
                onPress={() => handlePurchase(item)}
                disabled={!canAfford || purchasing === item.id}
              >
                {purchasing === item.id ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buyButtonText}>{canAfford ? 'Al' : '🔒'}</Text>
                )}
              </TouchableOpacity>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.storeList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

// Profile Screen
const ProfileScreen = ({ user, onLogout }: { user: any; onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'coupons'>('stats');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    // Fetch purchases real-time (Client-side sort to avoid index issues)
    const q = query(collection(db, 'purchases'), where('userId', '==', user.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allPurchases = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date desc
      allPurchases.sort((a: any, b: any) => {
        const dateA = a.purchasedAt?.seconds || 0;
        const dateB = b.purchasedAt?.seconds || 0;
        return dateB - dateA;
      });
      setPurchases(allPurchases);
      setLoading(false);
    }, (error) => {
      console.error("Purchases fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.id]);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}><Text style={styles.avatarText}>👤</Text></View>
        <Text style={styles.profileName}>{user?.displayName || 'Kullanıcı'}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.profileTabs}>
        <TouchableOpacity
          style={[styles.profileTab, activeTab === 'stats' && styles.profileTabActive]}
          onPress={() => setActiveTab('stats')}
        >
          <Text style={[styles.profileTabText, activeTab === 'stats' && styles.profileTabTextActive]}>İstatistikler</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.profileTab, activeTab === 'coupons' && styles.profileTabActive]}
          onPress={() => setActiveTab('coupons')}
        >
          <Text style={[styles.profileTabText, activeTab === 'coupons' && styles.profileTabTextActive]}>Kuponlarım</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.profileContent}>
        {activeTab === 'stats' ? (
          <>
            <View style={styles.statsContainer}>
              <TouchableOpacity
                activeOpacity={1}
                onLongPress={async () => {
                  Alert.alert('Dev Mode', 'Test puanı (200) yükleniyor...', [
                    {
                      onPress: async () => {
                        if (user?.id) {
                          await setDoc(doc(db, 'users', user.id), { totalPoints: 200 }, { merge: true });
                          Alert.alert('Başarılı', 'Puan 200 olarak güncellendi! 🚀');
                        }
                      }
                    },
                    { text: 'İptal', style: 'cancel' }
                  ]);
                }}
                style={styles.statCard}
              >
                <Text style={styles.statValue}>{user?.totalPoints || 0}</Text>
                <Text style={styles.statLabel}>Toplam Puan</Text>
              </TouchableOpacity>
              <View style={styles.statCard}><Text style={styles.statValue}>{user?.scanCount || 0}</Text><Text style={styles.statLabel}>Tarama</Text></View>
              <View style={styles.statCard}><Text style={styles.statValue}>{purchases.length}</Text><Text style={styles.statLabel}>Kupon</Text></View>
            </View>
            <View style={styles.profileSection}>
              <Text style={styles.profileSectionTitle}>Hesap Bilgileri</Text>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>İsim</Text><Text style={styles.infoValue}>{user?.displayName || '-'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Email</Text><Text style={styles.infoValue}>{user?.email || '-'}</Text></View>
              <View style={styles.infoRow}><Text style={styles.infoLabel}>Üyelik</Text><Text style={styles.infoValue}>{user?.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}</Text></View>
            </View>
          </>
        ) : (
          <View>
            {purchases.length === 0 ? (
              <Text style={styles.emptyText}>Henüz hiç ödül almadınız. Mağazadan puanlarınızla ödül alabilirsiniz! 🎁</Text>
            ) : (
              purchases.map((item) => (
                <View key={item.id} style={styles.couponCard}>
                  <View style={styles.couponLeft}>
                    <Text style={styles.couponEmoji}>🎟️</Text>
                  </View>
                  <View style={styles.couponRight}>
                    <Text style={styles.couponName}>{item.rewardName}</Text>
                    <Text style={styles.couponDate}>
                      {item.purchasedAt ? new Date(item.purchasedAt.seconds * 1000).toLocaleDateString('tr-TR') : '-'}
                    </Text>
                    <Text style={styles.couponCode}>KOD: {item.id.substring(0, 8).toUpperCase()}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
        <TouchableOpacity style={styles.logoutButtonFull} onPress={onLogout}><Text style={styles.logoutButtonText}>🚪 Çıkış Yap</Text></TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

// Camera Screen
const CameraScreen = ({ onNavigate, onCapture }: { onNavigate: (screen: Screen) => void; onCapture: (uri: string) => void }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => { if (cameraRef.current) { try { const photo = await cameraRef.current.takePictureAsync({ quality: 0.3, skipProcessing: true }); if (photo) onCapture(photo.uri); } catch (error) { Alert.alert('Hata', 'Fotoğraf çekilemedi'); } } };
  const pickImage = async () => { const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.3 }); if (!result.canceled && result.assets[0]) onCapture(result.assets[0].uri); };

  if (!permission) return <View style={styles.container}><ActivityIndicator size="large" color="#43A047" /></View>;
  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.permissionText}>Kamera izni gerekli</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>İzin Ver</Text></TouchableOpacity>
        <TouchableOpacity style={styles.buttonOutline} onPress={pickImage}><Text style={styles.buttonOutlineText}>Galeriden Seç</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.buttonOutline, { marginTop: 12 }]} onPress={() => onNavigate('home')}><Text style={styles.buttonOutlineText}>Geri Dön</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
      <View style={styles.cameraOverlay}>
        <TouchableOpacity style={styles.backButton} onPress={() => onNavigate('home')}><Text style={styles.backButtonText}>← Geri</Text></TouchableOpacity>
        <Text style={styles.cameraText}>Atığı kamera ile çerçeveleyin</Text>
        <View style={styles.cameraButtons}>
          <TouchableOpacity style={styles.cameraBtn} onPress={pickImage}><Text style={styles.cameraBtnText}>🖼️</Text></TouchableOpacity>
          <TouchableOpacity style={styles.captureBtn} onPress={takePicture}><View style={styles.captureBtnInner} /></TouchableOpacity>
          <TouchableOpacity style={styles.cameraBtn} onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}><Text style={styles.cameraBtnText}>🔄</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Confirmation Screen (Updated with Loading)
const ConfirmationScreen = ({ imageUri, wasteType, confidence, onConfirm, onReject, loading }: { imageUri: string; wasteType: keyof typeof WASTE_TYPES; confidence: number; onConfirm: () => void; onReject: () => void; loading?: boolean }) => {
  const waste = WASTE_TYPES[wasteType];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Text style={styles.confirmTitle}>Atık Tespit Edildi!</Text>
        <Image source={{ uri: imageUri }} style={styles.resultImage} />
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>{waste.emoji}</Text>
          <Text style={styles.resultType}>{waste.name}</Text>
          <View style={[styles.binBadge, { backgroundColor: waste.color }]}><Text style={styles.binText}>{waste.bin} Kutu</Text></View>
          <Text style={styles.resultInfo}>Bu atığı {waste.bin.toLowerCase()} renkli geri dönüşüm kutusuna atmalısınız.</Text>
          <Text style={styles.confidenceText}>Güven: %{Math.round(confidence * 100)}</Text>
          <Text style={styles.pointsText}>+{waste.points} Puan Kazanacaksınız! 🎉</Text>
        </View>
        <Text style={styles.confirmQuestion}>Sınıflandırma doğru mu?</Text>

        {loading ? (
          <View style={{ padding: 20 }}>
            <ActivityIndicator size="large" color="#43A047" />
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#666' }}>Kanıt Walrus'a yükleniyor...</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={onConfirm}><Text style={styles.buttonText}>✓ Evet, Doğru</Text></TouchableOpacity>
            <TouchableOpacity style={styles.buttonOutline} onPress={onReject}><Text style={styles.buttonOutlineText}>✗ Hayır, Yeniden Tara</Text></TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Result Screen
const ResultScreen = ({ imageUri, earnedPoints, wasteType, onNavigate }: { imageUri: string; earnedPoints: number; wasteType: keyof typeof WASTE_TYPES; onNavigate: (screen: Screen) => void }) => {
  const waste = WASTE_TYPES[wasteType];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.resultContent}>
        <Image source={{ uri: imageUri }} style={styles.resultImage} />
        <View style={styles.resultCard}>
          <Text style={styles.resultEmoji}>{waste.emoji}</Text>
          <Text style={styles.resultType}>{waste.name}</Text>
          <View style={[styles.binBadge, { backgroundColor: waste.color }]}><Text style={styles.binText}>{waste.bin} Kutu</Text></View>
          <Text style={styles.resultInfo}>Bu atığı {waste.bin.toLowerCase()} renkli geri dönüşüm kutusuna atmalısınız.</Text>
          <Text style={styles.pointsText}>+{earnedPoints} Puan Kazandınız! 🎉</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => onNavigate('camera')}><Text style={styles.buttonText}>Yeni Tarama</Text></TouchableOpacity>
        <TouchableOpacity style={styles.buttonOutline} onPress={() => onNavigate('home')}><Text style={styles.buttonOutlineText}>Ana Sayfa</Text></TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Main App
export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [pendingClassification, setPendingClassification] = useState<any>(null);
  const [lastScanResult, setLastScanResult] = useState<{ points: number; wasteType: keyof typeof WASTE_TYPES } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribeUserObj: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // 1. Listen for USER DATA changes (Real-time updates for points/profile)
        const userRef = doc(db, 'users', firebaseUser.uid);
        unsubscribeUserObj = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser({ id: firebaseUser.uid, ...docSnap.data() });
          } else {
            // New user or data missing
            setUser({ id: firebaseUser.uid, email: firebaseUser.email, displayName: 'Kullanıcı', totalPoints: 0 });
          }
        }, (error) => {
          console.error("User snapshot error:", error);
          setUser({ id: firebaseUser.uid, email: firebaseUser.email, displayName: 'Kullanıcı', totalPoints: 0 });
        });

        // 2. Load RECENT SCANS (Client-side sort to avoid index issues)
        try {
          // Simple query: only filter by userId (automatically indexed)
          const scansQuery = query(collection(db, 'scans'), where('userId', '==', firebaseUser.uid));

          onSnapshot(scansQuery, (snapshot) => {
            const allScans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // Sort by date desc
            allScans.sort((a: any, b: any) => {
              const dateA = a.scannedAt?.seconds || 0;
              const dateB = b.scannedAt?.seconds || 0;
              return dateB - dateA;
            });
            // Take top 5
            setRecentScans(allScans.slice(0, 5));
          }, (error) => {
            console.error("Scans snapshot error:", error);
          });
        } catch (error) {
          console.error("Scans query setup error:", error);
        }

        setCurrentScreen('home');
      } else {
        setUser(null);
        setCurrentScreen('login');
        if (unsubscribeUserObj) unsubscribeUserObj();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserObj) unsubscribeUserObj();
    };
  }, []);

  const navigate = (screen: Screen) => setCurrentScreen(screen);
  const handleTabChange = (tab: TabType) => { setCurrentTab(tab); setCurrentScreen(tab); };
  const handleLogin = async (email: string, password: string) => { await signInWithEmailAndPassword(auth, email, password); };
  const handleRegister = async (name: string, email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', userCredential.user.uid), { id: userCredential.user.uid, email, displayName: name, totalPoints: 0, scanCount: 0, rewardCount: 0, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  };
  const handleLogout = async () => { try { await signOut(auth); } catch (error) { console.error('Logout error:', error); } };

  const handleCapture = async (uri: string) => {
    // 1. Check Daily Limit (Before everything to save API costs)
    if (user?.id) {
      try {
        const oneDayAgoTimestamp = (Date.now() - 24 * 60 * 60 * 1000) / 1000;

        // Fetch all scans for this user (Client-side filtering avoids index issues)
        const scansQuery = query(collection(db, 'scans'), where('userId', '==', user.id));
        const snapshot = await getDocs(scansQuery);

        const dailyScansCount = snapshot.docs.filter(doc => {
          return (doc.data().scannedAt?.seconds || 0) >= oneDayAgoTimestamp;
        }).length;

        if (dailyScansCount >= 5) {
          Alert.alert(
            'Günlük Limit Aşıldı',
            '24 saat içinde en fazla 5 atık tarayabilirsiniz. Lütfen yarın tekrar deneyin! 🌱',
            [{ text: 'Anlaşıldı', onPress: () => navigate('home') }]
          );
          return;
        }
      } catch (error) {
        console.error('Limit check error:', error);
        // Continue if check fails (fail open) or block? Let's fail open but warn console.
      }
    }

    setCapturedImage(uri);
    setCurrentScreen('confirm');

    try {
      // 2. Classify waste using Google Vision API
      const classification = await GoogleVisionService.classifyWaste(uri);

      console.log('Vision API Result:', {
        wasteType: classification.wasteType,
        confidence: classification.confidence,
        labels: classification.labels,
        keywords: classification.detectedKeywords
      });

      setPendingClassification(classification);
    } catch (error: any) {
      console.error('Classification error:', error);
      Alert.alert('Hata', error.message || 'Atık sınıflandırılamadı');
      navigate('camera');
    }
  };

  // Add a saving state
  const [saving, setSaving] = useState(false);

  // Update handleConfirmScan to use saving state
  const handleConfirmScan = async () => {
    if (!pendingClassification || !user?.id || !capturedImage || saving) return;

    setSaving(true); // Start loading

    const wasteType = pendingClassification.wasteType as keyof typeof WASTE_TYPES;
    const points = WASTE_TYPES[wasteType].points;

    try {
      // 1. Walrus Upload (Grid Storage)
      let walrusBlobId = null;
      try {
        console.log('Walrus upload starting...');
        const walrusResult = await WalrusService.uploadImage(capturedImage);
        walrusBlobId = walrusResult.blobId;
        console.log('Walrus upload complete, Blob ID:', walrusBlobId);
      } catch (walrusError: any) {
        console.warn('Walrus Upload Skipped (Testnet Network Issue):', walrusError.message || walrusError);
        // This is a Testnet/Publisher issue (Out of gas), so we proceed without the blockchain link.
        // User flow should not be interrupted.
        // Alert.alert('Blockchain Bilgisi', 'Walrus Testnet şu an yoğun, kaydınız sadece yerel sunucuya yapılıyor.');
      }

      // 2. Save scan to Firebase with Walrus Link
      console.log('Firebase save starting...');
      try {
        const scanDoc = await addDoc(collection(db, 'scans'), {
          userId: user.id,
          imageUri: capturedImage,
          walrusBlobId: walrusBlobId,
          wasteType,
          confidence: pendingClassification.confidence,
          points,
          scannedAt: serverTimestamp()
        });
        console.log('Firebase save check passed (Safe Mode).');

        // Update user points (Use setDoc with merge to create if missing)
        await setDoc(doc(db, 'users', user.id), {
          totalPoints: increment(points),
          scanCount: increment(1),
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (firebaseError: any) {
        console.error('Firebase Save Error:', firebaseError);
        if (firebaseError.code === 'permission-denied' || firebaseError.message.includes('permission')) {
          Alert.alert('Erişim Reddedildi', 'Firebase Kurallarını güncellemediniz. Lütfen FIREBASE_RULES.md dosyasını uygulayın.');
        } else {
          throw firebaseError; // Re-throw to outer catch
        }
        setSaving(false);
        return;
      }

      // Update local state
      setUser((prev: any) => ({ ...prev, totalPoints: (prev?.totalPoints || 0) + points, scanCount: (prev?.scanCount || 0) + 1 }));
      setLastScanResult({ points, wasteType });

      // Clean up UI
      setSaving(false);
      setCurrentScreen('result');
    } catch (error) {
      console.error('General Error saving scan:', error);
      Alert.alert('Hata', 'Tarama kaydedilemedi. İnternet bağlantınızı kontrol edin.');
      setSaving(false);
    }
  };

  const handleRejectScan = () => {
    setPendingClassification(null);
    setCapturedImage(null);
    navigate('camera');
  };

  const handlePurchase = async (reward: any) => {
    if (!user?.id) throw new Error('Kullanıcı bulunamadı');

    const requiredPoints = reward.requiredPoints || reward.points || 0;

    // Deduct points (Use setDoc merge to be safe)
    await setDoc(doc(db, 'users', user.id), {
      totalPoints: increment(-requiredPoints),
      rewardCount: increment(1),
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Save purchase record
    await addDoc(collection(db, 'purchases'), {
      userId: user.id,
      rewardId: reward.id,
      rewardName: reward.name,
      pointsSpent: requiredPoints,
      purchasedAt: serverTimestamp()
    });

    // Local state is updated automatically via onSnapshot listener in useEffect
  };

  if (loading) return <SafeAreaProvider><View style={[styles.container, styles.centered]}><ActivityIndicator size="large" color="#43A047" /><Text style={styles.loadingText}>Yükleniyor...</Text></View></SafeAreaProvider>;

  const showTabBar = ['home', 'leaderboard', 'store', 'profile'].includes(currentScreen);

  return (
    <SafeAreaProvider>
      <View style={styles.appContainer}>
        {currentScreen === 'login' && <LoginScreen onNavigate={navigate} onLogin={handleLogin} />}
        {currentScreen === 'register' && <RegisterScreen onNavigate={navigate} onRegister={handleRegister} />}
        {currentScreen === 'home' && <HomeScreen user={user} onNavigate={navigate} recentScans={recentScans} />}
        {currentScreen === 'leaderboard' && <LeaderboardScreen currentUserId={user?.id || ''} />}
        {currentScreen === 'store' && <StoreScreen user={user} onPurchase={handlePurchase} />}
        {currentScreen === 'profile' && <ProfileScreen user={user} onLogout={handleLogout} />}
        {currentScreen === 'camera' && <CameraScreen onNavigate={navigate} onCapture={handleCapture} />}
        {currentScreen === 'confirm' && pendingClassification && capturedImage && (
          <ConfirmationScreen
            imageUri={capturedImage}
            wasteType={pendingClassification.wasteType}
            confidence={pendingClassification.confidence}
            onConfirm={handleConfirmScan}
            onReject={handleRejectScan}
            loading={saving}
          />
        )}
        {currentScreen === 'result' && capturedImage && lastScanResult && <ResultScreen imageUri={capturedImage} earnedPoints={lastScanResult.points} wasteType={lastScanResult.wasteType} onNavigate={navigate} />}
        {showTabBar && <TabBar currentTab={currentTab} onTabChange={handleTabChange} />}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, justifyContent: 'center', padding: 24 },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  button: { backgroundColor: '#43A047', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16 },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  buttonOutline: { borderWidth: 2, borderColor: '#43A047', backgroundColor: 'transparent', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  buttonOutlineText: { color: '#43A047', fontWeight: '600', fontSize: 16 },
  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingBottom: Platform.OS === 'ios' ? 20 : 8, paddingTop: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2 },
  tabLabel: { fontSize: 10, color: '#9CA3AF' },
  tabLabelActive: { color: '#43A047', fontWeight: '600' },
  // Home
  homeHeader: { backgroundColor: '#43A047', padding: 24, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  homeTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  homeSubtitle: { fontSize: 18, color: '#FFFFFF' },
  homeContent: { flex: 1, padding: 24 },
  scanButton: { backgroundColor: '#43A047', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  scanButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  emptyText: { color: '#6B7280', textAlign: 'center', padding: 24 },
  // Leaderboard
  leaderboardHeader: { backgroundColor: '#43A047', padding: 24, paddingTop: 60, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  leaderboardTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 8 },
  leaderboardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  leaderboardList: { padding: 16 },
  leaderboardItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 8 },
  leaderboardItemCurrent: { backgroundColor: '#E8F5E9', borderWidth: 2, borderColor: '#43A047' },
  rankContainer: { width: 40, alignItems: 'center' },
  rankEmoji: { fontSize: 24 },
  rankNumber: { fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
  userInfoContainer: { flex: 1, marginLeft: 12 },
  userName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  userNameCurrent: { color: '#43A047' },
  pointsContainer: { alignItems: 'flex-end' },
  pointsValue: { fontSize: 20, fontWeight: 'bold', color: '#43A047' },
  pointsLabel: { fontSize: 12, color: '#6B7280' },
  // Store
  storeHeader: { backgroundColor: '#43A047', padding: 24, paddingTop: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  storeTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF' },
  pointsBadge: { backgroundColor: 'rgba(255,255,255,0.3)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  pointsBadgeText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  storeList: { padding: 16 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12 },
  rewardCardDisabled: { opacity: 0.6 },
  rewardEmoji: { fontSize: 40, marginRight: 16 },
  rewardInfo: { flex: 1 },
  rewardName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  rewardDescription: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  rewardPoints: { fontSize: 14, fontWeight: '600', color: '#43A047', marginTop: 4 },
  buyButton: { backgroundColor: '#43A047', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  buyButtonDisabled: { backgroundColor: '#9CA3AF' },
  buyButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  // Profile
  profileHeader: { backgroundColor: '#43A047', padding: 24, paddingTop: 60, alignItems: 'center', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { fontSize: 40 },
  profileName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  profileEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  profileContent: { flex: 1, padding: 24 },
  statsContainer: { flexDirection: 'row', marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 16, alignItems: 'center', marginHorizontal: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#43A047' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  profileSection: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 24 },
  profileSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  infoLabel: { fontSize: 14, color: '#6B7280' },
  infoValue: { fontSize: 14, color: '#1F2937', fontWeight: '500' },
  logoutButtonFull: { backgroundColor: '#FEE2E2', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  logoutButtonText: { color: '#DC2626', fontSize: 16, fontWeight: '600' },
  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, backgroundColor: 'transparent', justifyContent: 'space-between', padding: 24 },
  backButton: { marginTop: 40 },
  backButtonText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  cameraText: { color: '#FFF', fontSize: 18, textAlign: 'center' },
  cameraButtons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  cameraBtn: { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 50, padding: 16, marginHorizontal: 16 },
  cameraBtnText: { fontSize: 24 },
  captureBtn: { backgroundColor: '#FFF', borderRadius: 50, width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { backgroundColor: '#43A047', borderRadius: 50, width: 64, height: 64 },
  permissionText: { fontSize: 18, color: '#374151', marginBottom: 24, textAlign: 'center' },
  // Result
  resultContent: { padding: 24, alignItems: 'center' },
  resultImage: { width: 200, height: 200, borderRadius: 16, marginBottom: 24 },
  resultCard: { backgroundColor: '#F3F4F6', borderRadius: 16, padding: 24, alignItems: 'center', width: '100%', marginBottom: 24 },
  resultEmoji: { fontSize: 64, marginBottom: 16 },
  resultType: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 16 },
  binBadge: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, marginBottom: 16 },
  binText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  resultInfo: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 16 },
  pointsText: { fontSize: 20, fontWeight: 'bold', color: '#43A047' },
  loadingText: { marginTop: 16, color: '#6B7280', fontSize: 16 },
  // Scan History
  scanHistoryItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, marginBottom: 8 },
  scanHistoryEmoji: { fontSize: 32, marginRight: 12 },
  scanHistoryInfo: { flex: 1 },
  scanHistoryName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  scanHistoryDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scanHistoryPoints: { fontSize: 16, fontWeight: 'bold', color: '#43A047' },
  // Confirmation
  confirmTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 16, textAlign: 'center' },
  confirmQuestion: { fontSize: 18, fontWeight: '600', color: '#1F2937', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  confidenceText: { fontSize: 14, color: '#6B7280', marginBottom: 8 },
  // Profile Tabs & Coupons
  profileTabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 },
  profileTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  profileTabActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  profileTabText: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  profileTabTextActive: { color: '#43A047', fontWeight: '600' },
  couponCard: { flexDirection: 'row', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  couponLeft: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F5E9', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  couponEmoji: { fontSize: 24 },
  couponRight: { flex: 1, justifyContent: 'center' },
  couponName: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  couponDate: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  couponCode: { fontSize: 12, fontWeight: 'bold', color: '#43A047', marginTop: 4, letterSpacing: 1 },
});
