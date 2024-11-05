import prisma from "@/lib/prisma";


export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const orgId = searchParams.get('orgId');
        let query: any = {};
        if (orgId) {
            query = {
                where: {
                    org_module: {
                        some: {
                            organization_id: Number(orgId),
                        },
                    },
                },
            };
        }
        const data = await prisma.module.findMany(query);

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });
    } catch (error: any) {
        return new Response(`Webhook error: ${error.message}`, {
            status: 400,
        });
    }
}