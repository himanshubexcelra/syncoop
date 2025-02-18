import { uploadMoleculeSmiles } from '../../service';
global.fetch = jest.fn();

describe('API for upload molecules', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should send a request to upload molecule smiles and return data', async () => {
        const mockResponse = { message: 'Success', data: [] };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: jest.fn().mockResolvedValue(mockResponse),
            })
        ) as jest.Mock;

        const formData = new FormData();
        formData.append('smiles', JSON.stringify(["CCO"]));
        formData.append('createdBy', '1');
        formData.append('library_id', JSON.stringify([123]));
        formData.append('project_id', '456');
        formData.append('organization_id', '789');
        formData.append('source_molecule_name', 'Test Molecule');
        formData.append('checkDuplicate', "true");

        const result = await uploadMoleculeSmiles(formData);

        expect(fetch).toHaveBeenCalledWith(
            `${process.env.PYTHON_API_HOST_URL}/upload_molecule_smiles`,
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    smiles: ["CCO"],
                    createdBy: '1',
                    libraryId: [123],
                    projectId: '456',
                    organizationId: '789',
                    sourceMoleculeName: 'Test Molecule',
                    checkDuplicate: "true"
                }),
            })
        );

        expect(result).toEqual(mockResponse);
    });



});
