# EcoScan Architecture Documentation

## Overview

EcoScan follows **Clean Architecture** principles combined with **MVVM (Model-View-ViewModel)** pattern to create a scalable, maintainable, and testable mobile application.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  (UI, Screens, Components, Stores, Navigation)          │
│  - React Native Components                               │
│  - Zustand State Management                              │
│  - React Navigation                                      │
└────────────────────┬────────────────────────────────────┘
                     │ Uses
                     ↓
┌─────────────────────────────────────────────────────────┐
│                     Domain Layer                         │
│  (Business Logic, Entities, Use Cases, Interfaces)      │
│  - Pure TypeScript                                       │
│  - No framework dependencies                             │
│  - Business rules enforcement                            │
└────────────────────┬────────────────────────────────────┘
                     │ Implements
                     ↓
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  (Repositories, Services, External APIs)                 │
│  - Firebase Integration                                  │
│  - AI Service Integration                                │
│  - Data persistence                                      │
└─────────────────────────────────────────────────────────┘
```

## Layer Details

### 1. Presentation Layer (`src/presentation/`)

**Responsibility**: User interface and user interaction

**Components**:
- **Screens**: Full-screen views (Login, Home, Scan, etc.)
- **Components**: Reusable UI elements (Button, Input, etc.)
- **Stores**: Zustand state management
- **Navigation**: React Navigation setup

**Key Principles**:
- No business logic
- Delegates to use cases via stores
- Reactive to state changes
- Handles only UI concerns

**Example Flow**:
```typescript
// User clicks login button
LoginScreen → authStore.login() → LoginUseCase.execute() → Firebase
```

### 2. Domain Layer (`src/domain/`)

**Responsibility**: Core business logic and rules

**Components**:
- **Entities**: Core business models (User, Scan, Point, etc.)
- **Use Cases**: Business operations (ClassifyWasteUseCase, etc.)
- **Repositories**: Data access interfaces
- **Services**: External service interfaces (AI)

**Key Principles**:
- Framework-independent
- Contains all business rules
- Defines contracts (interfaces)
- No implementation details

**Example Use Case**:
```typescript
class ClassifyWasteUseCase {
  constructor(
    private aiService: IAIClassificationService,
    private scanRepository: IScanRepository,
    private pointRepository: IPointRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string, imageUri: string, imageHash: string) {
    // 1. Check for duplicates
    // 2. Classify waste with AI
    // 3. Calculate points
    // 4. Save scan
    // 5. Award points
    // 6. Update user total
  }
}
```

### 3. Data Layer (`src/data/`)

**Responsibility**: Data access and external integrations

**Components**:
- **Repositories**: Implement domain repository interfaces
- **Services**: Implement domain service interfaces
- **Config**: Firebase and other configurations

**Key Principles**:
- Implements domain interfaces
- Handles data persistence
- Manages external APIs
- Converts between data formats

**Example Repository**:
```typescript
class FirebaseScanRepository implements IScanRepository {
  async create(scan: Omit<Scan, 'id'>): Promise<Scan> {
    // Firebase-specific implementation
  }
  
  async getUserScans(userId: string): Promise<Scan[]> {
    // Firebase query implementation
  }
}
```

## Dependency Flow

```
UI Layer (depends on) → Domain Layer (defines) → Data Layer (implements)
```

**Critical Rule**: Dependencies point inward. Inner layers never depend on outer layers.

## Design Patterns

### 1. Repository Pattern

**Purpose**: Abstract data access

```typescript
// Domain defines the contract
interface IScanRepository {
  create(scan: Omit<Scan, 'id'>): Promise<Scan>;
  getUserScans(userId: string): Promise<Scan[]>;
}

// Data layer implements it
class FirebaseScanRepository implements IScanRepository {
  // Firebase-specific implementation
}

// Easy to swap implementations
class MockScanRepository implements IScanRepository {
  // Mock implementation for testing
}
```

### 2. Use Case Pattern

**Purpose**: Encapsulate business operations

```typescript
class RedeemRewardUseCase {
  async execute(userId: string, rewardId: string): Promise<Redemption> {
    // 1. Validate reward exists
    // 2. Check user has enough points
    // 3. Create redemption record
    // 4. Deduct points
    // 5. Update user total
  }
}
```

### 3. Dependency Injection

**Purpose**: Loose coupling and testability

```typescript
// Use case receives dependencies
class ClassifyWasteUseCase {
  constructor(
    private aiService: IAIClassificationService,  // Interface, not implementation
    private scanRepository: IScanRepository,
    private pointRepository: IPointRepository
  ) {}
}

// Easy to test with mocks
const useCase = new ClassifyWasteUseCase(
  new MockAIService(),
  new MockScanRepository(),
  new MockPointRepository()
);
```

### 4. State Management (MVVM)

**Purpose**: Reactive UI updates

```typescript
// Store acts as ViewModel
export const useScanStore = create<ScanState>((set) => ({
  currentScan: null,
  isLoading: false,
  
  classifyWaste: async (userId: string, imageUri: string) => {
    set({ isLoading: true });
    const result = await classifyWasteUseCase.execute(userId, imageUri);
    set({ currentScan: result, isLoading: false });
  }
}));

