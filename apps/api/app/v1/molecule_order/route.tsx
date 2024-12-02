/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { json, getUTCTime } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

interface OrderData {
    order_id: string;
    order_name: number;
    molecule_id: number;
    library_id: number;
    project_id: number;
    batch_detail: string;
    organization_id: number;
    created_by: string;
}
interface updatedItem {
    molecule_id: number;
}
const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const organization_id = url.searchParams.get("organization_id");
        const created_by = url.searchParams.get("created_by");

        // Define whereClause conditionally based on user type
        let where = {};
        if (organization_id) {
            where = {
                ...where,
                organization_id: Number(organization_id)
            }
        }
        if (created_by) {
            where = {
                ...where,
                created_by: Number(created_by),
            }
        }
        const data = await prisma.molecule_order.findMany({
            include: {
                organization: {
                    select: {
                        name: true
                    }
                },
                /* molecule: {
                    select: {
                        molecular_weight: true,
                        smiles_string: true,
                        status: true,
                        source_molecule_name: true,
                    },
                }, */
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

        if (data) {
            return new Response(json(data), {
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

export async function POST(request: Request) {
    const req = await request.json();
    const status = req.status
    const result = req.order.map((item: OrderData) => ({
        order_id: String(item.order_id),
        order_name: item.order_name,
        molecule_id: Number(item.molecule_id),
        organization_id: Number(item.organization_id),
        project_id: Number(item.project_id),
        library_id: Number(item.library_id),
        batch_detail: item.batch_detail,
        created_by: Number(item.created_by),
        updated_by: Number(item.created_by),
        status: 1,
        created_at: getUTCTime(new Date().toISOString()),
    }));
    const updatedmolecule_id = result.map((item: updatedItem) => Number(item.molecule_id));
    try {
        await prisma.molecule.updateMany({
            where: {
                id: { in: updatedmolecule_id }
            },
            data: {
                is_added_to_cart: false,
                status: status
            },
        });
        await prisma.molecule_order.createMany({
            data: result
        })
        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    }
    catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // BAD_REQUEST
        });
    }
}
