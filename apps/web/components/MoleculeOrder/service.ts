/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import { MoleculeOrderParams, PathwayType } from "@/lib/definition";

export async function getMoleculesOrder(params: MoleculeOrderParams) {

    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_order`);

    // Add query parameters based on provided params
    /* if (params.organization_id) {
        url.searchParams.append("organization_id", params.organization_id.toString());
    }
    if (params.created_by) {
        url.searchParams.append("created_by", params.created_by.toString());
    } */

    if (params) {
        Object.entries(params).map(([key, value]: any) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    return data;
}

export async function getReactionPathway(molecule_id: number, pathwayId?: string) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/pathway`);
    url.searchParams.append("molecule_id", molecule_id.toString());
    if (pathwayId !== undefined) {
        url.searchParams.append("id", pathwayId.toString());
    }
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            const data = await response.json();
            return data;
        }
        else {
            const data = await response.json();
            throw new Error(`Error: ${data.errorMessage}`);
        }

    } catch (error) {
        console.error("Error fetching pathways", error);
        throw error;
    }
}

export async function updateReaction(payLoad: any) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/pathway`);
    try {
        const response = await fetch(url.toString(), {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payLoad)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();

        return data.data;
    } catch (error) {
        console.error("Error fetching pathways", error);
        throw error;
    }
}

export async function saveReactionPathway(formData: PathwayType[]) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/pathway`);
    const response: any = await fetch(url.toString(), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });

    const data = await response.json();
    return data;
}

export async function searchInventory(payLoad: any) {
    try {
        const response = await fetch(`${process.env.PYTHON_API_HOST_URL}/search_inventory `, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payLoad),
        })
        if (response) {
            const data = await response.json();
            return data;
        }
    } catch (error: any) {
        return error;
    }
}



