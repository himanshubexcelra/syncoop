import prisma from "@/lib/prisma";

// export const dynamic = "force-static";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const priority = searchParams.get('priority');
        let query = {};
        if (priority && condition === 'gt') {
            query = {
                ...query,
                where: {
                    priority: {
                        gt: Number(priority)
                    }
                }
            }
        }
        const data = await prisma.role.findMany(query);

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