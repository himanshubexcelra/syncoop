/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { MOLECULE_ORDER_NOT_FOUND } = MESSAGES;
const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const organizationId = url.searchParams.get("organizationId");
        const createdBy = url.searchParams.get("createdBy");

        // Define whereClause conditionally based on user type
        let where = {};
        if (organizationId) {
            where = {
                ...where,
                organizationId: Number(organizationId)
            }
        }
        if(createdBy) {
            where = {
                ...where,
                createdBy: Number(createdBy),
            }
        }
        console.log(where);
        const data = await prisma.molecule_order.findMany({
            include: {
                organization: { select: { name: true } },
                molecule: {
                    select: {
                        molecular_weight: true,
                        smile: true,
                        status: true,
                    },
                },
                project: {
                    select: {
                        name: true
                    }
                },
                library: {
                    select: {
                        name: true
                    }
                },
            },
            where,
        });

        if (!data || data.length === 0) {
            return new Response(
                JSON.stringify({ error: MOLECULE_ORDER_NOT_FOUND }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: NOT_FOUND,
                }
            );
        }

        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        console.error("Error fetching molecule order data:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { "Content-Type": "application/json" },
                status: BAD_REQUEST,
            }
        );
    }
}
