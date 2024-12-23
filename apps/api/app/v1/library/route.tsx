import prisma from "@/lib/prisma";
import { getUTCTime, json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { LIBRARY_EXISTS, LIBRARY_NOT_FOUND } = MESSAGES;
const { SUCCESS, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const organization_id = searchParams.get('organization_id');
        const library_id = searchParams.get('id');
        const query: any = {};
        const joins = searchParams.get('with');

        if (condition === "count") {
            const count = organization_id
                ? await prisma.container.count({
                    where: {
                        type: 'L',
                        container: {
                            type: 'P',
                            container: {
                                type: 'CO',
                                parent_id: Number(organization_id)
                            }
                        }
                    }
                })
                : await prisma.container.count({
                    where: {
                        type: 'L'
                    }
                });
            return new Response(JSON.stringify(count), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }

        if (joins && joins.length) {
            query.include = {};
            if (joins.includes('molecule')) {
                query.include = {
                    ...query.include,
                    libraryMolecules: {
                        include: {
                            user_favourite_molecule: true
                        }
                    },
                }
            }
        }

        if (library_id) {
            query.where = {
                id: Number(library_id),
                type: 'L'
            }; // Add the where condition to the query
            const library = await prisma.container.findUnique(query);

            if (!library) {
                return new Response(JSON.stringify({ error: LIBRARY_NOT_FOUND }), {
                    headers: { "Content-Type": "application/json" },
                    status: NOT_FOUND,
                });
            }

            return new Response(json(library), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS, // success status code
            });
        }

        const libraries = await prisma.container.findMany(query);
        return new Response(json(libraries), {
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
    const { name, target, description, project_id, user_id } = req;

    try {
        const existingLibrary = await prisma.container.findMany({
            where: {
                parent_id: Number(project_id),
                name,
                type: 'L'
            },
        });

        // Check if an library with the same name already exists (case insensitive)
        // const existingLibrary = project?.libraries.filter(library => library.name?.toLowerCase() === name.toLowerCase())[0];

        if (existingLibrary.length) {
            return new Response(JSON.stringify(LIBRARY_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        try {
            // Create a new library
            const newLibrary = await prisma.container.create({
                data: {
                    name,
                    description,
                    type: 'L',
                    created_at: getUTCTime(new Date().toISOString()),
                    is_active: true,
                    metadata: {
                        target
                    },
                    owner: {
                        connect: {
                            id: user_id, // Associate the project with the organization
                        },
                    },
                    userWhoCreated: {
                        connect: {
                            id: user_id, // Associate the project with the organization
                        }
                    },
                    container: {
                        connect: {
                            id: project_id, // Associate the project with the organization
                        },
                    },
                },
            });

            return new Response(json(newLibrary), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        } catch (error) {
            console.error(error);
        } finally {
            await prisma.$disconnect();
        }
    } catch (error) {
        console.error(error);
    }
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { name, target, description, user_id, project_id, id } = req;

        const existingLibrary = await prisma.container.findMany({
            where: {
                AND: [
                    { id: { not: Number(id) } },
                    { 
                        name: name,
                        type: 'L',
                        parent_id: project_id
                     }
                ]
            }
        });

        if (existingLibrary.length) {
            return new Response(JSON.stringify(LIBRARY_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        const updatedLibrary = await prisma.container.update({
            where: { id },
            data: {
                name,
                description,
                metadata: {
                    target
                },
                userWhoUpdated: {
                    connect: {
                        id: user_id
                    }, // Associate the user who created/updated the project
                },
                updated_at: getUTCTime(new Date().toISOString()),
            },
        });

        return new Response(json(updatedLibrary), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // Adjust status code as needed
        });
    } finally {
        await prisma.$disconnect();
    }
}
