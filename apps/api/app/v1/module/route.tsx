import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const cId = parseInt(searchParams.get('id') || '1');

        const results = await prisma.module.findMany({
            include: {
                org_module: {
                    where: {
                        organizationId: cId,
                    },
                },
            },
        });

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });;
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}