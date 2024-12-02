import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

export type ReactionInputData = {
    id: number;
} & {
    [key: string]: string | number;
};

/* const prePareMolecule = (moleculeData: []) => {
    const moleculeInsert = moleculeData.map((item: any, index: number) => ({
        smiles_string: item.reagentSMILES,
        compound_id: item.molID,
        compound_type: item.reagentName,
        compound_sequence_no: index,
        source: 'IN',
        inventory_id: item.inventoryID,
        created_by: 1,
        created_at: getUTCTime(new Date().toISOString())
    }));
    return moleculeInsert;
} */

/* export async function POST(request: Request) {
    const req: any = await request.json();
    const pathwayId: number = 326;
    try {
        const reactionMolecule = prePareMolecule(req.molecules);
        const reactionTemplate =
            await prisma.reaction_template_master.findUnique({
                where: {
                    name: req.reaction_template
                }
            });
        await prisma.reaction_detail.create({
            data: {
                reaction_template_master: {
                    connect: {
                        id: reactionTemplate?.id
                    }
                },
                reaction_name: reaction.reaction_name,
                reaction_smiles_string: reaction.reaction_smiles_string,
                pathway_id: pathwayId,
                pathway_instance_id: 0,
                reaction_sequence_no: req.rxnindex,
                confidence: req.Confidence,
                temperature: req.conditions.temperature,
                solvent: req.conditions.solvent,
                product_smiles_string: req.productSMILES,
                product_type: "F",
                status: 1,
                created_by: 1,
                created_at: getUTCTime(new Date().toISOString()),
                reaction_compound: {
                    create: reactionMolecule
                }
            },
        });
        return new Response(json(req), {
            headers: { "Content-Type": "application/json" },
            status: STATUS_TYPE.SUCCESS,
        });
    }
    catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { "Content-Type": "application/json" },
                status: STATUS_TYPE.BAD_REQUEST,
            }
        );
    }

} */


export async function PUT(request: Request) {
    const req: any = await request.json();
    try {
        const { data, molecules } = req;
        await prisma.reaction_detail.update({
            where: {
                id: parseInt(data.id),
            },
            data: data,
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
