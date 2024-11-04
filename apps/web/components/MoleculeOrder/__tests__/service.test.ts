/*eslint max-len: ["error", { "code": 100 }]*/
import { getMoleculesOrder } from "../service";

global.fetch = jest.fn();

describe('getMoleculesOrder', () => {
    const mockParams = { organizationId: 1, createdBy: 123 };

    // In service.test.ts
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { }); // Suppress console.error
    });

    it('fetches molecule orders with correct query parameters', async () => {
        const mockResponse = [{ id: 1, orderName: 'Test Order' }];
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponse,
        });

        const data = await getMoleculesOrder(mockParams);

        // Verify that fetch was called with the correct URL and headers
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('organizationId=1&createdBy=123'),
            {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            }
        );
        expect(data).toEqual(mockResponse);
    });

    it('throws an error if response is not ok', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            statusText: 'Not Found',
        });

        await expect(getMoleculesOrder(mockParams)).rejects.toThrow('Error: Not Found');
    });

    it('throws an error when fetch fails', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        await expect(getMoleculesOrder(mockParams)).rejects.toThrow('Network error');
    });
});