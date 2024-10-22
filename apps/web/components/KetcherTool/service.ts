"use server"
export default async function getAPIData(url: string) {
    const response = await fetch(url + '/indigo/aromatize', {
        method: "POST",
        body: JSON.stringify({ struct: 'C1=CC=CC=C1', output_format: 'chemical/x-daylight-smiles' }),
    });
    return response;

}