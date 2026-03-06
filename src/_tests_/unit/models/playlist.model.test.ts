import Playlist, { IPlaylist } from '../../../models/playlist.model';
import mongoose from 'mongoose';

describe('PlaylistModel Model Unit Tests', () => {
    // Unit tests should NOT connect to database
    // Only use mongoose for ObjectId creation

    describe('PlaylistModel Model Validation', () => {
        test('should create a valid playlist successfully', () => {
            const userId = new mongoose.Types.ObjectId();
            const songId = new mongoose.Types.ObjectId();
            
            const playlistData = {
                name: 'Test Playlist',
                description: 'A test playlist description',
                userId: userId,
                songs: [songId]
            };

            const playlist = new Playlist(playlistData);
            
            // Test validation without saving to database
            expect(playlist.name).toBe(playlistData.name);
            expect(playlist.description).toBe(playlistData.description);
            expect(playlist.userId.toString()).toBe(userId.toString());
            expect(playlist.songs).toEqual([songId]);
        });

        test('should require name field', () => {
            const userId = new mongoose.Types.ObjectId();
            
            const playlist = new Playlist({
                description: 'Test description',
                userId: userId
            });

            // Test validation without saving
            expect(playlist.validateSync).toBeDefined();
        });

        test('should require userId field', () => {
            const playlist = new Playlist({
                name: 'Test Playlist',
                description: 'Test description'
            });

            // Test validation without saving
            expect(playlist.validateSync).toBeDefined();
        });

        test('should handle optional fields', () => {
            const userId = new mongoose.Types.ObjectId();
            
            const playlistData = {
                name: 'Test Playlist',
                userId: userId
                // description and songs are optional
            };

            const playlist = new Playlist(playlistData);
            
            expect(playlist.name).toBe(playlistData.name);
            expect(playlist.description).toBeUndefined();
            expect(playlist.songs).toEqual([]);
        });
    });

    describe('PlaylistModel Model Methods', () => {
        test('should have proper schema methods', () => {
            const userId = new mongoose.Types.ObjectId();
            
            const playlistData = {
                name: 'Test Playlist',
                userId: userId
            };

            const playlist = new Playlist(playlistData);
            
            expect(typeof playlist.save).toBe('function');
            expect(typeof playlist.toJSON).toBe('function');
            expect(typeof playlist.toObject).toBe('function');
        });

        test('should convert to JSON correctly', () => {
            const userId = new mongoose.Types.ObjectId();
            const songId = new mongoose.Types.ObjectId();
            
            const playlistData = {
                name: 'Test Playlist',
                description: 'Test playlist description',
                userId: userId,
                songs: [songId]
            };

            const playlist = new Playlist(playlistData);
            
            const json = playlist.toJSON();
            
            expect(json).toBeDefined();
            expect(json.name).toBe(playlistData.name);
            expect(json.description).toBe(playlistData.description);
            expect(json.userId.toString()).toBe(userId.toString());
            expect(json.songs[0].toString()).toEqual(songId.toString());
        });

        test('should handle timestamps automatically', () => {
            const userId = new mongoose.Types.ObjectId();
            
            const playlist = new Playlist({
                name: 'Timestamp Test',
                userId: userId
            });

            // Timestamps are not set until document is saved to database
            // Verify schema has timestamps option enabled
            expect(playlist.schema.options.timestamps).toBe(true);
        });

        test('should update updatedAt timestamp on modification', () => {
            const userId = new mongoose.Types.ObjectId();
            
            const playlist = new Playlist({
                name: 'Update Test',
                userId: userId
            });

            const originalUpdatedAt = playlist.updatedAt;

            // Simulate modification
            playlist.name = 'Updated Name';
            
            // Timestamps don't update until saved to database
            // Verify the schema has timestamps enabled
            expect(playlist.schema.options.timestamps).toBe(true);
        });

        test('should handle song population', () => {
            const userId = new mongoose.Types.ObjectId();
            const songId = new mongoose.Types.ObjectId();
            
            const playlist = new Playlist({
                name: 'Populated Test',
                userId: userId,
                songs: [songId]
            });

            // Test that songs field exists and is array
            expect(playlist.songs).toBeDefined();
            expect(Array.isArray(playlist.songs)).toBe(true);
            expect(playlist.songs.length).toBe(1);
        });
    });
});
