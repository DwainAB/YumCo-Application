# Guide de Tests - YumCo Application

## 📋 Table des matières
- [Installation](#installation)
- [Exécution des tests](#exécution-des-tests)
- [Structure des tests](#structure-des-tests)
- [Écriture de tests](#écriture-de-tests)
- [Bonnes pratiques](#bonnes-pratiques)
- [Dépannage](#dépannage)

## 🚀 Installation

Les dépendances de test sont déjà installées dans le projet :
- `jest` - Framework de test
- `@testing-library/react-native` - Utilitaires pour tester React Native
- `jest-expo` - Preset Jest pour Expo
- `react-test-renderer` - Rendu des composants pour tests

## 🧪 Exécution des tests

### Commandes disponibles

```bash
# Exécuter tous les tests
npm test

# Exécuter les tests en mode watch (re-test automatique)
npm run test:watch

# Exécuter avec rapport de couverture
npm run test:coverage

# Exécuter pour CI/CD
npm run test:ci
```

### Tests spécifiques

```bash
# Tester un fichier spécifique
npm test -- HomeScreen.test.jsx

# Tester par pattern
npm test -- --testPathPattern=hooks

# Tester avec verbose
npm test -- --verbose
```

## 📁 Structure des tests

```
src/
├── __tests__/
│   ├── utils/
│   │   ├── test-utils.jsx      # Utilitaires de test réutilisables
│   │   └── mock-data.js         # Données mockées
│   └── integration/
│       └── order-flow.test.jsx  # Tests d'intégration
├── hooks/
│   └── __tests__/
│       └── useRestaurantId.test.js
├── services/
│   └── __tests__/
│       └── orderService.test.js
└── screens/
    └── __tests__/
        └── HomeScreen.test.jsx
```

## ✍️ Écriture de tests

### 1. Tests de Hooks

```javascript
import { renderHook, waitFor } from '@testing-library/react-native';
import { useRestaurantId } from '../useRestaurantId';

describe('useRestaurantId', () => {
  it('should return restaurant ID', async () => {
    const { result } = renderHook(() => useRestaurantId());

    await waitFor(() => {
      expect(result.current.restaurantId).toBe('rest-123');
    });
  });
});
```

### 2. Tests de Services

```javascript
import { orderService } from '../orderService';
import { supabase } from '../../lib/supabase';

jest.mock('../../lib/supabase');

describe('orderService', () => {
  it('should fetch orders', async () => {
    const mockOrders = [{ id: 1, status: 'pending' }];

    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: mockOrders, error: null }),
    });

    const result = await orderService.getOrders('rest-123');
    expect(result).toEqual(mockOrders);
  });
});
```

### 3. Tests de Composants

```javascript
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../HomeScreen';

describe('HomeScreen', () => {
  it('should render without crashing', () => {
    render(<HomeScreen />);
    expect(screen).toBeTruthy();
  });
});
```

### 4. Tests d'Intégration

```javascript
describe('Order Flow', () => {
  it('should complete full order lifecycle', async () => {
    const order = await orderService.createOrder(orderData);
    expect(order.status).toBe('pending');

    await orderService.updateOrderStatus(order.id, 'completed');
    const updated = await orderService.getOrderById(order.id);
    expect(updated.status).toBe('completed');
  });
});
```

## 📚 Utilitaires disponibles

### Test Utils (`src/__tests__/utils/test-utils.jsx`)

```javascript
import { renderWithNavigation, mockNavigation } from './test-utils';

// Render avec navigation
renderWithNavigation(<MyScreen />);

// Mock navigation
const navigation = mockNavigation;

// Mock AsyncStorage
const storage = createMockAsyncStorage();

// Mock Supabase
const supabase = createMockSupabaseClient();
```

### Mock Data (`src/__tests__/utils/mock-data.js`)

```javascript
import {
  mockRestaurant,
  mockOrder,
  mockMenu,
  mockProduct
} from './mock-data';
```

## ✅ Bonnes pratiques

### 1. Organisation des tests

- **Un fichier de test par module** : `Component.jsx` → `Component.test.jsx`
- **Grouper les tests** : Utiliser `describe()` pour grouper les tests liés
- **Noms descriptifs** : Les noms de tests doivent décrire le comportement testé

### 2. Setup et Cleanup

```javascript
describe('MyComponent', () => {
  beforeEach(() => {
    // Setup avant chaque test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup après chaque test
  });
});
```

### 3. Tests asynchrones

```javascript
it('should handle async operations', async () => {
  const { result } = renderHook(() => useMyHook());

  await waitFor(() => {
    expect(result.current.data).toBeDefined();
  });
});
```

### 4. Mocking

```javascript
// Mock un module
jest.mock('@react-native-async-storage/async-storage');

// Mock une fonction spécifique
const mockFn = jest.fn().mockResolvedValue({ data: [] });

// Spy sur console.error
const spy = jest.spyOn(console, 'error').mockImplementation();
```

### 5. Couverture de code

Visez ces objectifs de couverture :
- **Branches** : 50%+
- **Fonctions** : 50%+
- **Lignes** : 50%+
- **Statements** : 50%+

## 🔧 Configuration

### jest.config.js

Le fichier de configuration Jest définit :
- Preset Expo pour React Native
- Transformations de fichiers
- Setup après environnement
- Seuils de couverture

### jest.setup.js

Configuration globale :
- Mocks de modules natifs
- Polyfills
- Extensions de matchers

## 🐛 Dépannage

### Problème : Tests timeout

```javascript
// Augmenter le timeout
jest.setTimeout(10000);
```

### Problème : Module non trouvé

```bash
# Nettoyer le cache Jest
npm test -- --clearCache
```

### Problème : Mocks ne fonctionnent pas

```javascript
// S'assurer que le mock est avant l'import
jest.mock('./module');
import { myFunction } from './module';
```

### Problème : Tests async échouent

```javascript
// Toujours utiliser async/await ou return Promise
it('async test', async () => {
  await expect(asyncFn()).resolves.toBe(true);
});
```

## 📊 Rapports de couverture

Après `npm run test:coverage`, un rapport est généré dans `/coverage` :

```
coverage/
├── lcov-report/     # Rapport HTML
│   └── index.html   # Ouvrir dans navigateur
└── lcov.info        # Format LCOV
```

Ouvrez `coverage/lcov-report/index.html` dans votre navigateur pour voir :
- Couverture globale
- Couverture par fichier
- Lignes non testées

## 🎯 Checklist avant commit

- [ ] Tous les tests passent (`npm test`)
- [ ] Couverture > 50% (`npm run test:coverage`)
- [ ] Pas de console.log dans le code de test
- [ ] Mocks nettoyés après tests
- [ ] Tests asynchrones utilisent `async/await`
- [ ] Noms de tests descriptifs

## 📝 Exemples de tests par type

### Test d'erreur

```javascript
it('should throw error when ID is missing', async () => {
  await expect(service.getData()).rejects.toThrow('ID is required');
});
```

### Test de navigation

```javascript
import { mockNavigation } from '../__tests__/utils/test-utils';

it('should navigate on button press', () => {
  const { getByText } = render(
    <MyScreen navigation={mockNavigation} />
  );

  fireEvent.press(getByText('Next'));
  expect(mockNavigation.navigate).toHaveBeenCalledWith('NextScreen');
});
```

### Test avec AsyncStorage

```javascript
it('should save to AsyncStorage', async () => {
  await AsyncStorage.setItem('key', 'value');
  const result = await AsyncStorage.getItem('key');
  expect(result).toBe('value');
});
```

## 🚀 Prochaines étapes

Après avoir refactorisé le code :

1. **Ajouter des tests** pour chaque nouveau composant/service
2. **Exécuter tests** avant chaque commit
3. **Surveiller couverture** et viser 70%+
4. **Tests E2E** avec Detox (optionnel)
5. **CI/CD** : Intégrer `npm run test:ci` dans pipeline

---

**Besoin d'aide ?** Consultez :
- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)