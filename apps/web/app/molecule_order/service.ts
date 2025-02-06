/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import { MoleculeOrderParams } from "@/lib/definition";

export async function getMoleculesOrder(params: MoleculeOrderParams) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_order`);

    // Add query parameters based on provided params
    if (params.organization_id) {
        url.searchParams.append("organization_id", params.organization_id.toString());
    }
    if (params.created_by) {
        url.searchParams.append("created_by", params.created_by.toString());
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
