# Google Cloud Vision API Kurulum Rehberi

## 1️⃣ Google Cloud Console'da API Key Oluşturma

### Adım 1: Google Cloud Console'a Git
👉 [https://console.cloud.google.com](https://console.cloud.google.com)

### Adım 2: Yeni Proje Oluştur (veya mevcut Firebase projesini kullan)
1. Üst menüden proje seçici → **"New Project"**
2. Proje adı: `EcoScan` (veya Firebase projenizi seçin)
3. **"Create"**

### Adım 3: Vision API'yi Etkinleştir
1. Sol menü → **"APIs & Services"** → **"Library"**
2. Arama: `Cloud Vision API`
3. **"Cloud Vision API"** seçin
4. **"Enable"** tıklayın

### Adım 4: API Key Oluştur
1. Sol menü → **"APIs & Services"** → **"Credentials"**
2. **"+ CREATE CREDENTIALS"** → **"API key"**
3. API key kopyalayın (örn: `AIzaSyC...`)

### Adım 5: API Key'i Kısıtla (Güvenlik)
1. Oluşturulan API key'in yanındaki **düzenle** ikonuna tıklayın
2. **"Application restrictions"**:
   - **"HTTP referrers"** seçin (web için)
   - VEYA **"Android apps"** / **"iOS apps"** (mobil için)
3. **"API restrictions"**:
   - **"Restrict key"** seçin
   - **"Cloud Vision API"** seçin
4. **"Save"**

---

## 2️⃣ API Key'i Projeye Ekle

### Seçenek A: Doğrudan Kod İçinde (Geliştirme)
`src/services/GoogleVisionService.ts` dosyasında:
```typescript
const VISION_API_KEY = 'AIzaSyC...'; // Buraya yapıştırın
```

### Seçenek B: Environment Variable (Önerilen)
1. Proje kökünde `.env` dosyası oluşturun:
```
GOOGLE_VISION_API_KEY=AIzaSyC...
```

2. `app.json` içinde:
```json
{
  "expo": {
    "extra": {
      "visionApiKey": process.env.GOOGLE_VISION_API_KEY
    }
  }
}
```

3. Kodda kullanım:
```typescript
import Constants from 'expo-constants';
const VISION_API_KEY = Constants.expoConfig?.extra?.visionApiKey;
```

---

## 3️⃣ Test Etme

### Manuel Test
1. Uygulamayı başlatın: `npx expo start --clear`
2. Kameradan fotoğraf çekin
3. Console'da Vision API yanıtını görün
4. Atık kategorisi doğru mu kontrol edin

### Örnek Yanıt
```json
{
  "wasteType": "PLASTIC",
  "confidence": 0.87,
  "labels": [
    { "description": "plastic bottle", "score": 0.95 },
    { "description": "container", "score": 0.82 }
  ],
  "detectedKeywords": ["plastic bottle", "container"]
}
```

---

## 4️⃣ Fiyatlandırma

**Ücretsiz Kota:**
- İlk 1,000 istek/ay: **ÜCRETSİZ**
- Sonrası: $1.50 / 1,000 istek

**Hackathon için:**
- 1,000 istek yeterli (günde 30-40 test)
- Kredi kartı gerekmiyor (ücretsiz kota için)

---

## 5️⃣ Hata Giderme

### "API key not valid"
- API key doğru kopyalandı mı?
- Vision API etkin mi?

### "Quota exceeded"
- 1,000 istek aşıldı
- Yeni proje oluşturun veya ücretli plana geçin

### "CORS error" (Web)
- API key kısıtlamalarını kontrol edin
- HTTP referrer ekleyin

---

## ✅ Hazır!

API key'i aldıktan sonra:
1. `GoogleVisionService.ts` dosyasına yapıştırın
2. Uygulamayı yeniden başlatın
3. Fotoğraf çekip test edin

🎉 Gerçek AI ile atık sınıflandırması çalışıyor!
