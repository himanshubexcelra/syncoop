import { uploadMoleculeSmiles, uploadMoleculeFile, updateMoleculeSmiles } from '../service';

global.fetch = jest.fn() as jest.Mock;

describe('Molecule APIs', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('uploadMoleculeSmiles', () => {
        it('Upload smile successfully', async () => {
            const formData = new FormData();
            formData.append('smiles', 'CCO');
            formData.append('created_by_user_id', '1');
            formData.append('library_id', '1');
            formData.append('project_id', '1');
            formData.append('organization_id', '1');
            formData.append('source_molecule_name', 'test_mol');

            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true }),
            });

            const response = await uploadMoleculeSmiles(formData);

            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/molecule/upload_molecule_smiles`,
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            expect(response).toEqual({ success: true });
        });

        it('Upload smile error', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve({ error: 'smile already exists' }),
            });

            const formData = new FormData();
            const response = await uploadMoleculeSmiles(formData);

            expect(response).toEqual({ error: 'smile already exists' });
        });
    });

    describe('uploadMoleculeFile', () => {
        it('Upload molecule file success', async () => {
            const formData = new FormData();
            formData.append('file', new Blob(['molecules']), 'molecules.txt');

            (fetch as jest.Mock).mockResolvedValueOnce({
                status: 200,
                json: () => Promise.resolve({ success: true }),
            });

            const response = await uploadMoleculeFile(formData);

            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/molecule/upload_molecule_files`,
                expect.objectContaining({
                    method: 'POST',
                    body: formData,
                })
            );
            expect(response).toEqual({ success: true });
        });

        it('upload molecule file error', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                status: 400,
                json: () => Promise.resolve({ error: 'Invalid file format' }),
            });

            const formData = new FormData();
            const response = await uploadMoleculeFile(formData);

            expect(response).toEqual({ status: 400, error: { error: 'Invalid file format' }});
        });
    });

    describe('updateMoleculeSmiles', () => {
        it('update molecules success', async () => {
            const formData = new FormData();
            formData.append('molecules', JSON.stringify([{ id: 1, smiles: 'CCO' }]));
            formData.append('updatedBy', '1');

            (fetch as jest.Mock).mockResolvedValueOnce({
                json: () => Promise.resolve({ success: true }),
            });

            const response = await updateMoleculeSmiles(formData);

            expect(fetch).toHaveBeenCalledWith(
                `${process.env.PYTHON_API_HOST_URL}/molecule/update_molecule`,
                expect.objectContaining({
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                })
            );
            expect(response).toEqual({ success: true });
        });
    });
});
