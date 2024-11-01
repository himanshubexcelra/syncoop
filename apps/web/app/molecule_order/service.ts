/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

interface MoleculeOrderParams {
    projectId?: string;
    libraryId?: string;
    organizationId?: string;
}

export async function getMoleculesOrder(params: MoleculeOrderParams) {
    const url = new URL(`${process.env.API_HOST_URL}/v1/molecule_order`);

    // Add query parameters based on provided params
    if (params.organizationId && params.projectId && params.libraryId) {
        url.searchParams.append("organizationId", params.organizationId);
        url.searchParams.append("projectId", params.projectId);
        url.searchParams.append("libraryId", params.libraryId);
    }

    try {
        const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching molecule_order data:", error);
        throw error;
    }
}
