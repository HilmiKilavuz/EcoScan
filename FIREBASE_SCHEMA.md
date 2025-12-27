# Firebase Schema Documentation

## Collections Overview

EcoScan uses 5 main Firestore collections:

1. **users** - User profiles and points
2. **scans** - Waste scan records
3. **points** - Point transaction history
4. **rewards** - Available rewards
5. **redemptions** - Reward redemption records

---

## 1. Users Collection

**Path**: `/users/{userId}`

### Document Structure

```typescript
{
  id: string;              // Same as document ID (Firebase Auth UID)
  email: string;           // User's email address
  displayName: string;     // User's display name
  totalPoints: number;     // Current total points (cached for performance)
  createdAt: Timestamp;    // Account creation timestamp
  updatedAt: Timestamp;    // Last update timestamp
}
```

### Example Document

```json
{
  "id": "abc123xyz",
  "email": "user@example.com",
  "displayName": "Ahmet Yılmaz",
  "totalPoints": 250,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

### Indexes Required

- None (queries use document ID)

---

## 2. Scans Collection

**Path**: `/scans/{scanId}`

### Document Structure

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // Reference to user who performed scan
  wasteType: string;       // PLASTIC | GLASS | PAPER | ORGANIC | METAL
  binColor: string;        // Turkish bin color name (e.g., "Sarı")
  binName: string;         // Full bin name (e.g., "Plastik Geri Dönüşüm Kutusu")
  imageUrl: string;        // URI of scanned image
  imageHash: string;       // Hash for duplicate detection
  pointsEarned: number;    // Points awarded (0 if duplicate)
  timestamp: Timestamp;    // When scan was performed
}
```

### Example Document

```json
{
  "id": "scan_001",
  "userId": "abc123xyz",
  "wasteType": "PLASTIC",
  "binColor": "Sarı",
  "binName": "Plastik Geri Dönüşüm Kutusu",
  "imageUrl": "file:///path/to/image.jpg",
  "imageHash": "sha256_hash_here",
  "pointsEarned": 10,
  "timestamp": "2024-01-20T14:45:00Z"
}
```

### Indexes Required

```
Collection: scans
Fields: userId (Ascending), timestamp (Descending)
Query Scope: Collection

Collection: scans
Fields: userId (Ascending), imageHash (Ascending), timestamp (Ascending)
Query Scope: Collection
```

---

## 3. Points Collection

**Path**: `/points/{pointId}`

### Document Structure

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // Reference to user
  amount: number;          // Points amount (positive for earn, negative for spend)
  type: string;            // SCAN_REWARD | REWARD_REDEMPTION
  referenceId: string;     // ID of related scan or redemption
  timestamp: Timestamp;    // When transaction occurred
}
```

### Example Documents

```json
// Earning points
{
  "id": "point_001",
  "userId": "abc123xyz",
  "amount": 10,
  "type": "SCAN_REWARD",
  "referenceId": "scan_001",
  "timestamp": "2024-01-20T14:45:00Z"
}

// Spending points
{
  "id": "point_002",
  "userId": "abc123xyz",
  "amount": -100,
  "type": "REWARD_REDEMPTION",
  "referenceId": "redemption_001",
  "timestamp": "2024-01-21T10:00:00Z"
}
```

### Indexes Required

```
Collection: points
Fields: userId (Ascending), timestamp (Descending)
Query Scope: Collection
```

---

## 4. Rewards Collection

**Path**: `/rewards/{rewardId}`

### Document Structure

```typescript
{
  id: string;              // Auto-generated document ID
  name: string;            // Reward name
  description: string;     // Reward description
  requiredPoints: number;  // Points needed to redeem
  imageUrl: string;        // Reward image URL (optional)
  isAvailable: boolean;    // Whether reward is currently available
  createdAt: Timestamp;    // When reward was created
}
```

### Example Document

```json
{
  "id": "reward_001",
  "name": "Starbucks Kahve",
  "description": "Ücretsiz bir bardak kahve",
  "requiredPoints": 100,
  "imageUrl": "",
  "isAvailable": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Sample Rewards to Add

```json
[
  {
    "name": "Starbucks Kahve",
    "description": "Ücretsiz bir bardak kahve",
    "requiredPoints": 100,
    "imageUrl": "",
    "isAvailable": true
  },
  {
    "name": "10 TL İndirim Kuponu",
    "description": "Geri dönüşüm ürünlerinde geçerli",
    "requiredPoints": 200,
    "imageUrl": "",
    "isAvailable": true
  },
  {
    "name": "Eco Çanta",
    "description": "Yeniden kullanılabilir bez çanta",
    "requiredPoints": 300,
    "imageUrl": "",
    "isAvailable": true
  },
  {
    "name": "Geri Dönüşüm Sertifikası",
    "description": "Dijital çevre dostu sertifika",
    "requiredPoints": 500,
    "imageUrl": "",
    "isAvailable": true
  }
]
```

### Indexes Required

```
Collection: rewards
Fields: isAvailable (Ascending), requiredPoints (Ascending)
Query Scope: Collection
```

---

## 5. Redemptions Collection

**Path**: `/redemptions/{redemptionId}`

### Document Structure

```typescript
{
  id: string;              // Auto-generated document ID
  userId: string;          // Reference to user
  rewardId: string;        // Reference to reward
  rewardName: string;      // Cached reward name
  pointsSpent: number;     // Points deducted
  timestamp: Timestamp;    // When redemption occurred
  status: string;          // pending | completed | cancelled
}
```

### Example Document

```json
{
  "id": "redemption_001",
  "userId": "abc123xyz",
  "rewardId": "reward_001",
  "rewardName": "Starbucks Kahve",
  "pointsSpent": 100,
  "timestamp": "2024-01-21T10:00:00Z",
  "status": "completed"
}
```

### Indexes Required

```
Collection: redemptions
Fields: userId (Ascending), timestamp (Descending)
Query Scope: Collection
```

---

## Security Rules

**⚠️ IMPORTANT**: Update Firestore security rules before production deployment.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scans collection
    match /scans/{scanId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Scans are immutable
    }
    
    // Points collection
    match /points/{pointId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Points are immutable
    }
    
    // Rewards collection
    match /rewards/{rewardId} {
      allow read: if request.auth != null;
      allow write: if false; // Only admins can modify (use Firebase Console)
    }
    
    // Redemptions collection
    match /redemptions/{redemptionId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Redemptions are immutable
    }
  }
}
```

---

## Data Flow Examples

### 1. User Registration

```
1. Firebase Auth creates user
2. App creates document in /users/{userId}
3. User document initialized with 0 points
```

### 2. Scanning Waste

```
1. User takes photo
2. AI classifies waste type
3. App checks for duplicate (imageHash + timestamp)
4. If not duplicate:
   - Create document in /scans
   - Create document in /points (positive amount)
   - Update totalPoints in /users
```

### 3. Redeeming Reward

```
1. User selects reward
2. App validates user has enough points
3. Create document in /redemptions
4. Create document in /points (negative amount)
5. Update totalPoints in /users
```

---

## Maintenance Tips

1. **Cleanup old scans**: Consider archiving scans older than 1 year
2. **Monitor points**: Regularly audit points transactions for consistency
3. **Update rewards**: Keep rewards fresh and achievable
4. **Analytics**: Track redemption rates to optimize point values

---

## Backup Strategy

1. Enable automatic Firestore backups in Firebase Console
2. Export data periodically for compliance
3. Test restore procedures regularly
