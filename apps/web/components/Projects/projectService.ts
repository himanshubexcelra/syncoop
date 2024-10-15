"use server";

export async function getProjects() {
    const response = await fetch(`${process.env.API_HOST_URL}/v1/project`, {
        mode: "no-cors",
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const data = await response.json();
    return data;
}
export async function getProjectsCountById(orgId?: number) {
    try {
        const url = new URL(`${process.env.API_HOST_URL}/v1/project`);
        if (orgId) {
            url.searchParams.append('orgId', String(orgId));
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
export async function createProjectApi(formData: FormData) {
    try {
        const response: any = await fetch(
            `${process.env.API_HOST_URL}/v1/project`,
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

export async function editProject(formData: FormData) {
    try {
        const response = await fetch(
            `${process.env.API_HOST_URL}/v1/project`,
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
        console.error('error', error)
        return error;
    }
}

