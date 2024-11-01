import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const organizationId = searchParams.get('organizationId');

        if (condition === "count") {
            const count = organizationId
                ? await prisma.molecule.count({ where: { library: { project: { organizationId: Number(organizationId) } } } })
                : await prisma.molecule.count();
            return new Response(JSON.stringify(count), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}

export async function POST(request: Request) {
    const req = await request.json();
    const { userId, moleculeId, existingFavourite, favourite } = req;

    try {
        if (favourite) {
            // Check if the favorite exists
            if (existingFavourite) {
                // If it exists, remove it
                const favorite = await prisma.molecule_favorites.delete({
                    where: {
                        id: existingFavourite.id,
                    },
                });
                return new Response(JSON.stringify(favorite), {
                    headers: { "Content-Type": "application/json" },
                    status: SUCCESS,
                });
            }
            // Create a new favorite entry
            const favorite = await prisma.molecule_favorites.create({
                data: {
                    userId,
                    moleculeId,
                },
            });

            return new Response(JSON.stringify(favorite), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
    } catch (error) {
        console.error(error);
    }
}