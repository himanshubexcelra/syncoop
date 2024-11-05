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
        created_by: Number(item.userId)
    }));




    try {
        await prisma.molecule_cart.createMany({
            data: result
        })
        return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    }
    catch (error) {
        console.error(error);
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
            status: 200, // SUCCESS
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: 400, // BAD_REQUEST
        });
    }
}
