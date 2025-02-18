import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function POST(request: Request) {
    const req = await request.json();
    const { user_id, molecule_id, favorite_id, favorite } = req;

    try {
        if (favorite) {
            // Create a new favorite entry
            const favorite = await prisma.user_favorite_molecule.create({
                data: {
                    user_id,
                    molecule_id,
                },
            });

            return new Response(json(favorite), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        } else if (favorite_id) {
            const favorite = await prisma.user_favorite_molecule.delete({
                where: {
                    id: favorite_id,
                },
            });
            return new Response(json(favorite), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
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