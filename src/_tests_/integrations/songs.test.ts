import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import Song from '../../models/song.model';
import { ArtistModel } from '../../models/artist.model';
import mongoose from 'mongoose';

describe('Songs Integration Tests', () => {
  let authToken: string;
  let testSongId: string;

  const testUser = {
    name: 'songuser',
    email: 'song@example.com',
    password: 'Password123!',
    confirmPassword: 'Password123!',
  };

  beforeAll(async () => {
    await UserModel.deleteMany({ email: testUser.email });

    await request(app).post('/api/auth/register').send(testUser);

    const login = await request(app).post('/api/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });

    authToken = login.body.token;

    await ArtistModel.create({
      name: 'Test Artist',
      bio: 'Artist Bio',
    });
  });

  afterAll(async () => {
    await Song.deleteMany({});
    await ArtistModel.deleteMany({});
    await UserModel.deleteMany({ email: testUser.email });
  });

  beforeEach(async () => {
    // Create test data for GET operations
    let artist = await ArtistModel.findOne({ name: 'Test Artist' });
    if (!artist) {
      artist = await ArtistModel.create({
        name: 'Test Artist',
        bio: 'Artist Bio',
      });
    }

    const song = await Song.create({
      title: 'Test Song',
      artist: artist._id,
      duration: 200,
      genre: ['Pop'],
      audioUrl: '/song.mp3',
      coverImage: '/cover.jpg',
    });

    testSongId = song._id.toString();
  });

  test('get songs', async () => {
    const response = await request(app).get('/api/songs');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('get song by id', async () => {
    console.log('Looking for song with ID:', testSongId);
    
    const response = await request(app).get(`/api/songs/${testSongId}`);

    if (response.status !== 200) {
      console.log('Response:', response.body);
    }

    expect(response.status).toBe(200);
  });

  test('invalid song id', async () => {
    const response = await request(app).get('/api/songs/invalid-id');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  test('delete song (user should be unauthorized)', async () => {
    const response = await request(app)
      .delete(`/api/songs/${testSongId}`)
      .set('Authorization', `Bearer ${authToken}`);

    // Regular users should not be able to delete songs (admin only)
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});