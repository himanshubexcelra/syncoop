/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import { addToFavouritesProps, MoleculeType, OrderType } from "@/lib/definition";

export async function getLibraries(withRelation: string[] = [], project_id: string) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/project/${project_id}`);
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

export async function getLibraryCountById(organization_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/library`);
        if (organization_id) {
            url.searchParams.append('organization_id', String(organization_id));
        }
        url.searchParams.append('condition', 'count');
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
        return error;
    }
}

export async function geMoleculeCountById(organization_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule`);
        if (organization_id) {
            url.searchParams.append('organization_id', String(organization_id));
        }
        url.searchParams.append('condition', 'count');
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
        return error;
    }
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

export async function editLibrary(formData: FormData) {
    try {
        const response = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/library`,
            {
                // mode: "no-cors",
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
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

export async function addMoleculeToCart(moleculeData: MoleculeType[]) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/molecule_cart`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(moleculeData),
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

export async function getMoleculeCart(user_id?: number, library_id?: number, project_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/molecule_cart/`);
        if (library_id) {
            url.searchParams.append('library_id', String(library_id));
        }
        if (user_id) {
            url.searchParams.append('user_id', String(user_id));
        }
        if (project_id) {
            url.searchParams.append('project_id', String(project_id));
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
    molecule_id?: number,
    library_id?: number,
    project_id?: number
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

export async function submitOrder(orderData: OrderType[]) {
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
