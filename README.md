# EcoScan ♻️

**EcoScan**, yapay zeka destekli bir geri dönüşüm asistanı ve ödül platformudur. Kullanıcılar atıkların fotoğrafını çekerek onları sınıflandırır, puan kazanır ve bu puanlarla ödüller alır. Çekilen fotoğraflar opsiyonel olarak **Walrus (Sui Network)** üzerinde merkeziyetsiz olarak saklanır.

## 🌟 Özellikler

*   **🤖 AI Destekli Ayrıştırma:** Google Cloud Vision API ile atıkları (Plastik, Kağıt, Cam, Metal, Organik) otomatik tanır.
*   **⛓️ Merkeziyetsiz Kanıt (Walrus):** Atık fotoğraflarınızı **Walrus Testnet** üzerine yükleyerek blok zinciri tabanlı kalıcı ve şeffaf bir kanıt (Blob ID) oluşturur.
*   **🏆 Liderlik Tablosu:** En çok geri dönüşüm yapan kullanıcılar arasında yarışın.
*   **🎁 Ödül Sistemi:** Topladığınız puanlarla mağazadan (ör. Kahve Kuponu, İndirimler) ödüller alın.
*   **📱 Çapraz Platform:** React Native (Expo) ile hem iOS hem Android'de çalışır.
*   **🔒 Güvenli:** Firebase Authentication ve Firestore ile güvenli veri saklama.

## 🛠️ Teknolojiler

*   **Frontend:** React Native, Expo, TypeScript, NativeWind (Tailwind CSS)
*   **Backend / DB:** Firebase (Auth, Firestore)
*   **AI:** Google Cloud Vision API
*   **Decentralized Storage:** Walrus Protocol (Sui Testnet)

## 🚀 Kurulum

Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları izleyin.

### 1. Gereksinimler
*   Node.js (v18+)
*   npm veya yarn
*   Expo Go uygulaması (Telefonda test için)

### 2. Projeyi Klonlayın ve Paketleri Yükleyin

```bash
git clone https://github.com/KULLANICI_ADINIZ/EcoScan.git
cd EcoScan
npm install
```

### 3. Ortam Değişkenlerini Ayarlayın

Projenin kök dizininde `.env` isimli bir dosya oluşturun ve `.env.example` dosyasındaki şablonu kullanarak kendi API anahtarlarınızı girin.

```env
# .env dosyası örneği
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_VISION_API_KEY=AIzaSy...
...
```

> **Not:** Firebase ve Google Cloud Console üzerinden kendi proje anahtarlarınızı almanız gerekmektedir.

### 4. Uygulamayı Başlatın

```bash
npx expo start
```

Terminalde çıkan QR kodu telefonunuzdaki **Expo Go** uygulaması ile taratarak uygulamayı deneyebilirsiniz.

## 📂 Proje Yapısı

*   `src/presentation`: Ekranlar ve UI bileşenleri.
*   `src/services`: Walrus ve Google Vision entegrasyon servisleri.
*   `src/data`: Firebase konfigürasyonu ve veri yönetimi.
*   `src/domain`: Veri modelleri ve tip tanımları.

## 🔗 Walrus Entegrasyonu Hakkında

Bu proje, görüntü verilerini merkeziyetsiz bir şekilde saklamak için **Walrus Protocol** kullanır.
*   Fotoğraflar, "Publishers" aracılığıyla Walrus Testnet'e "Blob" olarak yüklenir.
*   Her yükleme sonucunda bir `blobId` döner ve bu ID Firebase'e kaydedilir.
*   Kullanıcılar "Son Taramalar" ekranında bu ID üzerinden görüntülerini merkeziyetsiz ağdan çekerler.

---

**Lisans:** MIT
**Geliştirici:** Kilav
