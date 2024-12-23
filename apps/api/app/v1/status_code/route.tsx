import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const table_name = searchParams.get('table_name');
        const column_name = searchParams.get('column_name');

        const query: any = {
            where: {
                in: {
                    table_name
                },
                ...(() => {
                    if (column_name) {
                        return { column_name }
                    }
                })()
            }
        }

        const data = await prisma.status_code.findMany(query);

        return new Response(json(data), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(`Error: ${error.message}`, {
            status: 400,
        });
    }
}