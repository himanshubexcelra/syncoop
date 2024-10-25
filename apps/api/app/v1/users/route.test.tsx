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
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@emdd',
                password: await bcrypt.hash('Test@123', saltRounds),
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
                firstName: 'New',
                lastName: 'User',
                email: 'newuser@emdd',
                password: await bcrypt.hash('Test@123', saltRounds),
                status: 'Enabled',
                organizationId: 1,
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
                firstName: 'New',
                lastName: 'User',
                email: 'newuser@emdd',
                password: '123456',
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

        it('should return CONFLICT status when email already exists', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: 1 } as any);

            const requestBody = {
                firstName: 'New',
                lastName: 'User',
                email: 'existinguser@emdd',
                password: 'Test@123',
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
                firstName: 'Existing',
                lastName: 'User',
                email: 'existinguser@emdd',
                password: await bcrypt.hash('Test@123', saltRounds),
                status: 'Enabled',
                organizationId: 1,
            };

            const updatedUser = {
                ...existingUser,
                firstName: 'Updated',
                lastName: 'User',
                password: await bcrypt.hash('TestChange@123', saltRounds),
                organizationId: 2,
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
                email: 'existinguser@emdd',
                firstName: 'Updated',
                lastName: 'User',
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
                email: 'nonexistentuser@emdd',
                firstName: 'Updated',
                lastName: 'User',
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

        it('should return UNAUTHORIZED status when old password is invalid', async () => {
            const existingUser = {
                id: 1,
                email: 'existinguser@emdd',
                password: await bcrypt.hash('correctpassword', saltRounds),
            };

            prismaMock.user.findUnique.mockResolvedValue(existingUser as any);

            const requestBody = {
                email: 'existinguser@emdd',
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