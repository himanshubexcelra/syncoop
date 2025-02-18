import prisma from "@/lib/prisma";
import { MoleculeStatusCode } from "@/utils/definition";
import { getUTCTime, json } from "@/utils/helper";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import { Prisma } from '@prisma/client';

const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const library_id = searchParams.get("library_id");
    const project_id = searchParams.get("project_id");
    const sample_molecule_id = searchParams.get("sample_molecule_id");
    let whereCondition;
    if (library_id) {
        whereCondition = Prisma.sql`mo.library_id = ${Number(library_id)}`;
    } else {
        whereCondition = Prisma.sql`mo.project_id = ${Number(project_id)}`;
    }

    try {
        const result = await prisma.$queryRaw`SELECT  
            mo.*,
            mo.id,
            mo.smiles_string as molecule,
            mo.id as molecule_id,
            co.name as library,
            sc.status_name,
            ufm.id as favorite_id,
            CASE WHEN ufm.id IS NULL THEN false ELSE true END AS favorite,
            CASE WHEN mo.status = ${MoleculeStatusCode.New} THEN false ELSE true END AS disabled,
            mcd.value as reaction_data,
            mad.value as adme_data,
            mbd.value as functional_assays
            FROM molecule mo
            JOIN status_code sc ON sc.table_name = 'molecule' AND mo.status = sc.status_code::int
            LEFT JOIN user_favorite_molecule ufm ON ufm.molecule_id = mo.id
            /*
 
            Enable below 3 lines when live automation lab job is integrated
           
            LEFT JOIN molecule_chem_data mcd ON mcd.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_bio_data mcd ON mbd.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_adme_data mcd ON mad.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
 
            */
 
            LEFT JOIN (SELECT DISTINCT ON(molecule_id) * FROM molecule_chem_data
            WHERE molecule_id = ${Number(sample_molecule_id)}
            ORDER BY molecule_id, reaction_step_no DESC) AS mcd ON mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_bio_data mbd ON mbd.molecule_id = mo.id and
            mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_adme_data mad ON mad.molecule_id = mo.id and
            mo.status = ${MoleculeStatusCode.Done}
            JOIN container co ON co.id = mo.library_id
 
            /* LEFT JOIN (SELECT DISTINCT ON(molecule_id) * FROM molecule_chem_data
            WHERE molecule_id = ${Number(sample_molecule_id)}
            ORDER BY molecule_id, reaction_step_no DESC) AS mcd ON mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_bio_data mbd ON mo.status = ${MoleculeStatusCode.Done}
            and mbd.molecule_id = ${Number(sample_molecule_id)}
            LEFT JOIN molecule_adme_data mad ON mo.status = ${MoleculeStatusCode.Done}
            and mad.molecule_id = ${Number(sample_molecule_id)}    
            */
 
 
            WHERE ${whereCondition}
            ORDER BY mo.status DESC`;

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

type MOLECULETYPE = {
    status: number,
    molecule_id: number,
    userId: number,
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { formData, status, userId } = req;

        const updatePromises = formData.map(async ({ molecule_id }: MOLECULETYPE) => {
            return await prisma.molecule.update({
                where: { id: molecule_id },
                data: {
                    status: status,
                    userWhoUpdated: {
                        connect: { id: userId }, // Associate the user who created/updated the project
                    },
                    updated_at: getUTCTime(new Date().toISOString()),
                },
            });
        });

        const updatedMolecules = await Promise.all(updatePromises);
        return new Response(json(updatedMolecules), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // Adjust status code as needed
        });
    } finally {
        await prisma.$disconnect();
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const molecule_id = searchParams.get('molecule_id');
        const favorite_id = searchParams.get('favorite_id');
        if (favorite_id) {
            await prisma.user_favorite_molecule.delete({
                where: { id: Number(favorite_id) },
            });
        }
        const result = await prisma.molecule.delete({
            where: { id: Number(molecule_id) },
        });
        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // BAD_REQUEST
        });
    }
}
