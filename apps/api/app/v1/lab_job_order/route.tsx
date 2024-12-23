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
                    orderBy: [{
                        pathway_instance_id: 'desc',
                    },
                    {
                        updated_at: 'desc', // Sort by updated_at for the distinct pathway_index
                    }],
                    where: {
                        molecule_id: moleculeId,
                        pathway_instance_id: 1
                    },
                    include: {
                        reaction_detail: {
                            include: {
                                reaction_compound: true,
                            }
                        },

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
        product_smiles_string: req.order.product_smiles_string,
        product_molecular_weight: req.order.product_molecule_weight,
        no_of_steps: Number(req.order.no_of_steps),
        functional_bioassays: req.order.functional_bioassays,
        reactions: req.order.reactions,
        status: req.order.status,
        created_by: req.order.created_by,
        submitted_by: req.order.created_by,
        created_at: new Date().toISOString()
    }
    try {
        // update status of all reactions with given pathway_instance and pathway_id
        await prisma.reaction_detail.updateMany({
            where: {
                pathway_id: req.order.pathway_id,
            },
            data: {
                status: req.order.reactionStatus,
            },
        })
        /* await prisma.molecule.update({
            where: {
                id: req.order.molecule_id,
            },
            data: {
                status: req.status,
            },
        }) */
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