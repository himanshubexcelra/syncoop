import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";

// export const dynamic = "force-static";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const roleType = searchParams.get('type');
        let query = {};
        if (roleType && condition === 'not') {
            query = {
                ...query,
                where: {
                    type: {
                        not: roleType
                    }
                }
            }
        }
        const data = await prisma.role.findMany(query);

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