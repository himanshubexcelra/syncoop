import { prismaMock } from "@/singleton"
import { GET, POST } from "./route"
import { STATUS_TYPE } from "@/utils/message"

describe('GET /moleculeOrder', () => {
    test('should return molecule order details successfully', async () => {
        const mockResponse = [{
            id: "1_order1",
            order_id: 1,
            order_name: 'Test Order 1',
            organization_id: 123,
            ordered_molecules: ['mol1', 'mol2'],
            molecule_id: 1,
            source_molecule_name: 'Source1',
            status: 1,
            molecule_status: 'Ordered',
            disabled: false,
        }];

        // Mock the Prisma $queryRaw call
        prismaMock.$queryRaw.mockResolvedValue(mockResponse);

        const request = new Request('http://localhost/api/moleculeOrder?sample_molecule_id=123');
        const response = await GET(request);

        const responseBody = await response.json();
        expect(response.status).toBe(STATUS_TYPE.SUCCESS);
        expect(responseBody).toEqual(mockResponse);
    });


    test('should return an error if there is a failure', async () => {
        const errorMessage = 'Database error';
        prismaMock.$queryRaw.mockRejectedValue(new Error(errorMessage));

        const request = new Request('http://localhost/api/moleculeOrder?sample_molecule_id=123');
        const response = await GET(request);

        expect(response.status).toBe(STATUS_TYPE.BAD_REQUEST);
        const responseBody = await response.json();
        expect(responseBody.errorMessage).toContain('Webhook error');
    });
    test('should create a new molecule order and update molecule statuses', async () => {
        const reqBody = {
            order_id: 2,
            order_name: 'Test Order 1',
            organization_id: 2,
            ordered_molecules: [1, 2],
            created_by: 3,
            status: 1,
            reactionStatus: 4
        };
        const org_id = BigInt(123);
        const numberOrgValue = Number(org_id);
        const mockCreateResponse:any = {
            "id": 14,
            "order_id": "2",
            "order_name": "NewOrder",
            "organization_id": numberOrgValue,
            "ordered_molecules": [
                1,
                2
            ],
            "synthesis_batch_submission": null,
            "status": 1,
            "created_by": 3,
            "updated_at": null,
            "updated_by": 3
        };
        prismaMock.molecule_order.create.mockResolvedValue(mockCreateResponse);
        prismaMock.molecule.updateMany.mockResolvedValue({ count: 2 });

        const request = new Request('http://localhost/api/moleculeOrder', {
            method: 'POST',
            body: JSON.stringify(reqBody),
        });

        const response = await POST(request);
        const responseBody = await response.json();

        expect(response.status).toBe(STATUS_TYPE.SUCCESS);
        expect(responseBody).toEqual(mockCreateResponse);
        expect(prismaMock.molecule.updateMany).toHaveBeenCalledTimes(1);

    });

})