import { DELETE, POST } from './route';
import { prismaMock } from "@/singleton"
import { ContainerType } from '@/utils/definition';
import { STATUS_TYPE } from '@/utils/message';
describe('Project Handlers', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('test case for project/route', () => {
        test('should create a new project', async () => {
            const mockProject = { id: 1, name: 'Test Project' };
            prismaMock.container.findMany.mockResolvedValue([]); // No existing project
            prismaMock.container.create.mockResolvedValue(mockProject); // Mock project creation
            const request = {
                json: async () => ({
                    name: 'Test Project',
                    type: ContainerType.PROJECT,
                    description: 'This is a test project.',
                    organization_id: 1,
                    user_id: 1,
                    config: {},
                    sharedUsers: [],
                }),
            };
            const response: any = await POST(request as unknown as Request);
            expect(prismaMock.container.findMany).toHaveBeenCalled();
            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
            const body = await response.json();
            expect(body).toEqual(mockProject);
        });

        test('should delete a project and related resources', async () => {
            prismaMock.molecule.deleteMany.mockResolvedValue({ parent_id: 1 });
            prismaMock.container.deleteMany.mockResolvedValue({});
            prismaMock.container.delete.mockResolvedValue({ id: 1 });

            const request = { url: 'http://localhost?project_id=1&parent_id=2' };

            const response = await DELETE(request as unknown as Request);

            expect(prismaMock.container.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
        });
    });
});
