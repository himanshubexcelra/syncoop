/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import {
    addToFavouritesProps,
    MoleculeOrder,
    OrderType,
    SaveLabJobOrder,
    CreateLabJobOrder
} from "@/lib/definition";

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
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
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
            return { status: response.status, error };
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
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
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
    molecule_id?: number,
    library_id?: number,
    project_id?: number,
) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart/`);
        if (created_by) {
            url.searchParams.append('user_id', String(created_by));
        }
        if (molecule_id) {
            url.searchParams.append('molecule_id', String(molecule_id));
        }
        if (library_id) {
            url.searchParams.append('library_id', String(library_id));
        }
        if (project_id) {
            url.searchParams.append('project_id', String(project_id));
        }
        if (moleculeStatus) {
            url.searchParams.append('moleculeStatus', String(moleculeStatus));
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

export async function addToFavourites(formData: addToFavouritesProps) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule`,
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
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
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
    userId: number) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ formData: formData, status: status, userId: userId }),
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
export async function getLabJobOrderDetail(molecule_id: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/lab_job_order/`);
        if (molecule_id) {
            url.searchParams.append('molecule_id', String(molecule_id));
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
            order: data
        };
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/lab_job_order`,
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
        } else if (response.status === 500) {
            const error = await response.json();
            return { status: response.status, error };
        }
    } catch (error: any) {
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

export async function deleteMolecule(molecule_id?: number, favourite_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule/`);

        if (molecule_id) {
            url.searchParams.append('molecule_id', String(molecule_id));
        }
        if (favourite_id) {
            url.searchParams.append('favourite_id', String(favourite_id));
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
