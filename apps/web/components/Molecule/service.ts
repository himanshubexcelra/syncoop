import {
    UploadMoleculeFileRequest,
    UploadMoleculeSmilesRequest,
    ValidateSmileRequest
} from "../../lib/definition";
import CustomFile from "../../utils/file";

export async function validateSmiles(smiles: ValidateSmileRequest) {
    try {
        const response: any = await fetch(
            `http://localhost:8000/validate_smiles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(smiles),
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        return error;
    }
}


export async function uploadMoleculeSmiles(formData: UploadMoleculeSmilesRequest) {
    try {
        const response: any = await fetch(
            `http://localhost:8000/upload_molecule_smiles`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        return error;
    }
}

export async function uploadMoleculeFile(data: UploadMoleculeFileRequest) {
    try {
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('created_by_user_id', data.created_by_user_id);
        formData.append('library_id', data.library_id);
        formData.append('project_id', data.project_id);
        formData.append('organization_id', data.organization_id);
        formData.append('updated_by_user_id', data.updated_by_user_id);
        const response = await fetch(`http://localhost:8000/upload_molecule_files`, {
            method: "POST",
            body: formData,
        });
        if (response.status === 200) {
            const data = await response.json();
            // Can use following code to download rejected Smiles
            // const header = {smiles: "SMILE", reason: "Reason"}
            // downloadCSV(header, data.rejected_smiles, 'rejected_smiles')
            return data;
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        return error;
    }
}

export const downloadCSV = (
    header: any,
    data: any,
    filename: string) => {

    const rows: any = [header, ...data];
    const csvData = CustomFile.convertToCSV(rows);
    return CustomFile.downLoad(csvData, filename, 'csv');
}