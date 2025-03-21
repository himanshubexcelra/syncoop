"use server";

export async function getUsers(withRelation: string[] = [], orgType: string = '', loggedInUser?: number, orgId?: number) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/users`);
    if (withRelation.length) {
        url.searchParams.append('with', JSON.stringify(withRelation));
    }
    if (orgType) {
        url.searchParams.append('orgType', orgType);
    }
    if (orgId) {
        url.searchParams.append('orgId', String(orgId));
    }
    if (loggedInUser) {
        url.searchParams.append('loggedInUser', String(loggedInUser))
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

export async function createUser(formData: FormData) {
    try {
        const response: any = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/users`,
            {
                mode: "no-cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }
        );
        const data = await response.json();
        if (response.ok) {
            return { status: response.status, data };
        } else {
            return { status: response.status, error: data.error || 'An error occurred' };
        }
    } catch (error: any) {
        return error;
    }
}

export async function editUser(formData: any) {
    try {
        const response = await fetch(
            `${process.env.NEXT_API_HOST_URL}/v1/users`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            }
        );
        const data = await response.json();
        if (response.ok) {
            return { status: response.status, data };
        } else {
            return { status: response.status, error: data.error || 'An error occurred' };
        }
    } catch (error: any) {
        console.error('error', error)
        return error;
    }
}

export async function getUserModulePermissions(userData: any) {
    const { organization_id, roles } = userData;
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/organization`);
        url.searchParams.append('with', JSON.stringify(['org_product_module', 'product_module_action_role_permission']));
        url.searchParams.append('id', organization_id);
        // roles.push({id: 4, type: 'sd'});
        url.searchParams.append('role_ids', JSON.stringify(roles.map((role: any) => role.id)));
        const response: any = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            return { status: response.status, data };
        } else {
            return { status: response.status, error: data.error || 'An error occurred' };
        }
    } catch (error: any) {
        console.error('error', error)
        return error;
    }
}

export async function deleteUserData(user_id?: number, role_id?: number) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/users/`);
        if (user_id) {
            url.searchParams.append('user_id', String(user_id));
        }
        if (role_id) {
            url.searchParams.append('role_id', String(role_id));
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
        return error;
    }
}
export async function getUserEnabled(user_id: string) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/pathway`);
    url.searchParams.append("user_id", user_id.toString());
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
        throw new Error(`Error: ${error}`);
    }
}