# Game Testing Guide

## Overview

Farm Life uses Jest for automated testing. Tests cover:
- Game economy (crops, marketplace)
- Farming mechanics (planting, growing, harvesting)
- Animals (production, feeding, upgrading)
- Inventory management
- Player progression
- Offline progression

## Current Test Status

**Test Files Created:**
- `tests/economy.test.ts` - Marketplace and economics
- `tests/farming.test.ts` - Crop lifecycle
- `tests/animals.test.ts` - Animal mechanics

**Setup Required:**
Jest needs to be installed and configured. See "Installation" below.

## Installation

### 1. Install Jest and Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest
```

### 2. Create Jest Configuration

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/tests/**/*.test.ts', '**/tests/**/*.test.tsx'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
  ],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@store/(.*)$': '<rootDir>/src/store/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
  },
};
```

### 3. Update package.json

Add test scripts:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test -- farming.test.ts
```

### Run Tests in Watch Mode
```bash
npm test:watch
```

### Generate Coverage Report
```bash
npm test:coverage
```

## Writing Tests

### Basic Test Structure

```typescript
describe('Feature Name', () => {
  describe('Specific Scenario', () => {
    test('should do something', () => {
      // Arrange
      const input = 10;
      
      // Act
      const result = doSomething(input);
      
      // Assert
      expect(result).toBe(20);
    });
  });
});
```

### Common Assertions

```typescript
expect(value).toBe(expectedValue);           // Exact match
expect(value).toEqual(expectedObject);       // Deep equality
expect(value).toBeGreaterThan(other);        // Numeric comparison
expect(value).toBeLessThan(other);
expect(value).toContain(item);               // Array/string contains
expect(value).toBeDefined();                 // Defined check
expect(value).toThrow();                     // Exception check
```

## Test Categories

### Economy Tests
- Crop pricing and market dynamics
- Coin generation and marketplace transactions
- XP generation and level requirements

**Run with:** `npm test -- economy.test.ts`

### Farming Tests
- Crop lifecycle (plant → grow → harvest)
- Growth time and earnings
- Farm plot management
- Offline progress
- Crop upgrading

**Run with:** `npm test -- farming.test.ts`

### Animals Tests
- Animal production cycles
- Feeding mechanics and costs
- Animal health and survival
- Animal upgrading
- Animal capacity management
- Offline progress

**Run with:** `npm test -- animals.test.ts`

### Inventory Tests (To be added)
- Item storage
- Item limits
- Item categorization
- Crafting recipes

### Progression Tests (To be added)
- Level ups
- XP requirements
- Unlock mechanics
- Achievement tracking

### Offline Tests (To be added)
- Time calculation accuracy
- Missed events handling
- State synchronization

## Test-Driven Development (TDD)

### Workflow

1. **Write Test First**
   ```typescript
   test('harvesting wheat generates 50 coins', () => {
     const earnings = harvestWheat();
     expect(earnings).toBe(50);
   });
   ```

2. **Run Test (Will Fail)**
   ```bash
   npm test
   ```

3. **Write Implementation**
   ```typescript
   function harvestWheat(): number {
     return 50;
   }
   ```

4. **Run Test (Will Pass)**
   ```bash
   npm test
   ```

5. **Refactor if Needed**
   ```typescript
   function harvestWheat(quantity: number = 1): number {
     return 50 * quantity;
   }
   ```

## Best Practices

### Do
- ✅ Write tests for core game logic
- ✅ Test edge cases (insufficient resources, max capacity)
- ✅ Use descriptive test names
- ✅ Keep tests focused on one behavior
- ✅ Use fixtures for common test data
- ✅ Test both success and failure paths

### Don't
- ❌ Test React component rendering details
- ❌ Test third-party libraries (Firebase, etc.)
- ❌ Mock everything indiscriminately
- ❌ Write tests that depend on other tests
- ❌ Use real API calls in tests

## Mocking Firebase

For testing game logic that involves Firebase:

```typescript
jest.mock('@services/firebaseService', () => ({
  db: {
    collection: jest.fn(),
  },
  auth: {
    currentUser: { uid: 'test-user-123' },
  },
}));

test('player data loads from Firestore', async () => {
  const player = await loadPlayerData('test-user-123');
  expect(player.level).toBe(1);
});
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install --legacy-peer-deps
      - run: npm test -- --coverage
```

## Troubleshooting

### Tests Won't Run

1. Verify Jest is installed:
   ```bash
   npm list jest
   ```

2. Check jest.config.js exists and is valid

3. Verify test files match pattern `**/*.test.ts`

### TypeScript Errors in Tests

1. Ensure `@types/jest` is installed:
   ```bash
   npm install --save-dev @types/jest
   ```

2. Check tsconfig includes test files

### Module Resolution Issues

1. Verify `moduleNameMapper` in jest.config.js
2. Check path aliases match tsconfig.json
3. Ensure imports use correct paths

## Next Steps

1. ✅ Create test files
2. 📦 Install Jest dependencies
3. ⚙️ Configure jest.config.js
4. ▶️ Run tests: `npm test`
5. 📝 Write more tests for edge cases
6. 📊 Monitor coverage: `npm test:coverage`

See [DEVELOPMENT.md](./DEVELOPMENT.md) for more development guidance.
