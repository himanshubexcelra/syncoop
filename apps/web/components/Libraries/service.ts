/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import {
    addToFavoritesProps,
    MoleculeOrder,
    OrderType,
    SaveLabJobOrder,
    CreateLabJobOrder
} from "@/lib/definition";
import { Messages } from "@/utils/message";

export async function getLibraries(withRelation: string[] = [], project_id: string) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/project`);
    url.searchParams.append('project_id', project_id);
    if (withRelation.length) {
        url.searchParams.append('with', JSON.stringify(withRelation));
    }
    const response = await fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });


    const data = await response.json();
    return data;
}

export async function getLibraryById(withRelation: string[] = [], library_id: string) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library?id=${library_id}`);
    if (withRelation.length) {
        url.searchParams.append('with', JSON.stringify(withRelation));
    }
    const response = await fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
}

export async function getMoleculeData(params: object) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule`);
    if (params) {
        Object.entries(params).map(([key, value]: any) => {
            url.searchParams.append(key, value);
        });
    }
    const response = await fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
}
export async function getReactionData(params: object) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/custom_reactions`);
    if (params) {
        Object.entries(params).map(([key, value]: any) => {
            url.searchParams.append(key, value);
        });
    }
    const response = await fetch(url, {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
}

export async function createLibrary(formData: FormData) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/library`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData }),
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            return error;
        }
    } catch (error: any) {
        return error;
    }
}

export async function editLibrary(formData: any) {
    try {
        const response = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/library`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData }),
            }
        );
        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            return error;
        }
    } catch (error: any) {
        return error;
    }
}

export async function addMoleculeToCart(moleculeData: CreateLabJobOrder[],
    status: number) {
    const payload = {
        molecules: moleculeData,
        status
    };
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule_cart`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        if (response.status === 200) {
            const data = await response.json();
            return data;
        } else {
            const error = await response.json();
            return error;
        }
    } catch (error: any) {
        return error;
    }
}

export async function getMoleculeCart(params: object) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart/`);
        if (params) {
            Object.entries(params).map(([key, value]: any) => {
                url.searchParams.append(key, value);
            });
        }

        const response = await fetch(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }
    catch (error: any) {
        console.log(error, 'Error')
        return error;
    }
}

export async function getMoleculeOrder(params: object) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart_order/`);
        if (params) {
            Object.entries(params).map(([key, value]: any) => {
                url.searchParams.append(key, value);
            });
        }

        const response = await fetch(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }
    catch (error: any) {
        console.log(error, 'Error')
        return error;
    }
}

export async function deleteMoleculeCart(
    created_by?: number,
    moleculeStatus?: number,
    molecule_ids?: number[],
    library_ids?: number[],
    project_ids?: number[],
    bulk = false
) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart/`);
        if (created_by) {
            url.searchParams.append('user_id', String(created_by));
        }
        if (bulk) {
            url.searchParams.append('bulk', 'true');
        }
        if (moleculeStatus) {
            url.searchParams.append('moleculeStatus', String(moleculeStatus));
        }
        if (molecule_ids?.length) {
            url.searchParams.append('molecule_ids', JSON.stringify(molecule_ids));
        }
        if (library_ids?.length) {
            url.searchParams.append('library_ids', JSON.stringify(library_ids));
        }
        if (project_ids?.length) {
            url.searchParams.append('project_ids', JSON.stringify(project_ids));
        }

        const response = await fetch(url.toString(), {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error('Error in deleteMoleculeCart:', error);
        return error;
    }
}

export async function addToFavorites(formData: addToFavoritesProps) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule/favorite`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData }),
            }
        );

        if (response.status === 200) {
            return true;
        } else if (response.status === 500) {
            return Messages.SOMETHING_WENT_WRONG;
        }
    } catch (error: any) {
        return error;
    }
}

export async function submitOrder(orderData: OrderType) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule_order`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(orderData),
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

export async function updateMoleculeStatus(formData: MoleculeOrder[],
    status: number,
    userId: number,
    analysis?: boolean,
) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    formData: formData,
                    status: status,
                    userId: userId,
                    analysis: analysis,
                }),
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

type MoleculeType = {
    id: string;
    smile: string;
}

type SubmittedMoleculesType = {
    orderId: string;
    molecules: MoleculeType[];
}

type GeneratePathwayType = {
    submittedBy: number;
    submittedMolecules: SubmittedMoleculesType[];
}

export async function generatePathway(formData: GeneratePathwayType) {
    try {
        const response: any = await fetch(
            `${process.env.PYTHON_API_HOST_URL}/generate_pathway_schemes`,
            {
                method: "POST",
                headers: {
                    'Accept': '*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData),
            }
        );
        if (response.status !== 200) {
            return response;
        } else {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
        return error;
    }
}
export async function getSynthesisMoleculesData(molecule_ids: number[]) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/lab_job_order/`);
        if (molecule_ids) {
            url.searchParams.append('molecule_ids', JSON.stringify(molecule_ids));
        }
        const response = await fetch(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response) {
            const data = await response.json();
            return data;
        }
    }
    catch (error: any) {
        return error;
    }
}

export async function postLabJobOrder(data: SaveLabJobOrder) {
    try {
        const payload = {
            order: data,
        };

        const response = await fetch(`${process.env.NEXT_API_HOST_URL}/v1/lab_job_order`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            // Log the error details for debugging
            const errorDetails = await response.text();
            //  Get response text if parsing JSON fails
            return { status: response.status, error: errorDetails };
        }

        const responseData = await response.json();
        return responseData;
    } catch (error: any) {
        // Log and rethrow the error for the caller to handle
        return error;
    }
}


export async function getStatusCodes(params: object) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/status_code`);
        if (params) {
            Object.entries(params).map(([key, value]: any) => {
                url.searchParams.append(key, value);
            });
        }
        const response = await fetch(url, {
            mode: "no-cors",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response) {
            const data = await response.json();
            return data;
        }
    }
    catch (error: any) {
        return error;
    }
}

export async function updateLabJobApi(labJobId: number) {
    try {
        const payload = {
            lab_job_order_id: Number(labJobId)
        };
        const response: any = await fetch(
            `${process.env.PYTHON_API_HOST_URL}/lab_job_order/generate_csv`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );
        if (!response.ok) {
            const error = await response.json();
            return { status: response.status, error };
        }

        return await response.json();

    } catch (error: any) {
        return error;
    }
}

export async function deleteMolecule(molecule_id?: number, favorite_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule/`);

        if (molecule_id) {
            url.searchParams.append('molecule_id', String(molecule_id));
        }
        if (favorite_id) {
            url.searchParams.append('favorite_id', String(favorite_id));
        }
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }
    catch (error: any) {
        console.log(error, 'Error')
        return error;
    }
}
export async function deleteLibrary(library_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library/`);
        if (library_id) {
            url.searchParams.append('library_id', String(library_id));
        }
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        return data;
    }
    catch (error: any) {
        console.log(error, 'Error')
        return error;
    }
}