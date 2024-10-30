import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;
interface Item {
    moleculeId: string; // or number, depending on your data type
    libraryId: string; // or number
    organizationId: string; // or number
    projectId: string; // or number
    userId: string; // or number
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const libraryId = searchParams.get('libraryId');
        const userId = searchParams.get('userId');
        const isLibrary = searchParams.get('isLibrary');
        const query: any = {
            where: {
                createdBy: Number(userId)
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

        if (isLibrary) {
            query.where = {
                libraryId: Number(libraryId),
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
        libraryId: Number(item.libraryId),
        organizationId: Number(item.organizationId),
        projectId: Number(item.projectId),
        createdBy: Number(item.userId)
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
        const libraryId = Number(searchParams.get('libraryId'));
        const projectId = Number(searchParams.get('projectId'));
        if(!moleculeId && !libraryId && !projectId){
            await prisma.user.deleteMany({});
        }

        await prisma.molecule_cart.deleteMany({
            where: {
                moleculeId: moleculeId,
                libraryId: libraryId,
                projectId: projectId,
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
