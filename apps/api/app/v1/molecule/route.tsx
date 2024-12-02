import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const organization_id = searchParams.get('organization_id');

        const query: any = {};
        if (condition === "count") {
            if (organization_id) {
                query.where = {
                    organization_id: Number(organization_id)
                }
            }


            const count = await prisma.molecule.count(query)
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

type MOLECULETYPE = {
    status: number,
    molecule_id: number,
    userId: number,
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { formData, status, userId } = req;

        const updatePromises = formData.map(async ({ molecule_id }: MOLECULETYPE) => {
            return await prisma.molecule.update({
                where: { id: molecule_id },
                data: {
                    status: status,
                    userWhoUpdated: {
                        connect: { id: userId }, // Associate the user who created/updated the project
                    },
                    updated_at: new Date().toISOString(),
                },
            });
        });

        const updatedMolecules = await Promise.all(updatePromises);
        return new Response(json(updatedMolecules), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // Adjust status code as needed
        });
    } finally {
        await prisma.$disconnect();
    }
}