"use server"
export async function getAromatizeSmile(canonicalSmile: string) {
    const response = await fetch(process.env.NEXT_PUBLIC_INDIGO_SERVICE_API + '/indigo/aromatize', {
        method: "POST",
        body: JSON.stringify({ struct: canonicalSmile, output_format: 'chemical/x-daylight-smiles' }),
    });
    return response;
}

export async function getDeAromatizeSmile(aromaticSmile: string) {
    const response = await fetch(process.env.NEXt_I + '/indigo/dearomatize', {
        method: "POST",
        body: JSON.stringify({ struct: aromaticSmile, output_format: 'chemical/x-daylight-smiles' }),
    });
    return response;
}