import { prismaMock } from "@/singleton"
import { POST } from "./route"
import { MESSAGES, STATUS_TYPE } from "@/utils/message"
import bcrypt from "bcrypt";
const saltRounds = 10;
describe('Auth API', () => {

    describe('POST', () => {
        it('should validate user logged in', async () => {
            const user = {
                id: 1,
                status: 'Enabled',
                first_name: 'Test',
                last_name: 'User',
                email_id: 'testuser@prisma.io',
                password_hash: await bcrypt.hash('123456', saltRounds),
                user_role: [
                    {
                        role: {
                            type: 'admin',
                            module_permission: [],
                            product_module_action_role_permission: []
                        }
                    }
                ]
            } as any;

            prismaMock.users.findFirst.mockResolvedValue(user);

            const request = {
                json: async () => {
                    return {
                        email_id: 'hello@prisma',
                        password_hash: '123456'
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
            prismaMock.users.findFirst.mockImplementation();

            const request = {
                json: async () => {
                    return {
                        email_id: 'hello@prisma.io',
                        password_hash: '---'
                    }
                }
            }

            const authUser = await POST(request as Request);
            const response = authUser.json();

            await expect(response).resolves.toEqual({
                success: false,
                errorMessage: MESSAGES.INVALID_LOGIN_CREDENTIALS
            })
        });

        it('should throw webhook error for bad request', async () => {
            prismaMock.users.findFirst.mockImplementation();

            const request = {};

            const authUser = await POST(request as Request);
            const response = await authUser.json();

            expect(response.errorMessage).toContain('Webhook error:');
            expect(authUser.status).toBe(STATUS_TYPE.BAD_REQUEST);
        });
    })
})