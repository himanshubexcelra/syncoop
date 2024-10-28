import {
    UploadMoleculeSmilesRequest,
    ValidateSmileRequest
} from "../../lib/definition";

// const sampleMolecules = {
//     "smiles": "Cc1ccccc1"
// }

export async function validateSmiles(smiles: ValidateSmileRequest) {
    try {
        const response: any = await fetch(
            `${process.env.API_END_POINT}/validate_smiles`,
            {
                mode: "no-cors",
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

// const sampleMolecules = {
//     "smiles": ["Cc1ccccc1", "CCO"],
//     "created_by_user_id": 1,
//     "library_id": "LIB001"
// }

export async function uploadMoleculeSmiles(formData: UploadMoleculeSmilesRequest) {
    try {
        const response: any = await fetch(
            `${process.env.API_END_POINT}/upload_molecule_smiles`,
            {
                mode: "no-cors",
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

export async function uploadMoleculeFile(file: File) {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${process.env.API_END_POINT}/upload_molecule_files`, {
            method: "POST",
            body: formData,
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        console.error('Error uploading file:', error);
        return error;
    }
}