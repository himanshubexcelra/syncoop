import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const moleculeId = Number(searchParams.get('molecule_id'));
        const result = await prisma.molecule.findUnique({
            where: {
                id: moleculeId, // Find the molecule by ID
            },
            include: {
                pathway: {
                    where: {
                        molecule_id: moleculeId,
                    },
                    include: {
                        reaction_detail: true,
                    },
                },
                organization: true,
            },
        });


        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.BAD_REQUEST,
        });
    }
}

export async function POST(request: Request) {
    const req = await request.json();
    const result = {
        molecule_id: Number(req.order.molecule_id),
        pathway_id: Number(req.order.pathway_id),
        pathway_instance_id: Number(req.order.pathway_instance_id),
        product_smiles_string: req.order.product_smiles_string,
        product_molecular_weight: req.order.product_molecule_weight,
        no_of_steps: Number(req.order.no_of_steps),
        functional_bioassays: req.order.functional_bioassays,
        reactions: req.order.reactions,
        status: 1,
        created_by: req.order.created_by,
        submitted_by: req.order.created_by,
        created_at: new Date().toISOString()
    }
    try {
        await prisma.molecule.update({
            where: {
                id: req.order.molecule_id,
            },
            data: {
                status: req.status,
            },
        })
        const response = await prisma.lab_job_order.create({
            data: result
        })
        return new Response(json(response), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS,
        });
    }
    catch (error) {
        return new Response(JSON.stringify({
            success: false,
            errorMessage: `Error: ${error}`
        }), {
            status: STATUS_TYPE.BAD_REQUEST,
        })
    }
}