import {
    validateSmiles,
    uploadMoleculeSmiles,
    uploadMoleculeFile
} from '../service';
import {
    ValidateSmileRequest,
    UploadMoleculeSmilesRequest
} from "../../../lib/definition";

describe('Molecule API Functions', () => {
    const mockSmilesData = { smiles: "Cc1ccccc1" };
    const mockUploadMoleculeData = {
        smiles: ["Cc1ccccc1", "CCO"],
        created_by_user_id: 1,
        library_id: "LIB001"
    };
    const mockFile = new File(["test molecules"], "molecule.csv", { type: "text/csv" });
    const mockResponseData = { status: 'success', data: 'Mocked response data' };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('validateSmiles should validate smiles given as part of request', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponseData),
            })
        ) as jest.Mock;

        const result = await validateSmiles(mockSmilesData as ValidateSmileRequest);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_END_POINT}/validate_smiles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockSmilesData),
        });
        expect(result).toEqual(mockResponseData);
    });

    test('uploadMoleculeSmiles should upload molecule smiles', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponseData),
            })
        ) as jest.Mock;

        const result = await uploadMoleculeSmiles(mockUploadMoleculeData as UploadMoleculeSmilesRequest);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_END_POINT}/upload_molecule_smiles`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mockUploadMoleculeData),
        });
        expect(result).toEqual(mockResponseData);
    });

    test('uploadMoleculeFile should upload molecule file', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: jest.fn().mockResolvedValue(mockResponseData),
            })
        ) as jest.Mock;

        const result = await uploadMoleculeFile(mockFile);

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(`${process.env.API_END_POINT}/upload_molecule_files`, {
            method: "POST",
            body: expect.any(FormData),
        });
        expect(result).toEqual(mockResponseData);
    });
    it('should handle 500 error in validateSmiles', async () => {
        const mockErrorResponse = {
            status: 500,
            json: jest.fn().mockResolvedValue({ error: "Internal Server Error" })
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

        const smiles = { smiles: "Cc1ccccc1" };
        const result = await validateSmiles(smiles);

        expect(global.fetch).toHaveBeenCalledWith(
            `${process.env.API_END_POINT}/validate_smiles`,
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(smiles)
            })
        );
        expect(result).toEqual({ status: 500, error: { error: "Internal Server Error" } });
    });

    it('should handle 500 error in uploadMoleculeSmiles', async () => {
        const mockErrorResponse = {
            status: 500,
            json: jest.fn().mockResolvedValue({ error: "Internal Server Error" })
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

        const formData = {
            smiles: ["Cc1ccccc1", "C1=CCC=CC1"],
            created_by_user_id: 1,
            library_id: "LIB001"
        };
        const result = await uploadMoleculeSmiles(formData);

        expect(global.fetch).toHaveBeenCalledWith(
            `${process.env.API_END_POINT}/upload_molecule_smiles`,
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(formData)
            })
        );
        expect(result).toEqual({ status: 500, error: { error: "Internal Server Error" } });
    });

    it('should handle 500 error in uploadMoleculeFile', async () => {
        const mockErrorResponse = {
            status: 500,
            json: jest.fn().mockResolvedValue({ error: "Internal Server Error" })
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);

        const mockFile = new File(["sample data"], "test.csv", { type: "text/csv" });
        const result = await uploadMoleculeFile(mockFile);

        expect(global.fetch).toHaveBeenCalledWith(
            `${process.env.API_END_POINT}/upload_molecule_files`,
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData)
            })
        );
        expect(result).toEqual({ status: 500, error: { error: "Internal Server Error" } });
    });
    it('should handle network or unexpected errors in validateSmiles', async () => {
        const mockError = new Error("Network Error");
        (global.fetch as jest.Mock).mockRejectedValue(mockError);

        const smiles = { smiles: "Cc1ccccc1" };
        const result = await validateSmiles(smiles);

        expect(global.fetch).toHaveBeenCalledWith(
            `${process.env.API_END_POINT}/validate_smiles`,
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(smiles)
            })
        );
        expect(result).toEqual(mockError);
    });

    it('should handle network or unexpected errors in uploadMoleculeSmiles', async () => {
        const mockError = new Error("Network Error");
        (global.fetch as jest.Mock).mockRejectedValue(mockError);

        const formData = {
            smiles: ["Cc1ccccc1", "C1=CCC=CC1"],
            created_by_user_id: 1,
            library_id: "LIB001"
        };
        const result = await uploadMoleculeSmiles(formData);

        expect(global.fetch).toHaveBeenCalledWith(
            `${process.env.API_END_POINT}/upload_molecule_smiles`,
            expect.objectContaining({
                method: "POST",
                body: JSON.stringify(formData)
            })
        );
        expect(result).toEqual(mockError);
    });

    it('should handle network or unexpected errors in uploadMoleculeFile', async () => {
        const mockError = new Error("Network Error");
        (global.fetch as jest.Mock).mockRejectedValue(mockError);

        const mockFile = new File(["sample data"], "test.csv", { type: "text/csv" });
        const result = await uploadMoleculeFile(mockFile);

        expect(global.fetch).toHaveBeenCalledWith(
            '${process.env.API_END_POINT}/upload_molecule_files/upload_molecule_files',
            expect.objectContaining({
                method: "POST",
                body: expect.any(FormData)
            })
        );
        expect(result).toEqual(mockError);
    });
});
