import { prismaMock } from "@/singleton"
import { POST, DELETE, GET } from "./route"
import { STATUS_TYPE } from "@/utils/message"
describe('Molecule Cart API test', () => {
    describe('POST Method', () => {
        const requestBody = [{
            molecule_id: '1',
            library_id: '2',
            organization_id: '1',
            project_id: '1',
            userId: '1',
            order_id: '6',
        }]

        it('should update molecules and create cart items successfully', async () => {
            prismaMock.molecule.updateMany.mockResolvedValue({ count: 1 });

            prismaMock.molecule_cart.createMany.mockResolvedValue({ count: 1 });


            const request = new Request('http://example.com/molecule_cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            const response = await POST(request);
            const data = await response.json();
            expect(response.status).toBe(STATUS_TYPE.SUCCESS);
            expect(data).toEqual({ "count": 1 });
        });
    })

    describe('DELETE molecule cart API', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should delete all entries when no molecule_id, library_id, or project_id is provided', async () => {
            const mockRequest = new Request('http://example.com/api/molecule_cart?userId=1');
            const mockResponse = await DELETE(mockRequest);

            expect(prismaMock.molecule_cart.deleteMany).toHaveBeenCalled();

            const responseJson = await mockResponse.json();
            expect(responseJson).toEqual([{}]);  // Success response
            expect(mockResponse.status).toBe(STATUS_TYPE.SUCCESS); // Success status
        });

        it('should delete based on molecule_id, library_id, and project_id', async () => {
            const mockRequest = new Request('http://example.com/api/molecule_cart?molecule_id=2&library_id=3&project_id=4&userId=1');
            const mockResponse = await DELETE(mockRequest);
            expect(prismaMock.molecule_cart.deleteMany).toHaveBeenCalledWith({
                where: {
                    molecule_id: 2,
                    library_id: 3,
                    project_id: 4,
                    created_by: 0,
                },
            });

            const responseJson = await mockResponse.json();
            expect(responseJson).toEqual([{}]);  // Success response
            expect(mockResponse.status).toBe(STATUS_TYPE.SUCCESS); // Success status
        });

    });


    describe('GET method', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('Successful response with query parameters', async () => {
            const request = {
                url: 'http://localhost/?library_id=1&userId=123&project_id=10&organization_id=5',
            };

            const mockData = [{
                molecular_weight: 100,
                source_molecule_name: 'Molecule 1',
                is_added_to_cart: true,
                smiles_string: 'SMILES1',
                library: { id: 1, name: 'Library 1', project: { id: 10, name: 'Project 1' } },
                organization: { name: 'Org 1' },
            }];

            (prismaMock.molecule_cart.findMany as jest.Mock).mockResolvedValue(mockData);

            const response = await GET(request as Request);

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(mockData);
            expect(prismaMock.molecule_cart.findMany).toHaveBeenCalled();
        });

        it('response with only userId', async () => {
            const request = {
                url: 'http://localhost/?userId=123',
            };

            const mockData = [{
                molecular_weight: 100,
                source_molecule_name: 'Molecule 1',
                is_added_to_cart: true,
                smiles_string: 'SMILES1',
                library: { id: 1, name: 'Library 1', project: { id: 10, name: 'Project 1' } },
                organization: { name: 'Org 1' },
            }];

            (prismaMock.molecule_cart.findMany as jest.Mock).mockResolvedValue(mockData);

            const response = await GET(request as Request);

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual(mockData);
            expect(prismaMock.molecule_cart.findMany).toHaveBeenCalled();
        });
    });
})