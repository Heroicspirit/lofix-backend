import { PlaylistRepository } from '../../../repositories/playlist.repository';
import Playlist, { IPlaylist } from '../../../models/playlist.model';
import mongoose from 'mongoose';

jest.mock("../../../models/playlist.model");

describe('PlaylistRepository Unit Tests', () => {
    let playlistRepository: PlaylistRepository;
    let mockPlaylistModel: any;

    beforeEach(() => {
        playlistRepository = new PlaylistRepository();
        mockPlaylistModel = require("../../../models/playlist.model").Playlist;
        mockPlaylistModel.create = jest.fn();
        mockPlaylistModel.findById = jest.fn();
        mockPlaylistModel.find = jest.fn();
        mockPlaylistModel.findByIdAndUpdate = jest.fn();
        mockPlaylistModel.findByIdAndDelete = jest.fn();
        mockPlaylistModel.countDocuments = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        test('should create a playlist successfully', async () => {
            const playlistData = {
                name: 'Test Playlist',
                description: 'A test playlist'
            };

            const mockPlaylist = {
                _id: 'playlist123',
                ...playlistData,
                songs: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            // Mock the Playlist constructor and save method
            const mockPlaylistInstance = {
                save: jest.fn().mockResolvedValue(mockPlaylist)
            };
            mockPlaylistModel.mockImplementation(() => mockPlaylistInstance);

            const result = await playlistRepository.create(playlistData);

            expect(mockPlaylistModel).toHaveBeenCalledWith(playlistData);
            expect(mockPlaylistInstance.save).toHaveBeenCalled();
            expect(result).toEqual(mockPlaylist);
        });

        test('should throw error if creation fails', async () => {
            const playlistData = {
                name: 'Test Playlist',
                description: 'A test playlist'
            };

            // Mock the Playlist constructor and save method
            const mockPlaylistInstance = {
                save: jest.fn().mockRejectedValue(new Error('Database error'))
            };
            mockPlaylistModel.mockImplementation(() => mockPlaylistInstance);

            await expect(playlistRepository.create(playlistData)).rejects.toThrow('Failed to create playlist in database: Database error');
        });
    });

    describe('findById', () => {
        test('should find playlist by id successfully', async () => {
            const playlistId = 'playlist123';
            const mockPlaylist = {
                _id: playlistId,
                name: 'Test Playlist'
            };

            mockPlaylistModel.findById.mockResolvedValue(mockPlaylist);

            const result = await playlistRepository.findById(playlistId);

            expect(mockPlaylistModel.findById).toHaveBeenCalledWith(playlistId);
            expect(result).toEqual(mockPlaylist);
        });

        test('should return null if playlist not found', async () => {
            const playlistId = 'nonexistent';

            mockPlaylistModel.findById.mockResolvedValue(null);

            const result = await playlistRepository.findById(playlistId);

            expect(result).toBeNull();
        });
    });

    describe('findAll', () => {
        test('should find all playlists successfully', async () => {
            const mockPlaylists = [
                { _id: 'playlist1', name: 'Playlist 1' },
                { _id: 'playlist2', name: 'Playlist 2' }
            ];

            mockPlaylistModel.find.mockResolvedValue(mockPlaylists);

            const result = await playlistRepository.findAll();

            expect(mockPlaylistModel.find).toHaveBeenCalled();
            expect(result).toEqual(mockPlaylists);
        });

        test('should handle empty playlists list', async () => {
            mockPlaylistModel.find.mockResolvedValue([]);

            const result = await playlistRepository.findAll();

            expect(result).toEqual([]);
        });
    });

    describe('updateById', () => {
        test('should update playlist successfully', async () => {
            const playlistId = 'playlist123';
            const updateData = {
                name: 'Updated Playlist',
                description: 'Updated description'
            };
            const mockUpdatedPlaylist = {
                _id: playlistId,
                ...updateData,
                updatedAt: new Date()
            };

            mockPlaylistModel.findByIdAndUpdate.mockResolvedValue(mockUpdatedPlaylist);

            const result = await playlistRepository.updateById(playlistId, updateData);

            expect(mockPlaylistModel.findByIdAndUpdate).toHaveBeenCalledWith(
                playlistId,
                updateData,
                { new: true, runValidators: true }
            );
            expect(result).toEqual(mockUpdatedPlaylist);
        });

        test('should throw error if update fails', async () => {
            const playlistId = 'playlist123';
            const updateData = { name: 'Updated Playlist' };

            mockPlaylistModel.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await expect(playlistRepository.updateById(playlistId, updateData)).rejects.toThrow('Failed to update playlist: Update failed');
        });
    });

    describe('deleteById', () => {
        test('should delete playlist successfully', async () => {
            const playlistId = 'playlist123';
            const mockDeletedPlaylist = true; // Repository returns boolean

            mockPlaylistModel.findByIdAndDelete.mockResolvedValue(mockDeletedPlaylist);

            const result = await playlistRepository.deleteById(playlistId);

            expect(mockPlaylistModel.findByIdAndDelete).toHaveBeenCalledWith(playlistId);
            expect(result).toBe(true); // Expect boolean, not object
        });

        test('should throw error if deletion fails', async () => {
            const playlistId = 'playlist123';

            mockPlaylistModel.findByIdAndDelete.mockRejectedValue(new Error('Delete failed'));

            await expect(playlistRepository.deleteById(playlistId)).rejects.toThrow('Failed to delete playlist: Delete failed');
        });
    });

    describe('count', () => {
        test('should get playlists count successfully', async () => {
            const mockCount = 15;

            mockPlaylistModel.countDocuments.mockResolvedValue(mockCount);

            const result = await playlistRepository.count();

            expect(mockPlaylistModel.countDocuments).toHaveBeenCalled();
            expect(result).toBe(mockCount);
        });
    });
});
