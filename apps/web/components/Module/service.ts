"use server"

export async function getModule(orgId?: number) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/module`);
    if (orgId) {
        url.searchParams.append('orgId', String(orgId));
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