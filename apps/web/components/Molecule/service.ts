"use server";

export async function uploadMoleculeSmiles(formData: FormData) {
    const requestBody = {
        smiles: formData.get('smiles'),
        "created_by_user_id": formData.get('created_by_user_id'),
        "library_id": formData.get('library_id'),
        "project_id": formData.get('project_id'),
        "organization_id": formData.get('organization_id'),
        "source_molecule_name": formData.get('source_molecule_name')
    }
    const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/molecule/upload_molecule_smiles`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        })
    if (response.status === 200) {
        const data = await response.json();
        return data;
    } else {
        const error = await response.json();
        return { status: response.status, error };
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
            molecules: formData.get('molecules'),
            "updated_by_user_id": formData.get('updated_by_user_id'),
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
