import { prismaMock } from "@/singleton";
import { GET, POST, PUT } from "./route";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import bcrypt from "bcrypt";

const saltRounds = 10;

describe('User API', () => {
    describe('GET', () => {
        it('should return user data when given a valid user ID', async () => {
            const user = {
                id: 1,
                status: 'Enabled',
                first_name: 'Test',
                last_name: 'User',
                email_id: 'testuser@emdd',
                password_hash: await bcrypt.hash('Test@123', saltRounds),
                orgUser: {
                    id: 7,
                    name: "EMD DD"
                },
                user_role: [
                    {
                        roleId: 1,
                        role: {
                            name: "System Admin"
                        }
                    }
                ]
            } as any;
            prismaMock.user.findMany.mockResolvedValue([user]);

            const request = new Request("http://localhost:3000/api/users?id=1&with=[user_role,orgUser]");

            const response = await GET(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
            expect(data).toEqual([user]);
        });

    });
    describe('POST', () => {
        it('should create a new user when given valid data', async () => {
            const newUser = {
                id: 1,
                first_name: 'New',
                last_name: 'User',
                email_id: 'newuser@emdd',
                password_hash: await bcrypt.hash('Test@123', saltRounds),
                status: 'Enabled',
                organization_id: 1,
                user_role: [
                    {
                        roleId: 1,
                        role: {
                            name: 'user',
                        },
                    },
                ],
            };

            prismaMock.user.findUnique.mockResolvedValue(null);
            prismaMock.user.create.mockResolvedValue(newUser as any);

            const requestBody = {
                first_name: 'New',
                last_name: 'User',
                email_id: 'newuser@emdd',
                password_hash: '123456',
                organization: 1,
                roles: [1],
            };

            const request = new Request('http://example.com/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
            expect(data).toEqual(newUser);
        });

        it('should return CONFLICT status when email_id already exists', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: 1 } as any);

            const requestBody = {
                first_name: 'New',
                last_name: 'User',
                email_id: 'existinguser@emdd',
                password_hash: 'Test@123',
                organization: 1,
                roles: [1],
            };

            const request = new Request('http://example.com/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.CONFLICT);
            expect(data).toEqual({ error: MESSAGES.EMAIL_ALREADY_EXIST });
        });
    });

    describe('PUT', () => {
        it('should update user data when given valid data', async () => {
            const existingUser = {
                id: 1,
                first_name: 'Existing',
                last_name: 'User',
                email_id: 'existinguser@emdd',
                password_hash: await bcrypt.hash('Test@123', saltRounds),
                status: 'Enabled',
                organization_id: 1,
            };

            const updatedUser = {
                ...existingUser,
                first_name: 'Updated',
                last_name: 'User',
                password_hash: await bcrypt.hash('TestChange@123', saltRounds),
                organization_id: 2,
                user_role: [
                    {
                        roleId: 2,
                        role: {
                            name: 'Organisation Admin',
                        },
                    },
                ],
            };

            prismaMock.user.findUnique.mockResolvedValue(existingUser as any);
            prismaMock.user.update.mockResolvedValue(updatedUser as any);
            prismaMock.user_role.deleteMany.mockResolvedValue({ count: 1 });
            prismaMock.user_role.createMany.mockResolvedValue({ count: 1 });

            const requestBody = {
                email_id: 'existinguser@emdd',
                first_name: 'Updated',
                last_name: 'User',
                oldPassword: 'Test@123',
                newPassword: 'TestChange@123',
                organization: 2,
                roles: [2],
            };

            const request = new Request('http://example.com/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
            expect(data).toEqual(updatedUser);
        });

        it('should return NOT_FOUND status when user does not exist', async () => {
            prismaMock.user.findUnique.mockResolvedValue(null);

            const requestBody = {
                email_id: 'nonexistentuser@emdd',
                first_name: 'Updated',
                last_name: 'User',
            };

            const request = new Request('http://example.com/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.NOT_FOUND);
            expect(data).toEqual({ error: MESSAGES.USER_NOT_FOUND });
        });

        it('should return UNAUTHORIZED status when old password_hash is invalid', async () => {
            const existingUser = {
                id: 1,
                email_id: 'existinguser@emdd',
                password_hash: await bcrypt.hash('correctpassword_hash', saltRounds),
            };

            prismaMock.user.findUnique.mockResolvedValue(existingUser as any);

            const requestBody = {
                email_id: 'existinguser@emdd',
                oldPassword: 'Wrong@123',
                newPassword: 'Check@123',
            };

            const request = new Request('http://example.com/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await PUT(request);
            const data = await response.json();

            expect(response.status).toBe(STATUS_TYPE.UNAUTORIZED);
            expect(data).toEqual({ error: MESSAGES.INVALID_LOGIN_CREDENTIALS });
        });
    });
});