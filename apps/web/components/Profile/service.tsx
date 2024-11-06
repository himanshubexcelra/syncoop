"use server";

export async function getUsersById(withRelation: string[] = [], id: number) {
    const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/users`);
    if (withRelation.length) {
        url.searchParams.append('with', JSON.stringify(withRelation));
    }
    if (id) {
        url.searchParams.append('id', JSON.stringify(id));
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