/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { MoleculeOrderStatusCode, MoleculeStatusCode } from "@/utils/definition";
import { json, getUTCTime } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const sample_molecule_id = searchParams.get("sample_molecule_id");
        const result = await prisma.$queryRaw`SELECT 
        CONCAT(m.id, mo.order_id) AS id,
        mo.order_id,
        mo.order_name,
        mo.organization_id,
        mo.ordered_molecules,
        mcd.value as reaction_data,
        mad.value as adme_data,
        mbd.value as functional_assays,
        m.id AS molecule_id,
        m.source_molecule_name,
        m.status,
        m.molecular_weight,
        m.smiles_string,
        m.library_id,
        m.project_id,
        mo.id AS molecule_order_id,
        org.name AS "organizationName",
        org.metadata AS "organizationMetadata",
        org.config AS "organizationConfig",
        lib.config AS "config",
        lib.inherits_configuration AS "inherits_configuration",
        proj.config AS "projectConfig",
        proj.inherits_configuration AS "project_inherits_configuration",
        sc.status_name as molecule_status,
        CASE WHEN m.status = ${MoleculeStatusCode.Ordered} THEN false ELSE true END AS disabled
        /* sco.status_name as order_status */
        FROM molecule_order mo
        JOIN molecule m ON m.id = ANY(mo.ordered_molecules)
        JOIN status_code sc ON sc.table_name = 'molecule' AND m.status = sc.status_code::int
        /* 

            Enable below 3 lines when live automation lab job is integrated
            
            LEFT JOIN molecule_chem_data mcd ON mcd.molecule_id = mo.id and
            mo.status = ${MoleculeStatusCode.Done} 
            LEFT JOIN molecule_bio_data mcd ON mbd.molecule_id = mo.id and
            mo.status = ${MoleculeStatusCode.Done} 
            LEFT JOIN molecule_adme_data mcd ON mad.molecule_id = mo.id and 
            mo.status = ${MoleculeStatusCode.Done} 

            */

            LEFT JOIN (SELECT DISTINCT ON(molecule_id) * FROM molecule_chem_data 
            WHERE molecule_id = ${Number(sample_molecule_id)} 
            ORDER BY molecule_id, reaction_step_no DESC) AS mcd 
            ON m.status = ${MoleculeStatusCode.Done} 
            LEFT JOIN molecule_bio_data mbd ON mbd.molecule_id = m.id and
            m.status = ${MoleculeStatusCode.Done} 
            LEFT JOIN molecule_adme_data mad ON mad.molecule_id = m.id and 
            m.status = ${MoleculeStatusCode.Done} 


            /* LEFT JOIN (SELECT DISTINCT ON(molecule_id) * FROM molecule_chem_data 
            WHERE molecule_id = ${Number(sample_molecule_id)} 
            ORDER BY molecule_id, reaction_step_no DESC) AS mcd 
            ON m.status = ${MoleculeStatusCode.Done} 
            LEFT JOIN molecule_bio_data mbd ON m.status = ${MoleculeStatusCode.Done} 
            and mbd.molecule_id = ${Number(sample_molecule_id)}
            LEFT JOIN molecule_adme_data mad ON m.status = ${MoleculeStatusCode.Done} 
            and mad.molecule_id = ${Number(sample_molecule_id)}     */


        /* JOIN status_code sco ON sco.table_name = 'molecule_order'  */
        /* AND mo.status = sco.status_code::int */
        JOIN container org ON mo.organization_id = org.id 
        JOIN container lib ON m.library_id = lib.id
        JOIN container proj ON m.project_id = proj.id`;

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

export async function POST(request: Request) {
    const req = await request.json();

    const moleculeIds: number[] = req.ordered_molecules.map(
        (moleculeId: string) => Number(moleculeId))
    const result = {
        order_id: String(req.order_id),
        order_name: req.order_name,
        organization_id: Number(req.organization_id),
        ordered_molecules: moleculeIds,
        created_by: Number(req.created_by),
        updated_by: Number(req.created_by),
        status: MoleculeOrderStatusCode.InProgress,
        created_at: getUTCTime(new Date().toISOString()),
    }
    try {
        const response = await prisma.molecule_order.create({
            data: result
        });

        if (response && moleculeIds?.length) {
            await prisma.molecule.updateMany({
                data: {
                    status: MoleculeStatusCode.Ordered,
                },
                where: {
                    id: {
                        in: moleculeIds
                    }
                }
            })
        }

        return new Response(json(response), {
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
