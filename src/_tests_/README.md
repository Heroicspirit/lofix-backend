# Backend Testing Setup

This directory contains comprehensive unit and integration tests for the Lofix backend API.

## Test Structure

```
src/_tests_/
├── setup.ts                 # Global test setup and utilities
├── unit/                    # Unit tests
│   ├── controllers/         # Controller unit tests
│   ├── services/           # Service unit tests
│   └── models/             # Model unit tests
├── integration/            # Integration tests
│   ├── auth.test.ts        # Authentication integration tests
│   ├── songs.test.ts       # Songs integration tests
│   └── albums.test.ts      # Albums integration tests
├── _mocks_/                # Mock files
│   └── uuid.js            # UUID mock
└── README.md              # This file
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up test environment variables in your `.env` file:
```env
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key
MONGODB_TEST_URI=mongodb://localhost:27017/lofix-test
```

3. Make sure MongoDB is running for integration tests.

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test Suites
```bash
# Authentication tests
npm run test:auth

# Song tests
npm run test:songs
```

## Test Categories

### Unit Tests
- **Controllers**: Test request/response handling, validation, and error handling
- **Services**: Test business logic, database operations, and external service interactions
- **Models**: Test model validation, methods, and relationships

### Integration Tests
- **Authentication**: Test complete auth flows (register, login, profile management)
- **Songs**: Test CRUD operations, search, and filtering
- **Albums**: Test album management and relationships

## Test Utilities

The `setup.ts` file provides global test utilities:

### Test Data Creation
```typescript
// Create test user data
const userData = global.testUtils.createTestUser();

// Create test song data
const songData = global.testUtils.createTestSong();

// Create test album data
const albumData = global.testUtils.createTestAlbum();
```

### Database Helpers
```typescript
// Create authenticated user with token
const { user, token } = await global.testUtils.createAuthenticatedUser();

// Create test song in database
const song = await global.testUtils.createTestSongInDb();

// Create test album in database
const album = await global.testUtils.createTestAlbumInDb();
```

### Custom Matchers
```typescript
// Validate response structure
expect(response).toBeValidResponse();

// Validate user structure
expect(user).toHaveValidUserStructure();

// Validate song structure
expect(song).toHaveValidSongStructure();
```

## Writing New Tests

### Unit Test Example
```typescript
describe('ServiceName', () => {
  let service: ServiceName;
  
  beforeEach(() => {
    service = new ServiceName();
    jest.clearAllMocks();
  });
  
  it('should perform action successfully', async () => {
    // Arrange
    const mockData = { /* test data */ };
    jest.spyOn(service, 'method').mockResolvedValue(mockData);
    
    // Act
    const result = await service.method();
    
    // Assert
    expect(result).toEqual(mockData);
  });
});
```

### Integration Test Example
```typescript
describe('API Endpoint', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Setup authentication
    const response = await request(app)
      .post('/api/auth/login')
      .send(loginData);
    authToken = response.body.token;
  });
  
  it('should make authenticated request', async () => {
    const response = await request(app)
      .get('/api/protected-endpoint')
      .set('Authorization', `Bearer ${authToken}`);
      
    expect(response.status).toBe(200);
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Use `afterEach` to clean up database changes
3. **Mocking**: Mock external dependencies in unit tests
4. **Coverage**: Aim for high test coverage but focus on critical paths
5. **Naming**: Use descriptive test names that explain what is being tested
6. **Assertions**: Be specific with assertions and test both success and failure cases

## Environment Variables

- `NODE_ENV=test`: Sets the environment to test mode
- `JWT_SECRET`: Secret for JWT token generation in tests
- `MONGODB_TEST_URI`: MongoDB connection string for test database
- `PORT`: Port for test server (defaults to 5001)

## Coverage Reports

Coverage reports are generated in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view detailed coverage information.

## Troubleshooting

### Common Issues

1. **MongoDB Connection**: Ensure MongoDB is running and accessible
2. **Port Conflicts**: Make sure the test port doesn't conflict with development server
3. **Test Database**: Use a separate test database to avoid data conflicts
4. **Async Tests**: Use `async/await` properly and handle promises correctly

### Debugging Tests

Run tests with debugging:
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

These tests are designed to run in CI/CD environments. Ensure your CI environment has:
- Node.js installed
- MongoDB access
- Required environment variables set
