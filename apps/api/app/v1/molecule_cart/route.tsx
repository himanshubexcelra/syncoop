/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { getUTCTime, json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST, INTERNAL_SERVER_ERROR } = STATUS_TYPE;
interface Item {
    molecule_id: string; // or number, depending on your data type
    library_id: string; // or number
    organization_id: string; // or number
    project_id: string; // or number
    user_id: string; // or number
    order_id?: number,
    created_at: string
}
interface updatedItem {
    molecule_id: number; // or number, depending on your data type
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const library_id = searchParams.get('library_id');
        const user_id = searchParams.get('user_id');
        const project_id = searchParams.get('project_id');
        const organization_id = searchParams.get('organization_id');
        const lab_job_cart = searchParams.get('lab_job_cart');
        const analysis_cart = searchParams.get('analysis_cart');
        const source = searchParams.get('source');
        const query: any = {
            where: {
                created_by: Number(user_id),
                ...(() => {
                    if (lab_job_cart || analysis_cart) {
                        return {
                            NOT: {
                                molecule_order_id: null
                            }
                        };
                    }
                    return {};
                })(),
            },
            ...(source == "header" ? {} : {
                include: {
                    molecule: {
                        select: {
                            molecular_weight: true,
                            source_molecule_name: true,
                            is_added_to_cart: true,
                            smiles_string: true,
                            status: true,
                            library: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            project: {
                                select: {
                                    id: true,
                                    name: true,
                                },
                            },
                            pathway: {
                                select: {
                                    id: true,
                                    description: true,
                                    pathway_score: true,
                                    step_count: true,
                                    created_at: true,
                                    updated_at: true,
                                },
                            },
                        },
                    },
                    organization: {
                        select: {
                            name: true,
                        },
                    },
                },
            }),
        };
        if (library_id && project_id) {
            query.where = {
                ...query.where,
                library_id: Number(library_id),
                project_id: Number(project_id),
            };
        }

        if (organization_id) {
            query.where = {
                ...query.where,
                organization_id: Number(organization_id),
            };
        }
        let result;
        if (source == "header") {
            result = await prisma.molecule_cart.count(query);
        }
        else {
            result = await prisma.molecule_cart.findMany(query);
        }
        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}

export async function POST(request: Request) {
    const req = await request.json();
    const moleculeStatus = req.status;
    const result = req.molecules.map((item: Item) => {
        const obj = {
            molecule_id: Number(item.molecule_id),
            library_id: Number(item.library_id),
            organization_id: Number(item.organization_id),
            project_id: Number(item.project_id),
            created_by: Number(item.user_id),
            created_at: getUTCTime(new Date().toISOString())
        };
        if (item.order_id) {
            return { ...obj, molecule_order_id: item.order_id };
        }
        return obj;
    });
    try {
        const updatedmolecule_id = result.map((item: updatedItem) => Number(item.molecule_id));
        await prisma.molecule.updateMany({
            where: {
                id: { in: updatedmolecule_id }
            },
            data: {
                is_added_to_cart: true,
                status: moleculeStatus
            },
        });
        const response = await prisma.molecule_cart.createMany({
            data: result
        })
        return new Response(json(response), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // Adjust status code as needed
        });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        const user_id = Number(searchParams.get('user_id'));
        const moleculeStatus = Number(searchParams.get('moleculeStatus'));
        const bulk = searchParams.get('bulk') === 'true';

        const molecule_ids = JSON.parse(searchParams.get('molecule_ids') || '[]');
        const library_ids = JSON.parse(searchParams.get('library_ids') || '[]');
        const project_ids = JSON.parse(searchParams.get('project_ids') || '[]');

        if (bulk && user_id) {
            const updateConditions = molecule_ids.length
                ? { id: { in: molecule_ids } }
                : {};
            await prisma.molecule.updateMany({
                where: updateConditions,
                data: {
                    is_added_to_cart: true,
                    status: moleculeStatus,
                },
            });

            await prisma.molecule_cart.deleteMany({
                where: {
                    created_by: user_id,
                },
            });

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
                status: 200,
            });
        }

        if (molecule_ids.length && library_ids.length && project_ids.length) {
            await prisma.molecule.updateMany({
                where: { id: { in: molecule_ids } },
                data: { status: moleculeStatus },
            });

            await prisma.molecule_cart.deleteMany({
                where: {
                    molecule_id: { in: molecule_ids },
                    library_id: { in: library_ids },
                    project_id: { in: project_ids },
                    created_by: user_id,
                },
            });

            return new Response(JSON.stringify({ success: true }), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }

        return new Response(JSON.stringify({ error: "Invalid request" }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    } catch (error: any) {
        console.error('Error in DELETE:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: INTERNAL_SERVER_ERROR,
        });
    }
}