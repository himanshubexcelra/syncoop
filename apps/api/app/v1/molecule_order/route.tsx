/* eslint-disable @typescript-eslint/no-unused-vars */
import prisma from "@/lib/prisma";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { MOLECULE_ORDER_NOT_FOUND } = MESSAGES;
const { SUCCESS, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        // Parse the URL to retrieve query parameters
        const url = new URL(request.url);
        const projectId = url.searchParams.get('projectId');
        const libraryId = url.searchParams.get('libraryId');
        const organizationId = url.searchParams.get('organizationId');

        // Check if the required parameters are present
        if (!organizationId && (!projectId || !libraryId)) {
            return new Response(JSON.stringify({ error: MOLECULE_ORDER_NOT_FOUND }), {
                headers: { "Content-Type": "application/json" },
                status: NOT_FOUND,
            });
        }

        // Build the database query conditionally based on the provided parameters
        const whereClause = organizationId
            ? { organizationId: Number(organizationId) }
            : {
                projectId: Number(projectId),
                libraryId: Number(libraryId),
            };

        // Query the database for records based on the `whereClause`
        const data = await prisma.molecule_order.findMany({
            include: {
                organization: {
                    select: {
                        name: true,
                    },
                },
                molecule: {
                    select: {
                        molecular_weight: true,
                        smile: true,
                        status: true,
                    },
                },
            },
            where: whereClause,
        });

        // Return the fetched data with a 200 status code
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS, // success status code
        });
    } catch (error: any) {
        console.error("Error fetching molecule order data:", error);

        // Return an error response if any issue arises
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST,
        });
    }
}
