import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";
const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;
interface OrderData {
    orderId: number;
    orderName: number;
    moleculeId: number;
    libraryId: number;
    projectId: number;
    organizationId: number;
    userId: string;

}

function generateRandomEightDigitNumber() {
    // Generate a random number between 10000000 and 99999999
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return randomNum;
}

export async function POST(request: Request) {
    const req = await request.json();
    const orderId = generateRandomEightDigitNumber();
    const orderName = `Order${orderId}`
    const result = req.map((item: OrderData) => ({
        orderId: Number(orderId),
        orderName: orderName,
        moleculeId: Number(item.moleculeId),
        organizationId: Number(item.organizationId),
        projectId: Number(item.projectId),
        libraryId: Number(item.libraryId),
        batch_detail: {},
        createdBy: Number(item.userId),
        updatedBy: Number(item.userId),
        userId: Number(item.userId)
    }));
    try {
        await prisma.molecule_order.createMany({
            data: result
        })
        return new Response(JSON.stringify(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    }
    catch (error) {
        console.error(error);
    }
}

