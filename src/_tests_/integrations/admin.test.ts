import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import bcryptjs from 'bcryptjs';

describe('Admin Integration Tests', () => {
    let adminToken: string;
    let userToken: string;
    let testUser: any;
    let adminUser: any;

    beforeAll(async () => {
        // Create admin user directly in database
        const hashedPassword = await bcryptjs.hash('Password123!', 10);
        adminUser = await UserModel.create({
            name: 'adminuser',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        // Create regular user through registration
        const userResponse = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'regularuser',
                email: 'user@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            });
        testUser = userResponse.body.data;

        // Login as admin
        const adminLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: adminUser.email, password: 'Password123!' });
        adminToken = adminLogin.body.token;

        // Login as regular user
        const userLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: 'Password123!' });
        userToken = userLogin.body.token;

        // Wait a bit to ensure users are saved
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [
                { email: adminUser.email },
                { email: testUser.email }
            ]
        });
    });

    describe('POST /api/admin/', () => {
        test('should create user as admin', async () => {
            const newUser = {
                name: 'newuser',
                email: `newuser${Date.now()}@example.com`, // Unique email
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newUser);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', newUser.name);
            expect(response.body.data).toHaveProperty('email', newUser.email);
        });

        test('should not create user without admin token', async () => {
            const newUser = {
                name: 'newuser2',
                email: 'newuser2@example.com',
                password: 'Password123!',
                confirmPassword: 'Password123!'
            };

            const response = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${userToken}`)
                .send(newUser);

            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/admin/users/', () => {
        test('should get all users as admin', async () => {
            const response = await request(app)
                .get('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('pagination');
            expect(Array.isArray(response.body.data.user)).toBe(true);
        });
    });

    describe('GET /api/admin/users/:id', () => {
        test('should get user by id as admin', async () => {
            const response = await request(app)
                .get(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', testUser._id);
        });
    });

    describe('PUT /api/admin/users/:id', () => {
        test('should update user as admin', async () => {
            const updateData = {
                name: 'updateduser',
                email: `updated${Date.now()}@example.com` // Unique email
            };

            const response = await request(app)
                .put(`/api/admin/users/${testUser._id}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User Updated');
            expect(response.body.data).toHaveProperty('name', updateData.name);
            expect(response.body.data).toHaveProperty('email', updateData.email);
        });
    });

    describe('DELETE /api/admin/users/:id', () => {
        test('should delete user as admin', async () => {
            // Create a user specifically for deletion test
            const deleteTestResponse = await request(app)
                .post('/api/admin/users/')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'deletetestuser',
                    email: `delete${Date.now()}@example.com`, // Unique email
                    password: 'Password123!',
                    confirmPassword: 'Password123!'
                });
            const userToDelete = deleteTestResponse.body.data;

            const response = await request(app)
                .delete(`/api/admin/users/${userToDelete._id}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('message', 'User Deleted');
        });
    });
});
