import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Auth Integration Tests', () => {
    const testUser = {
        name: 'testuser',
        email: 'test@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
    };

    beforeAll(async () => {
        // Any setup before tests run can be done here
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { name: testUser.name }]
        });
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            $or: [{ email: testUser.email }, { name: testUser.name }]
        });
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
        })

        test('should not register a new user with duplicate email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser)
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        })

        
        test('should not register a new user with duplicate username', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'new@email.com' })
            
            expect(response.status).toBe(403);
            expect(response.body).toHaveProperty('success', false);
        })

        test('should not register with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: 'invalid-email' })
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        })

        test('should not register with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, password: '123', confirmPassword: '123' })
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        })

        test('should not register with missing name', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, name: '' })
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        })

        test('should not register with missing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({ ...testUser, email: '' })
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        })
    });

    describe('POST /api/auth/login', () => {

        test('should login an existing user', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
        });

        test('should not login with incorrect password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'WrongPassword!' });
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: 'Password123!' });
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not login with missing credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email });
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/auth/profile', () => {
        let authToken: string;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            authToken = loginResponse.body.token;
        });

        test('should get user profile with valid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });

        test('should not get profile without token', async () => {
            const response = await request(app)
                .get('/api/auth/profile');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should not get profile with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', 'Bearer invalid-token');
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('PUT /api/auth/update-profile', () => {
        let authToken: string;

        beforeAll(async () => {
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });
            authToken = loginResponse.body.token;
        });

        test('should update user profile with valid data', async () => {
            const updateData = {
                name: 'updateduser',
                email: 'updated@example.com'
            };
            
            const response = await request(app)
                .put('/api/auth/update-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', updateData.name);
            expect(response.body.data).toHaveProperty('email', updateData.email);
        });

        test('should not update profile without token', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .send({ name: 'updateduser' });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should update profile with valid name only', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ name: 'validupdatedname' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('name', 'validupdatedname');
        });

        test('should update profile with email only', async () => {
            const response = await request(app)
                .put('/api/auth/update-profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ email: `emailonly${Date.now()}@example.com` });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('email');
        });
    });
});