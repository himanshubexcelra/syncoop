import { getOrganization, editOrganization, createOrganization, deleteOrganization } from '../service';

fdescribe('Organization API Functions', () => {
    const data = [
        {
            name: 'Fauxbio',
            user: {
                email_id: 'max.harrison@fauxbio.com',
            },
            status: 'Active',
            projects: 3,
            molecules: 240,
            users: 200,
            id: 12345,
            creationDate: '2024-08-01',
            lastModifiedDate: '2024-08-01',
        },
        {
            name: 'BioQuest',
            user: {
                email_id: 'elena.garcia@bioquest.com',
            },
            status: 'Active',
            projects: 3,
            molecules: 240,
            users: 200,
            id: 12345,
            creationDate: '2024-08-05',
            lastModifiedDate: '2024-08-01',
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('getOrganization should fetch organization data successfully', async () => {
        const mockResponse = data;

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const withRelation = ['orgUser', 'user_role'];
        const result = await getOrganization({ withRelation });
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/organization`);
        if (withRelation.length) {
            url.searchParams.append('with', JSON.stringify(withRelation));
        }

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        expect(result).toEqual(mockResponse);
    });

    test('editOrganization should update organization successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await editOrganization(formData);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/organization/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(Object.fromEntries(formData)),
        });
        expect(result).toEqual(mockResponse);
    });

    test('editOrganization should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await editOrganization(formData);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });

    test('createOrganization should create organization successfully', async () => {
        const mockResponse = data;
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const result = await createOrganization(formData, 2);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.NEXT_API_HOST_URL}/v1/organization`, {
            mode: "no-cors",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...formData, role_id: 2 }),
        });
        expect(result).toEqual(mockResponse);
    });

    test('createOrganization should handle error responses', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: jest.fn().mockResolvedValue({ error: 'Server Error' }),
            })
        ) as jest.Mock;

        const result = await createOrganization(formData, 2);

        expect(result).toEqual({ status: 500, error: { error: 'Server Error' } });
    });

    test('createOrganization should handle fetch errors', async () => {
        const formData = new FormData();
        formData.append('name', 'Test Organization');
        global.fetch = jest.fn(() => Promise.reject(new Error('Network Error'))) as jest.Mock;
        const result = await createOrganization(formData, 2);
        expect(result).toEqual(new Error('Network Error'));
    });
    test('successfully deletes an organization', async () => {
        const mockResponse = { success: true, message: 'Organization deleted' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const params = {
            org_id: '123',
            orgProjectIds: [20, 21],
        };
        const result = await deleteOrganization(params);
        const expectedUrl = new URL(`${process.env.NEXT_API_HOST_URL}/v1/organization/`);
        if (params.org_id) {
            expectedUrl.searchParams.append('org_id', params.org_id);
        }
        if (params.orgProjectIds) {
            expectedUrl.searchParams.append('orgProjectIds', JSON.stringify(params.orgProjectIds));
        }
        expect(fetch).toHaveBeenCalledTimes(1); 
        expect(fetch).toHaveBeenCalledWith(expectedUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        expect(result).toEqual(mockResponse);
    });

});
