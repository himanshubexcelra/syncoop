"use server";

export async function uploadMoleculeSmiles(formData: FormData) {
    const requestBody = {
        "smiles": formData.get('smiles'),
        "createdBy": formData.get('created_by_user_id'),
        "libraryId": formData.get('library_id'),
        "projectId": formData.get('project_id'),
        "organizationId": formData.get('organization_id'),
        "sourceMoleculeName": formData.get('source_molecule_name')
    }
    const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/molecule/upload_molecule_smiles`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
    if (response) {
        const data = await response.json();
        return data;
    }
}

export async function uploadMoleculeFile(formData: FormData) {
    try {

        const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/molecule/upload_molecule_files`, {
            method: "POST",
            body: formData,
        });
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        return error;
    }
}

export async function updateMoleculeSmiles(formData: FormData) {
    try {
        const requestBody = {
            molecules: JSON.parse(formData.get('molecules') as string),
            "updatedBy": formData.get('updatedBy'),
        }
        const response: any = await fetch(
            `${process.env.PYTHON_API_HOST_URL}/molecule/update_molecule`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (response) {
            const data = await response.json();
            return data;
        }
    } catch (error: any) {
        return error;
    }
}
