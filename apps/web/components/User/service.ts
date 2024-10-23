"use server";

export async function getUsers(withRelation: string[] = [], orgType: string = '', loggedInUser?: number, orgId?: number) {
    const url = new URL(`${process.env.API_HOST_URL}/v1/users`);
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
            `${process.env.API_HOST_URL}/v1/users`,
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
            `${process.env.API_HOST_URL}/v1/users`,
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