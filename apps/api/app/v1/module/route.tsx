import prisma from "@/lib/prisma";
import json from "@/utils/helper";


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const orgId = searchParams.get('orgId');
        let query: any = {};
        if (orgId) {
            query = {
                where: {
                    org_product_module: {
                        some: {
                            organization_id: Number(orgId),
                        },
                    },
                },
            };
        }
        const data = await prisma.product_module.findMany(query);

        return new Response(json(data), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        });
    }
}