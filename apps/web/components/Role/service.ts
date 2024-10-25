"use server";

export async function getFilteredRoles() {
    const url = new URL(`${process.env.API_HOST_URL}/v1/roles`);
    url.searchParams.append('type', 'admin');
    url.searchParams.append('condition', 'not');
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