import prisma from "@/lib/prisma";
import json from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const organization_id = searchParams.get('organization_id');

        if (condition === "count") {
            const count = organization_id
                ? await prisma.molecule.count({ where: { library: { project: { organization_id: Number(organization_id) } } } })
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
    const { user_id, molecule_id, existingFavourite, favourite } = req;

    try {
        if (favourite) {
            // Check if the favorite exists
            if (existingFavourite) {
                // If it exists, remove it
                const favorite = await prisma.user_favourite_molecule.delete({
                    where: {
                        id: existingFavourite.id,
                    },
                });
                return new Response(json(favorite), {
                    headers: { "Content-Type": "application/json" },
                    status: SUCCESS,
                });
            }
            // Create a new favorite entry
            const favorite = await prisma.user_favourite_molecule.create({
                data: {
                    user_id,
                    molecule_id,
                },
            });

            return new Response(json(favorite), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
    } catch (error) {
        console.error(error);
    }
}