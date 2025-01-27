/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const searchQuery = searchParams.get('searchParams');
        const distinct = searchParams.get('distinct');
        const query: any = {};

        if (searchParams) {
            query.where = {
                target: {
                    contains: searchQuery,
                    mode: 'insensitive',
                },
            };
        }
        if (distinct) {
            query.distinct = [distinct];
        }

        const assays = await prisma.bioassay.findMany(query);
        return new Response(json(assays), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}