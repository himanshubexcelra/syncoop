"use server"

export async function getDeAromatizeSmile(smile: string) {
    const url = process.env.NEXT_PUBLIC_INDIGO_SERVICE_API;

    const response = await fetch(url + '/indigo/dearomatize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            struct: smile,
            output_format: "chemical/x-daylight-smiles"
        })
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
}
export async function getAromatizeSmile(aromaticSmile: string) {
    const response = await fetch(process.env.NEXt_I + '/indigo/aromatize', {
        method: "POST",
        body: JSON.stringify({ struct: aromaticSmile, output_format: 'chemical/x-daylight-smiles' }),
    });
    return response;
}