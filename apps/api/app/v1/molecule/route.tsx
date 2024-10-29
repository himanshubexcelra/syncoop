import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const libraryId = searchParams.get('libraryId');
        const isLibrary = searchParams.get('isLibrary') === 'true';
        const query: any = {
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

    const result = req.map(item => ({
        moleculeId: Number(item.moleculeId),
        libraryId: Number(item.libraryId),
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
