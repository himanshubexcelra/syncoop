/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET() {
    try {
        const result = await prisma.$queryRaw`SELECT 
        mo.order_id,
        mo.order_name,
        m.id AS molecule_id,
        m.source_molecule_name,
        m.status
        FROM molecule_order mo
        JOIN molecule m ON m.id = ANY(mo.ordered_molecules)`;

        if (result) {
            return new Response(json(result), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                errorMessage: MESSAGES.MOLECULE_ORDER_NOT_FOUND
            }), {
                status: NOT_FOUND,
            });
        }
    } catch (error: any) {
        return new Response(JSON.stringify({
            success: false,
            errorMessage: `Webhook error: ${error}`
        }), {
            status: BAD_REQUEST,
        })
    }
}