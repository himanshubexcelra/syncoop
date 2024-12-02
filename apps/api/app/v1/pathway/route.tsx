/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const moleculeId = searchParams.get('molecule_id');
        const pathwayIndex = searchParams.get('pathway_index');

        const molecule = await prisma.pathway.findMany({
            where: {
                molecule_id: Number(moleculeId),
                ...(pathwayIndex ? { pathway_index: Number(pathwayIndex) } : {}),
            },
            include: {
                reaction_detail: {
                    orderBy: {
                        reaction_sequence_no: "asc",
                    },
                    include: {
                        reaction_compound: true,
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
    compound_id: number,
    compound_name: string,
    index: number,
    inventoryID: number,
    compound_type: string,
    molar_ratio: number,
    dispense_time: number,
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
            const { molecule_id, pathway_instance_id, pathway_score,
                pathway_index, description, selected, created_by } = pathway;
            const createdPathway = await prisma.pathway.create({
                data: {
                    molecule_id, pathway_instance_id, pathway_score,
                    description, selected, created_by, pathway_index,
                    created_at: new Date().toISOString(),
                    reaction_detail: {
                        create: pathway.reaction_detail.map((
                            reaction: ReactionDetailType) => ({
                                reaction_template_master: {
                                    connect: {
                                        name: reaction.reaction_template
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
                                created_at: new Date().toISOString(),
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
                                        created_at: new Date().toISOString(),
                                    }))
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

    createPathways(req)
        .then(() => new Response(JSON.stringify(req), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS,
        }))
        .catch((error) => console.error('Error creating pathways:', error))
}
