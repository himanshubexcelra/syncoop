import {
    validateSmiles,
    uploadMoleculeSmiles,
    uploadMoleculeFile
} from '../service';
import {
    UploadMoleculeFileRequest,
    UploadMoleculeSmilesRequest,
    ValidateSmileRequest
} from '../../../lib/definition';

describe('Molecules APIs', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateSmiles', () => {
        const smileData: ValidateSmileRequest = { smiles: 'Cc1ccccc1' };

        it('Handle Successful response', async () => {
            const mockResponse = { isValid: true };
            (fetch as jest.Mock).mockResolvedValue({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await validateSmiles(smileData);
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/validate_smiles`,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(smileData),
                })
            );
        });

        it('Handle Internal Server error', async () => {
            const mockError = { message: 'Internal Server Error' };
            (fetch as jest.Mock).mockResolvedValue({
                status: 500,
                json: jest.fn().mockResolvedValue(mockError),
            });

            const result = await validateSmiles(smileData);
            expect(result).toEqual({ status: 500, error: mockError });
        });

        it('Handle Network error', async () => {
            const mockError = new Error('Network Error');
            (fetch as jest.Mock).mockRejectedValue(mockError);

            const result = await validateSmiles(smileData);
            expect(result).toEqual(mockError);
        });
    });

    describe('uploadMoleculeSmiles', () => {
        const moleculeData: UploadMoleculeSmilesRequest = {
            smiles: ['C1C=CC=CC=1'],
            created_by_user_id: 1,
            library_id: '2',
            project_id: '1',
            organization_id: '1',
            source_molecule_name: '',
        };

        it('Handle successful response', async () => {
            const mockResponse = { success: true };
            (fetch as jest.Mock).mockResolvedValue({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await uploadMoleculeSmiles(moleculeData);
            expect(result).toEqual(mockResponse);
            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/upload_molecule_smiles`,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(moleculeData),
                })
            );
        });

        it('Handle Internal server error', async () => {
            const mockError = { message: 'Server Error' };
            (fetch as jest.Mock).mockResolvedValue({
                status: 500,
                json: jest.fn().mockResolvedValue(mockError),
            });

            const result = await uploadMoleculeSmiles(moleculeData);
            expect(result).toEqual({ status: 500, error: mockError });
        });

        it('Handle network failure', async () => {
            const mockError = new Error('Network Error');
            (fetch as jest.Mock).mockRejectedValue(mockError);

            const result = await uploadMoleculeSmiles(moleculeData);
            expect(result).toEqual(mockError);
        });
    });

    describe('uploadMoleculeFile', () => {
        const file = new File(['dummy content'], 'test.sdf', { type: 'application/sdf' });
        const moleculeFileData: UploadMoleculeFileRequest = {
            file,
            created_by_user_id: '1',
            library_id: '2',
            project_id: '1',
            organization_id: '1',
            updated_by_user_id: '1',
        };

        it('Handle successful response', async () => {
            const mockResponse = { success: true };
            (fetch as jest.Mock).mockResolvedValue({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const result = await uploadMoleculeFile(moleculeFileData);
            expect(result).toEqual(mockResponse);

            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/upload_molecule_files`,
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                })
            );
            const formData = fetch.mock.calls[0][1].body;
            expect(formData.get('file')).toEqual(file);
            expect(formData.get('created_by_user_id')).toEqual('1');
            expect(formData.get('library_id')).toEqual('2');
        });

        it('Handle Internal server error', async () => {
            const mockError = { message: 'Server Error' };
            (fetch as jest.Mock).mockResolvedValue({
                status: 500,
                json: jest.fn().mockResolvedValue(mockError),
            });

            const result = await uploadMoleculeFile(moleculeFileData);
            expect(result).toEqual({ status: 500, error: mockError });
        });

        it('Handle network failure', async () => {
            const mockError = new Error('Network Error');
            (fetch as jest.Mock).mockRejectedValue(mockError);

            const result = await uploadMoleculeFile(moleculeFileData);
            expect(result).toEqual(mockError);
        });
    });

});
