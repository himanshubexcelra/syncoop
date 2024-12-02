/*eslint max-len: ["error", { "code": 100 }]*/
import { getMoleculesOrder } from "../service";
import { MoleculeOrderParams } from "@/lib/definition";

describe('getMoleculesOrder', () => {
    const mockParams: MoleculeOrderParams = { organization_id: 1, created_by: 123 };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    it.skip('fetches molecule orders with correct query parameters', async () => {
        const mockResponse = [{ id: 1, order_name: 'Test Order' }];
        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: jest.fn().mockResolvedValueOnce(mockResponse),
        });

        const data = await getMoleculesOrder(mockParams);

        expect(data).toEqual(mockResponse);
    });

    it.skip('throws an error if response is not ok', async () => {
        const mockResponse: any = {
            success: false,
            errorMessage: 'Molecule order does not exist',
        };
        (fetch as jest.Mock).mockResolvedValueOnce({
            status: 404,
            json: jest.fn().mockResolvedValueOnce(mockResponse),
        });

        const response = getMoleculesOrder(mockParams);

        await expect(response).rejects.toThrow(`Error: Molecule order does not exist`);
    });

    it('throws an error when fetch fails', async () => {
        (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(getMoleculesOrder(mockParams)).rejects.toThrow('Network error');
    });
});
