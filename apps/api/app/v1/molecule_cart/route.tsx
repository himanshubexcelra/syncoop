/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;
interface Item {
    moleculeId: string; // or number, depending on your data type
    library_id: string; // or number
    organization_id: string; // or number
    project_id: string; // or number
    userId: string; // or number
}
interface updatedItem {
    moleculeId: number; // or number, depending on your data type
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const library_id = searchParams.get('library_id');
        const userId = searchParams.get('userId');
        const project_id = searchParams.get('project_id');
        const query: any = {
            where: {
                created_by: Number(userId)
            },
            include: {
                molecule: {
                    select: {
                        molecular_weight: true,
                        source_molecule_name: true,
                        is_added_to_cart: true,
                        library: {
                            select: {
                                id: true,
                                name: true,
                                project: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        };

        if (library_id && project_id) {
            query.where = {
                created_by: Number(userId),
                library_id: Number(library_id),
                project_id: Number(project_id)
            };
        }
        const molecule = await prisma.molecule_cart.findMany(query);
        return new Response(JSON.stringify(molecule), {
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

    const result = req.map((item: Item) => ({
        moleculeId: Number(item.moleculeId),
        library_id: Number(item.library_id),
        organization_id: Number(item.organization_id),
        project_id: Number(item.project_id),
        created_by: Number(item.userId),
    }));


    const updatedmoleculeId = result.map((item: updatedItem) => Number(item.moleculeId));

    const updatedResult = await prisma.molecule.updateMany({
        where: {
            id: { in: updatedmoleculeId }
        },
        data: {
            is_added_to_cart: true,
        },
    });
    try {
        if (updatedResult.count > 0) {
            const response = await prisma.molecule_cart.createMany({
                data: result
            })
            return new Response(JSON.stringify(response), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
        else {
            return new Response(JSON.stringify([]), {
                headers: { "Content-Type": "application/json" },
                status: BAD_REQUEST,
            });
        }
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

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const moleculeId = Number(searchParams.get('moleculeId'));
        const library_id = Number(searchParams.get('library_id'));
        const project_id = Number(searchParams.get('project_id'));
        const userId = Number(searchParams.get('userId'));


        if (!moleculeId && !library_id && !project_id) {
            await prisma.molecule_cart.deleteMany({
                where: {
                    created_by: userId
                }
            });
        }

        await prisma.molecule_cart.deleteMany({
            where: {
                moleculeId: moleculeId,
                library_id: library_id,
                project_id: project_id,
                created_by: userId
            }
        });

        return new Response(JSON.stringify([{}]), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS, // SUCCESS
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // BAD_REQUEST
        });
    }
}
