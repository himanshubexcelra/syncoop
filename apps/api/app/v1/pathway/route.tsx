/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { getUTCTime, json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const moleculeId = searchParams.get('molecule_id');
        const id = searchParams.get('id');

        const molecule = await prisma.pathway.findMany({
            distinct: ['pathway_index'],
            orderBy: [{
                pathway_instance_id: 'desc',
            },
            {
                updated_at: 'desc', // Sort by updated_at for the distinct pathway_index
            }],
            where: {
                molecule_id: Number(moleculeId),
                ...(id ? { id: Number(id) } : {}),
            },
            include: {
                reaction_detail: {
                    orderBy: {
                        reaction_sequence_no: "asc",
                    },
                    include: {
                        reaction_compound: {
                            orderBy: {
                                compound_label: "asc",
                            },
                        },
                        reaction_template_master: {
                            select: {
                                name: true, // Include the name of the template
                            }
                        },
                    },
                },
            },
        });
        return new Response(json({
            success: true,
            data: molecule
        }), {
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}

type ReactionCompoundType = {
    smiles_string: string,
    compound_id: string,
    compound_name: string,
    index: number,
    inventoryID: number,
    compound_type: string,
    compound_label: string,
    molar_ratio: number,
    dispense_time: number,
    role: string,
    // inventory_id: number,
    // inventory_url: string
}

type ReactionDetailType = {
    id?: string,
    type: string,
    reaction_template: string,
    reaction_sequence_no?: number,
    condition?: string,
    temperature?: number,
    solvent?: string,
    reaction_name: string,
    product_type?: string,
    reaction_smiles_string: string,
    product_smiles_string: string,
    confidence: number,
    status: number,
    reaction_compound: ReactionCompoundType[],
}



export async function POST(request: Request) {
    const req = await request.json();

    const createPathways = async (req: any) => {
        const createdPathways = [];
        for (const pathway of req) {
            const { molecule_id, pathway_instance_id, parent_id, pathway_score,
                pathway_index, description, selected, created_by, updated_by } = pathway;
            const createdPathway = await prisma.pathway.create({
                data: {
                    molecule_id,
                    pathway_instance_id,
                    ...(() => {
                        if (parent_id) {
                            return {
                                parent_id,
                                updated_at: getUTCTime(new Date().toISOString()),
                                updated_by: updated_by
                            }
                        }
                    })(),
                    pathway_score,
                    description,
                    selected,
                    created_by,
                    pathway_index,
                    created_at: getUTCTime(new Date().toISOString()),
                    reaction_detail: {
                        create: await Promise.all(pathway.reaction_detail.map(
                            async (reaction: ReactionDetailType) => {
                                // Fetch the reaction template master by name to get the ID
                                const reactionTemplate =
                                    await prisma.reaction_template_master.findUnique({
                                        where: {
                                            name: reaction.reaction_template
                                        }
                                    });

                                return {
                                    reaction_template_master: {
                                        connect: {
                                            id: reactionTemplate?.id
                                        }
                                    },
                                    reaction_name: reaction.reaction_name,
                                    reaction_sequence_no: reaction.reaction_sequence_no,
                                    reaction_smiles_string: reaction.reaction_smiles_string,
                                    confidence: reaction.confidence,
                                    temperature: reaction.temperature,
                                    solvent: reaction.solvent,
                                    product_smiles_string: reaction.product_smiles_string,
                                    product_type: reaction.product_type,
                                    created_at: getUTCTime(new Date().toISOString()),
                                    status: reaction.status,
                                    users_reaction_detail_created_byTousers: {
                                        connect: { id: created_by }
                                    },
                                    reaction_compound: {
                                        create: reaction.reaction_compound.map((compound) => ({
                                            compound_id: compound.compound_id,
                                            compound_name: compound.compound_name,
                                            molar_ratio: compound.molar_ratio,
                                            dispense_time: compound.dispense_time,
                                            smiles_string: compound.smiles_string,
                                            users_reaction_compound_created_byTousers: {
                                                connect: { id: created_by }
                                            },
                                            compound_type: compound.compound_type,
                                            compound_label: compound.compound_label,
                                            role: compound.role,
                                            // inventory_id: compound.inventory_id,
                                            // inverntory_url: compound.inventory_url,
                                            created_at: getUTCTime(new Date().toISOString()),
                                        }))
                                    }
                                }
                            }))
                    }
                },
                include: {
                    reaction_detail: {
                        include: {
                            reaction_compound: true,
                        },
                    },
                },
            });
            createdPathways.push(createdPathway);
        }
        return createdPathways;
    }

    try {
        const createdPathways = await createPathways(req);
        return new Response(json(createdPathways), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS, // Or any other status constant
        });
    } catch (error) {
        console.error('Error creating pathways:', error);
        return new Response(JSON.stringify({ error: 'Error creating pathways' }), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.INTERNAL_SERVER_ERROR,
        });
    }
}

export type ReactionInputData = {
    id: number;
} & {
    [key: string]: string | number;
};

export async function PUT(request: Request) {
    const req: any = await request.json();
    try {
        const { data, molecules } = req;
        const { pathwayId, ...filteredData } = data;
        await prisma.pathway.update({
            where: {
                id: parseInt(pathwayId),
            },
            data: {
                updated_at: getUTCTime(new Date().toISOString()),
                updated_by: data.created_by
            }
        });
        await prisma.reaction_detail.update({
            where: {
                id: parseInt(data.id),
            },
            data: filteredData,
        });
        molecules.length > 0 && await Promise.all(
            molecules.map(async (molecule: ReactionInputData) => {
                return await prisma.reaction_compound.update({
                    where: {
                        id: molecule.id,
                    },
                    data: molecule,
                });
            })
        );
        return new Response(json(req), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS,
        });
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { "Content-Type": "application/json" },
                status: STATUS_TYPE.BAD_REQUEST,
            }
        );
    }
}
