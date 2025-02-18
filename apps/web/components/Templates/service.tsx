"use server";

export async function downloadSignedURL(fileType: string) {
    const url = `${process.env.PYTHON_API_HOST_URL}/download_signed_url_from_s3`
    // const url = `https://qzwtozwp3b.execute-api.us-east-1.amazonaws.com/molecule/download_signed_url_from_s3`
    try {
        const response = await fetch(url,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ file_type: fileType }),
            })

        if (!response.ok) {
            const errorData = await response.json();
            return errorData
        }
        const data = await response.json();
        return data;
    } catch (error: any) {
        return error
    }
}