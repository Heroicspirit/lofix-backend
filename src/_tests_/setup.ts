import mongoose from 'mongoose';
import app from '../app';
import { UserModel } from '../models/user.model';
import Song, { ISong } from '../models/song.model';
import Album, { IAlbum } from '../models/album.model';
import Playlist, { IPlaylist } from '../models/playlist.model';

// Test database setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key';
  process.env.PORT = '5001'; // Different port for testing
  
  // Connect to test database (you can use a separate test DB)
  const testDbUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/lofix-test';
  await mongoose.connect(testDbUri);
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect from database
  await mongoose.disconnect();
});

// Cleanup between tests
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidResponse(): R;
      toHaveValidUserStructure(): R;
      toHaveValidSongStructure(): R;
      toHaveValidAlbumStructure(): R;
      toHaveValidPlaylistStructure(): R;
    }
  }
  
  var testUtils: {
    createTestUser: () => {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    createTestSong: () => {
      title: string;
      artist: string;
      album: string;
      duration: number;
      genre: string;
    };
    createTestAlbum: () => {
      title: string;
      artist: string;
      releaseYear: number;
      genre: string;
    };
    createTestPlaylist: () => {
      name: string;
      description: string;
      isPublic: boolean;
    };
    generateAuthToken: (userId: string) => string;
    createAuthenticatedUser: () => Promise<{ user: any; token: string }>;
    createTestSongInDb: () => Promise<any>;
    createTestAlbumInDb: () => Promise<any>;
  };
}

// Custom matchers
expect.extend({
  toBeValidResponse(received) {
    const pass = received && 
                typeof received.status === 'number' && 
                typeof received.body === 'object';
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid response with status and body`,
        pass: false,
      };
    }
  },
  
  toHaveValidUserStructure(received) {
    const requiredFields = ['id', 'fullName', 'email', 'createdAt'];
    const hasAllFields = requiredFields.every(field => received[field]);
    
    if (hasAllFields) {
      return {
        message: () => `expected user not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected user to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
  
  toHaveValidSongStructure(received) {
    const requiredFields = ['id', 'title', 'artist', 'duration', 'audioUrl'];
    const hasAllFields = requiredFields.every(field => received[field]);
    
    if (hasAllFields) {
      return {
        message: () => `expected song not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected song to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
  
  toHaveValidAlbumStructure(received) {
    const requiredFields = ['id', 'title', 'artist', 'releaseYear'];
    const hasAllFields = requiredFields.every(field => received[field]);
    
    if (hasAllFields) {
      return {
        message: () => `expected album not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected album to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
  
  toHaveValidPlaylistStructure(received) {
    const requiredFields = ['id', 'name', 'songs', 'owner'];
    const hasAllFields = requiredFields.every(field => received[field]);
    
    if (hasAllFields) {
      return {
        message: () => `expected playlist not to have valid structure`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected playlist to have fields: ${requiredFields.join(', ')}`,
        pass: false,
      };
    }
  },
});

// Global test utilities implementation
global.testUtils = {
  createTestUser: () => ({
    fullName: 'Test User',
    email: 'test@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  }),
  
  createTestSong: () => ({
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    duration: 240,
    genre: 'Pop',
  }),
  
  createTestAlbum: () => ({
    title: 'Test Album',
    artist: 'Test Artist',
    releaseYear: 2023,
    genre: 'Pop',
  }),
  
  createTestPlaylist: () => ({
    name: 'Test Playlist',
    description: 'A test playlist',
    isPublic: true,
  }),
  
  generateAuthToken: (userId: string) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, email: 'test@example.com' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  },
  
  createAuthenticatedUser: async () => {
    const userData = global.testUtils.createTestUser();
    const user = new UserModel({
      ...userData,
      password: require('bcryptjs').hashSync(userData.password, 12),
    });
    await user.save();
    
    const token = global.testUtils.generateAuthToken(user._id.toString());
    
    return { user, token };
  },
  
  createTestSongInDb: async () => {
    const songData = global.testUtils.createTestSong();
    const song = new Song({
      ...songData,
      audioUrl: '/test-audio.mp3',
      coverImage: '/test-cover.jpg',
    });
    await song.save();
    return song;
  },
  
  createTestAlbumInDb: async () => {
    const albumData = global.testUtils.createTestAlbum();
    const album = new Album({
      ...albumData,
      coverImage: '/test-album-cover.jpg',
    });
    await album.save();
    return album;
  },
};

// Export app for testing
export { app };

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
