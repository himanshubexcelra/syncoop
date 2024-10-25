import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS } = STATUS_TYPE;

export async function POST(request:Request) {
    const req = await request.json();

    const result = req.map(item => ({
        moleculeId: parseInt(item.moleculeId),
        libraryId: parseInt(item.libraryId),
        createdBy:parseInt(item.userId)
    }));
    try {
        await prisma.molecule_cart.createMany({
            data:result
          })
        return new Response(JSON.stringify([]), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    }
    catch (error) {
        console.error(error,'Error');
    }
}
