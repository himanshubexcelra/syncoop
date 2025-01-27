import prisma from "@/lib/prisma";
import { MoleculeStatusCode } from "@/utils/definition";
import { json } from "@/utils/helper";
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
        whereCondition = Prisma.sql`cr.library_id = ${Number(library_id)}`;
    } else {
        whereCondition = Prisma.sql`cr.project_id = ${Number(project_id)}`;
    }
    try {
        const result = await prisma.$queryRaw`SELECT  
            cr.*,
            cr.id as reaction_id,
            -- sc.status_name,
            ufr.id as favourite_id,
            CASE WHEN ufr.id IS NULL THEN false ELSE true END AS favourite,
            CASE WHEN cr.status = ${MoleculeStatusCode.New} THEN false ELSE true END AS disabled
            FROM custom_reactions cr
            -- JOIN status_code sc ON sc.table_name = 'custom_reactions' AND cr.status = sc.status_code::int
            LEFT JOIN user_favourite_reaction ufr ON ufr.reaction_id = cr.id
            /*
 
            Enable below 3 lines when live automation lab job is integrated
           
            LEFT JOIN molecule_chem_data mcd ON mcd.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_bio_data mcd ON mbd.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_adme_data mcd ON mad.molecule_id = mo.id and mo.status = ${MoleculeStatusCode.Done}
 
            */
            /* LEFT JOIN (SELECT DISTINCT ON(molecule_id) * FROM molecule_chem_data
            WHERE molecule_id = ${Number(sample_molecule_id)}
            ORDER BY molecule_id, reaction_step_no DESC) AS mcd ON mo.status = ${MoleculeStatusCode.Done}
            LEFT JOIN molecule_bio_data mbd ON mo.status = ${MoleculeStatusCode.Done}
            and mbd.molecule_id = ${Number(sample_molecule_id)}
            LEFT JOIN molecule_adme_data mad ON mo.status = ${MoleculeStatusCode.Done}
            and mad.molecule_id = ${Number(sample_molecule_id)}    
            */
 
 
            WHERE ${whereCondition}
            ORDER BY cr.status DESC`;
        if (result) {
            return new Response(json(result), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                errorMessage: MESSAGES.NOTFOUND('Reactions')
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