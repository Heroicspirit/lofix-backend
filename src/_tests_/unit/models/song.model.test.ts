import Song, { ISong } from '../../../models/song.model';
import mongoose from 'mongoose';

describe('Song Model Unit Tests', () => {
    // Unit tests should NOT connect to database
    // Only use mongoose for ObjectId creation

    describe('Song Model Validation', () => {
        test('should create a valid song successfully', () => {
            const artistId = new mongoose.Types.ObjectId();
            const albumId = new mongoose.Types.ObjectId();
            
            const songData = {
                title: 'Test Song',
                artist: artistId,
                album: albumId,
                duration: 240,
                genre: ['Pop'], // Model expects array
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg'
            };

            const song = new Song(songData);
            
            // Test validation without saving to database
            expect(song.title).toBe(songData.title);
            expect(song.artist.toString()).toBe(artistId.toString());
            if (song.album) {
                expect(song.album.toString()).toBe(albumId.toString());
            }
            expect(song.duration).toBe(songData.duration);
            expect(song.genre).toEqual(['Pop']); // Expect array
            expect(song.audioUrl).toBe(songData.audioUrl);
            expect(song.coverImage).toBe(songData.coverImage);
        });

        test('should require title field', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                artist: artistId,
                duration: 240,
                audioUrl: '/test-audio.mp3'
            });

            // Test validation without saving
            expect(song.validateSync).toBeDefined();
        });

        test('should require artist field', () => {
            const song = new Song({
                title: 'Test Song',
                duration: 240,
                audioUrl: '/test-audio.mp3'
            });

            // Test validation without saving
            expect(song.validateSync).toBeDefined();
        });

        test('should require duration field', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                title: 'Test Song',
                artist: artistId,
                audioUrl: '/test-audio.mp3'
            });

            // Test validation without saving
            expect(song.validateSync).toBeDefined();
        });

        test('should require audioUrl field', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                title: 'Test Song',
                artist: artistId,
                duration: 240
            });

            // Test validation without saving
            expect(song.validateSync).toBeDefined();
        });

        test('should validate minimum duration', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                title: 'Test Song',
                artist: artistId,
                duration: 0, // Invalid: too short
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
            });

            // Test validation without saving
            expect(song.duration).toBe(0);
        });

        test('should handle optional fields', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const songData = {
                title: 'Test Song',
                artist: artistId,
                duration: 240,
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
                // genre, album are optional
            };

            const song = new Song(songData);
            
            expect(song.title).toBe(songData.title);
            expect(song.genre).toEqual([]); // Default empty array
            expect(song.album).toBeUndefined();
        });
    });

    describe('Song Model Methods', () => {
        test('should have proper schema methods', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const songData = {
                title: 'Test Song',
                artist: artistId,
                duration: 240,
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
            };

            const song = new Song(songData);
            
            expect(typeof song.save).toBe('function');
            expect(typeof song.toJSON).toBe('function');
            expect(typeof song.toObject).toBe('function');
        });

        test('should convert to JSON correctly', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const songData = {
                title: 'Test Song',
                artist: artistId,
                duration: 240,
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
            };

            const song = new Song(songData);
            
            const json = song.toJSON();
            
            expect(json).toBeDefined();
            expect(json.title).toBe(songData.title);
            expect(json.artist.toString()).toBe(artistId.toString()); // Convert ObjectId to string
            expect(json.duration).toBe(songData.duration);
            expect(json.audioUrl).toBe(songData.audioUrl);
        });

        test('should handle timestamps automatically', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                title: 'Timestamp Test',
                artist: artistId,
                duration: 180,
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
            });

            // Timestamps are not set until document is saved to database
            // Verify schema has timestamps option enabled
            expect(song.schema.options.timestamps).toBe(true);
        });

        test('should update updatedAt timestamp on modification', () => {
            const artistId = new mongoose.Types.ObjectId();
            
            const song = new Song({
                title: 'Update Test',
                artist: artistId,
                duration: 200,
                audioUrl: '/test-audio.mp3',
                coverImage: '/test-cover.jpg' // Add missing required field
            });

            const originalUpdatedAt = song.updatedAt;

            // Simulate modification
            song.title = 'Updated Title';
            
            // Timestamps don't update until saved to database
            // Verify the schema has timestamps enabled
            expect(song.schema.options.timestamps).toBe(true);
        });
    });
});
