/*eslint max-len: ["error", { "code": 100 }]*/
import {
    getMoleculesOrder,
    getReactionPathway,
    getSolventTemperature,
    updateReaction,
    saveReactionPathway,
    searchInventory
} from "../service";

describe('getMoleculesOrder', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    test('getMoleculeOrder API responds with a 200 status', async () => {
        const mockParams: any = {
            organization_id: '123',
            created_by: '456',
        };
        const mockResponse = { success: true, data: [] };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await getMoleculesOrder(mockParams);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule_order?organization_id=123&created_by=456`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        expect(result).toEqual(mockResponse);

    });


    test('getReactionPathway API responds with a 200 status', async () => {
        const mockData = { pathway: 'example pathway data' };
        const moleculeId = 123;
        const pathwayId = '456';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockData),
            })
        ) as jest.Mock;

        const result = await getReactionPathway(moleculeId, pathwayId);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.any(URL),
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        expect(result).toEqual(mockData);
    });
    test('should throw an error when the API responds with other than 200 status', async () => {
        const moleculeId = 123;
        const errorMessage = 'Some error occurred';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: jest.fn().mockResolvedValue({ errorMessage }),
            })
        ) as jest.Mock;
        await expect(getReactionPathway(moleculeId)).rejects.toThrow(`Error: ${errorMessage}`);
    });

    test('getSolventTemperature API responds with a 200 status', async () => {
        const mockData = { temperature: 25 };
        const name = 'water';

        // Mock fetch with `ok` property
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValue(mockData),
            })
        ) as jest.Mock;

        const result = await getSolventTemperature(name);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/reaction_template_master?name=${name}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
        expect(result).toEqual(mockData);
    });

    test('updateReaction API responds with a 200 status', async () => {
        const mockResponse = { data: { success: true } };
        const payload = { reactionId: 123, newValue: 'updated value' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await updateReaction(payload);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/pathway`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );
        expect(result).toEqual(mockResponse.data);
    });

    test('saveReactionPathway API responds with a 200 status', async () => {
        const mockResponse = { success: true };
        const formData: any = [
            { pathwayId: 1, name: 'Pathway 1' },
            { pathwayId: 2, name: 'Pathway 2' },
        ];

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;

        const result = await saveReactionPathway(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            `${process.env.NEXT_API_HOST_URL}/v1/pathway`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            }
        );
        expect(result).toEqual(mockResponse);
    });
    test('searchInventory API responds successfully', async () => {
        const mockResponse = { results: ['item1', 'item2'] };
        const payload = { query: 'search term' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true, // Add the `ok` property to indicate a successful response
                json: jest.fn().mockResolvedValueOnce(mockResponse),
            })
        ) as jest.Mock;
        const result = await searchInventory(payload);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/search_inventory'),
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );
        expect(result).toEqual(mockResponse);
    });

});