"use server";

export async function getLowPriorityRole(priority: number) {
    const url = new URL(`${process.env.API_HOST_URL}/v1/roles`);
    url.searchParams.append('priority', String(priority));
    url.searchParams.append('condition', 'gt');
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
