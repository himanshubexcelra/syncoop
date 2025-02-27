import { prismaMock } from "@/singleton"
import { GET, POST } from "./route"
import { STATUS_TYPE } from "@/utils/message"

describe('Lab Job Order API', () => {

    test.skip('GET Method/should return molecule data successfully', async () => {
        const mockMoleculeData: any = [{
            id: 1,
            name: 'Molecule A',
            pathway: [{ pathway_instance_id: 1, updated_at: '2022-12-01' }],
            organization: { name: 'Org A' },
        }];

        prismaMock.molecule.findUnique.mockResolvedValue(mockMoleculeData);

        const mockRequest = new Request('http://localhost:3000/?molecule_ids=[1]');

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(STATUS_TYPE.SUCCESS);
        expect(data).toEqual(mockMoleculeData);
        expect(prismaMock.molecule.findUnique).toHaveBeenCalledWith({
            where: {
                id: {
                    in: [1]
                }
            },
            include: expect.any(Object),
        });
    });

    test('POST Method/should successfully create a lab job order', async () => {
        const mockRequestBody = {
            order: {
                molecule_id: 1,
                pathway_id: 1,
                product_smiles_string: 'C6H12O6',
                product_molecule_weight: 180.16,
                no_of_steps: 5,
                functional_bioassays: 'Some assays',
                reactions: [],
                status: 'active',
                created_by: 'user123',
                reactionStatus: 'completed',
            },
        };

        const mockResponseData: any = {
            id: 123,
            molecule_id: 1,
            pathway_id: 1,
            status: 'active',
            created_by: 'user123',
        };

        prismaMock.reaction_detail.updateMany.mockResolvedValue({ count: 2 });
        prismaMock.lab_job_order.create.mockResolvedValue(mockResponseData);

        const mockRequest = new Request('http://localhost:3000/', {
            method: 'POST',
            body: JSON.stringify(mockRequestBody),
        });

        const response = await POST(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(STATUS_TYPE.SUCCESS);
        expect(data).toEqual(mockResponseData);
        expect(prismaMock.reaction_detail.updateMany).toHaveBeenCalledWith({
            where: { pathway_id: 1 },
            data: { status: 'completed' },
        });
        expect(prismaMock.lab_job_order.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                molecule_id: 1,
                pathway_id: 1,
                status: 'active',
            }),
        });
    });



})