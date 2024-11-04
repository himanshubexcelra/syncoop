/*eslint max-len: ["error", { "code": 100 }]*/
"use server";

import { addToFavouritesProps, MoleculeType, OrderType } from "@/lib/definition";

export async function getLibraries(withRelation: string[] = [], projectId: string) {
    const url = new URL(`${process.env.API_HOST_URL}/v1/project/${projectId}`);
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

export async function getLibraryById(withRelation: string[] = [], libraryId: string) {
    const url = new URL(`${process.env.API_HOST_URL}/v1/library?id=${libraryId}`);
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

export async function getLibraryCountById(organizationId?: number) {
    try {
        const url = new URL(`${process.env.API_HOST_URL}/v1/library`);
        if (organizationId) {
            url.searchParams.append('organizationId', String(organizationId));
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

export async function geMoleculeCountById(organizationId?: number) {
    try {
        const url = new URL(`${process.env.API_HOST_URL}/v1/molecule`);
        if (organizationId) {
            url.searchParams.append('organizationId', String(organizationId));
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
            `${process.env.API_HOST_URL}/v1/library`,
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
            `${process.env.API_HOST_URL}/v1/library`,
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
            `${process.env.API_HOST_URL}/v1/molecule_cart`,
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

export async function getMoleculeCart(userId?: number, libraryId?: number, projectId?: number) {
    try {
        const url = new URL(`${process.env.API_HOST_URL}/v1/molecule_cart/`);
        if (libraryId) {
            url.searchParams.append('libraryId', String(libraryId));
        }
        if (userId) {
            url.searchParams.append('userId', String(userId));
        }
        if (projectId) {
            url.searchParams.append('projectId', String(projectId));
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
    userId?: number,
    moleculeId?: number,
    libraryId?: number,
    projectId?: number
) {
    try {
        const url = new URL(`${process.env.API_HOST_URL}/v1/molecule_cart/`);
        if (userId) {
            url.searchParams.append('userId', String(userId));
        }
        if (moleculeId) {
            url.searchParams.append('moleculeId', String(moleculeId));
        }
        if (libraryId) {
            url.searchParams.append('libraryId', String(libraryId));
        }
        if (projectId) {
            url.searchParams.append('projectId', String(projectId));
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
            `${process.env.API_HOST_URL}/v1/molecule`,
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
            `${process.env.API_HOST_URL}/v1/molecule_order`,
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
