
/*eslint max-len: ["error", { "code": 100 }]*/
"use server";
export async function getBioAssays(searchString: string, distinct: string) {
    try {
        const url = new URL(`${process.env.NEXT_API_HOST_URL}/v1/functional_assay`);
        url.searchParams.append('searchParams', searchString);
        url.searchParams.append('distinct', distinct);
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