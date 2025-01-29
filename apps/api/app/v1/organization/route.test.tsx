import { prismaMock } from "@/singleton"
import { DELETE } from "./route"

describe('Organization API Test Case', () => {

    test('DELETE Method/should delete data successfully', async () => {
        prismaMock.org_product_module.deleteMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.molecule.deleteMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.container.deleteMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.users.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
        prismaMock.users.updateMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.user_role.deleteMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.users.deleteMany.mockResolvedValue({ count: 1 } as any);
        prismaMock.$transaction.mockImplementationOnce(async (callback) => {
            return await callback(prismaMock);
        });
        const request = new Request('http://localhost/api?org_id=123&orgProjectIds=[1,2,3]', {
            method: 'DELETE',
        });
        const response = await DELETE(request);
        expect(prismaMock.org_product_module.deleteMany).toHaveBeenCalledWith({
            where: { organization_id: 123 },
        });
        expect(prismaMock.molecule.deleteMany).toHaveBeenCalledWith({
            where: { organization_id: 123 },
        });
        expect(prismaMock.users.findMany).toHaveBeenCalledWith({
            where: { organization_id: 123 },
            select: { id: true },
        });
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ success: true, message: 'Entities deleted successfully' });

    });
})