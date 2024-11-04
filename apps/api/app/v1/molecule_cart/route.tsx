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
interface updatedItem {
    moleculeId: number; // or number, depending on your data type
}

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const libraryId = searchParams.get('libraryId');
        const userId = searchParams.get('userId');
        const projectId = searchParams.get('projectId');
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

        if (libraryId && projectId) {
            query.where = {
                createdBy: Number(userId),
                libraryId: Number(libraryId),
                projectId: Number(projectId)
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


    const updatedmoleculeId = result.map((item: updatedItem) => Number(item.moleculeId));

    const updatedResult = await prisma.molecule.updateMany({
        where: {
            id: { in: updatedmoleculeId }
        },
        data: {
            isAddedToCart: true,
        },
    });
    try {
        if (updatedResult.count > 0) {
            await prisma.molecule_cart.createMany({
                data: result
            })
            return new Response(JSON.stringify([]), {
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
        const userId = Number(searchParams.get('userId'));
        // Check for remove all option
        if (!moleculeId && !libraryId && !projectId) {
            // Find all molecule to update isAddedToCart first
            const moleculeIDs = await prisma.molecule_cart.findMany({
                select: {
                    moleculeId: true
                },
            });
            const moleculeIdUpdate = moleculeIDs.map(molecule => molecule.moleculeId);
            const updatedResult = await prisma.molecule.updateMany({
                where: {
                    id: { in: moleculeIdUpdate }
                },
                data: {
                    isAddedToCart: false,
                },
            });
            if (updatedResult.count > 0) {
                await prisma.molecule_cart.deleteMany({
                    where: {
                        createdBy: userId
                    }
                });
            }
        }
        // Check for individual Moldecule Delete
        const updatedResult = await prisma.molecule.updateMany({
            where: {
                id: moleculeId
            },
            data: {
                isAddedToCart: false,
            },
        });
        if (updatedResult.count > 0) {
            await prisma.molecule_cart.deleteMany({
                where: {
                    moleculeId: moleculeId,
                    libraryId: libraryId,
                    projectId: projectId,
                    createdBy: userId
                }
            });
        }
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
