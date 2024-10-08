import { prismaMock } from "@/singleton"
import { POST } from "./route"
import { MESSAGES, STATUS_TYPE } from "@/utils/message"

describe('Auth API', () => {

    describe('POST', () => {
        it('should validate user logged in', async () => {
            const user = {
                id: 1,
                status: 'Enabled',
                firstName: 'Test',
                lastName: 'User',
                email: 'testuser@prisma.io',
                password: '123456',
                user_role: [
                    {
                        role: {
                            type: 'admin',
                            module_permission: [],
                            module_action_role_permission: []
                        }
                    }
                ]
            } as any;

            prismaMock.user.findFirst.mockResolvedValue(user);

            const request = {
                json: async () => {
                    return {
                        email: 'hello@prisma',
                        password: '123456'
                    }
                }
            }

            const authUser = await POST(request as Request);
            const response = authUser.json();

            await expect(response).resolves.toEqual({
                success: true,
                data: user
            })
        })

        it('should throw error when user does not exist', async () => {
            prismaMock.user.findFirst.mockImplementation();

            const request = {
                json: async () => {
                    return {
                        email: 'hello@prisma.io',
                        password: '---'
                    }
                }
            }

            const authUser = await POST(request as Request);
            const response = authUser.json();

            await expect(response).resolves.toEqual({
                success: false,
                errorMessage: MESSAGES.USER_NOT_EXISTS
            })
        });

        it('should throw webhook error for bad request', async () => {
            prismaMock.user.findFirst.mockImplementation();

            const request = {};

            const authUser = await POST(request as Request);
            const response = await authUser.json();

            expect(response.errorMessage).toContain('Webhook error:');
            expect(authUser.status).toBe(STATUS_TYPE.BAD_REQUEST);
        });
    })
})