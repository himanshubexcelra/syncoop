"use server";

export async function uploadMoleculeSmiles(formData: FormData) {
    const requestBody = {
        "smiles": JSON.parse(formData.get('smiles') as string),
        "createdBy": formData.get('createdBy'),
        "libraryId": formData.get('library_id'),
        "projectId": formData.get('project_id'),
        "organizationId": formData.get('organization_id'),
        "sourceMoleculeName": formData.get('source_molecule_name'),
        "checkDuplicate": formData.get('checkDuplicate')
    }

    const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/upload_molecule_smiles`,
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

        const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/upload_molecule_files`, {
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
            "libraryId": formData.get('libraryId')
        }
        const response: any = await fetch(
            `${process.env.PYTHON_API_HOST_URL}/update_molecule`,
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
