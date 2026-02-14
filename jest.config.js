module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/_tests_/**/*.test.ts'],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.d.ts',
        '!src/index.ts',
        '!src/app.ts',
        '!src/_tests_/**',
    ],
    setupFilesAfterEnv: ['<rootDir>/src/_tests_/setup.ts'],
    moduleNameMapper: {
        "^uuid$": "<rootDir>/src/_tests_/_mocks_/uuid.js",
    },
};