// UI reacts to state changes
const { currentScan, isLoading, classifyWaste } = useScanStore();
```

## Key Architectural Decisions

### 1. Why Clean Architecture?

**Benefits**:
- ✅ Testable: Business logic isolated from frameworks
- ✅ Maintainable: Clear separation of concerns
- ✅ Scalable: Easy to add features
- ✅ Flexible: Easy to swap implementations

**Trade-offs**:
- ⚠️ More files and structure
- ⚠️ Steeper learning curve
- ⚠️ More boilerplate initially

### 2. Why Zustand over Redux?

**Reasons**:
- Simpler API
- Less boilerplate
- Better TypeScript support
- Smaller bundle size
- Easier to integrate with use cases

### 3. Why Firebase?

**Reasons**:
- Quick setup
- Real-time capabilities
- Built-in authentication
- Scalable infrastructure
- No backend code needed

### 4. Why Mock AI Service?

**Reasons**:
- Development without API costs
- Faster iteration
- Easy to swap later
- Demonstrates abstraction

## Scalability Considerations

### Adding New Waste Types

1. Update `src/core/constants/wasteTypes.ts`
2. Add bin mapping
3. Update points configuration
4. No code changes needed elsewhere

```typescript
export enum WasteType {
  PLASTIC = 'PLASTIC',
  GLASS = 'GLASS',
  PAPER = 'PAPER',
  ORGANIC = 'ORGANIC',
  METAL = 'METAL',
  ELECTRONIC = 'ELECTRONIC',  // ← New type
}

export const WASTE_TYPE_TO_BIN: Record<WasteType, BinInfo> = {
  // ... existing mappings
  [WasteType.ELECTRONIC]: {
    name: 'Elektronik Atık Kutusu',
    color: 'Turuncu',
    hexColor: '#FF8C00',
  },
};
```

### Swapping AI Providers

1. Create new service implementing `IAIClassificationService`
2. Update service instantiation in `scanStore.ts`
3. No other code changes needed

```typescript
// Before
const aiService = new MockAIService();

// After
const aiService = new GoogleVisionAIService(apiKey);
```

### Adding New Features

1. **Add Entity** (if needed) in `domain/entities/`
2. **Add Use Case** in `domain/usecases/`
3. **Add Repository Interface** in `domain/repositories/`
4. **Implement Repository** in `data/repositories/`
5. **Add Store** in `presentation/stores/`
6. **Add UI** in `presentation/screens/`

## Testing Strategy

### Unit Tests

```typescript
describe('ClassifyWasteUseCase', () => {
  it('should award points for new scan', async () => {
    const mockAI = new MockAIService();
    const mockScanRepo = new MockScanRepository();
    const mockPointRepo = new MockPointRepository();
    
    const useCase = new ClassifyWasteUseCase(mockAI, mockScanRepo, mockPointRepo);
    const result = await useCase.execute('user123', 'image.jpg', 'hash123');
    
    expect(result.scan.pointsEarned).toBeGreaterThan(0);
  });
});
```

### Integration Tests

```typescript
describe('Scan Flow', () => {
  it('should complete full scan workflow', async () => {
    // 1. Classify waste
    // 2. Verify scan created
    // 3. Verify points awarded
    // 4. Verify user total updated
  });
});
```

## Error Handling

### Centralized Error Handler

```typescript
export function handleError(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage;
  }
  
  // Firebase-specific errors
  if (error.message.includes('auth/user-not-found')) {
    return 'Kullanıcı bulunamadı';
  }
  
  return 'Beklenmeyen bir hata oluştu';
}
```

### Usage in Stores

```typescript
try {
  await loginUseCase.execute(email, password);
} catch (error) {
  set({ error: handleError(error) });
}
```

## Performance Optimizations

1. **Cached User Points**: Stored in user document for quick access
2. **Pagination**: Scan history limited to recent items
3. **Indexes**: Firestore indexes for common queries
4. **Lazy Loading**: Screens loaded on demand
5. **Memoization**: React components optimized with useMemo/useCallback

## Security Considerations

1. **Firestore Rules**: Restrict access to user's own data
2. **Authentication**: Required for all operations
3. **Validation**: Input validation in use cases
4. **Sanitization**: Prevent injection attacks
5. **Environment Variables**: Sensitive config not in code

## Future Enhancements

### Potential Features

1. **Social Features**: Share achievements, leaderboards
2. **Offline Mode**: Queue scans when offline
3. **Analytics**: Track user behavior
4. **Push Notifications**: Remind users to scan
5. **Advanced AI**: Custom-trained model
6. **Barcode Scanning**: Identify products
7. **Location-Based**: Find nearby recycling centers

### Architecture Support

The current architecture supports all these features:

- **Social**: Add new use cases and repositories
- **Offline**: Add offline repository implementation
- **Analytics**: Add analytics service interface
- **Notifications**: Add notification service
- **Advanced AI**: Swap AI service implementation

## Conclusion

EcoScan's architecture prioritizes:

1. **Separation of Concerns**: Each layer has a clear responsibility
2. **Testability**: Business logic isolated and mockable
3. **Flexibility**: Easy to swap implementations
4. **Scalability**: Simple to add new features
5. **Maintainability**: Clear structure and patterns

This foundation supports long-term growth and evolution of the application.
