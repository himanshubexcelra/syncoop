import prisma from "@/lib/prisma";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const project_id = Number(params.id); // Get the project ID from query parameters
    const joins = searchParams.get('with');
    const query: any = {};

    if (joins && joins.length) {
        query.include = {};

        if (joins.includes('libraries')) {
            query.include = {
                ...query.include,
                owner: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email_id: true,
                    },
                },
                organization: {
                    select: {
                        name: true,
                    }
                },
                libraries: {
                    include: {
                        molecule: {
                            select: {
                                status: true,
                            }
                        },
                        owner: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email_id: true,
                            },
                        },
                        updated_by: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email_id: true,
                            },
                        },
                    }
                }
            }
        }
        query.where = { id: Number(project_id) };
    }

    try {
        const projects = await prisma.project.findUnique(query);

        return new Response(JSON.stringify(projects), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS, // success status code
        });
    } catch (error: any) {
        return new Response(`Error: ${error.message}`, {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // bad request
        });
    }
}
