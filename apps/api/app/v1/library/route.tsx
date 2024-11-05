import prisma from "@/lib/prisma";
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
                ? await prisma.library.count({ where: { project: { organization_id: Number(organization_id) } } })
                : await prisma.library.count();
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
                    molecule: {
                        include: {
                            molecule_favorites: true
                        }
                    },
                }
            }
        }

        if (library_id) {
            query.where = { id: Number(library_id) }; // Add the where condition to the query
            const library = await prisma.library.findUnique(query);

            if (!library) {
                return new Response(JSON.stringify({ error: LIBRARY_NOT_FOUND }), {
                    headers: { "Content-Type": "application/json" },
                    status: NOT_FOUND,
                });
            }

            return new Response(JSON.stringify(library), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS, // success status code
            });
        }

        const libraries = await prisma.library.findMany(query);
        return new Response(JSON.stringify(libraries), {
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
    const { name, target, description, project_id, userId } = req;

    try {
        const project = await prisma.project.findUnique({
            where: { id: Number(project_id) },
            include: {
                libraries: true,
            },
        });

        // Check if an library with the same name already exists (case insensitive)
        const existingLibrary = project?.libraries.filter(library => library.name?.toLowerCase() === name.toLowerCase())[0];

        if (existingLibrary) {
            return new Response(JSON.stringify(LIBRARY_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        try {
            // Create a new project
            const newLibrary = await prisma.library.create({
                data: {
                    name,
                    description,
                    target,
                    owner: {
                        connect: {
                            id: userId, // Associate the project with the organization
                        },
                    },
                    project: {
                        connect: {
                            id: project_id, // Associate the project with the organization
                        },
                    },
                },
            });

            return new Response(JSON.stringify(newLibrary), {
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
        const { name, target, description, project_id, userId, id } = req;

        const project = await prisma.project.findUnique({
            where: { id: Number(project_id) },
            include: {
                libraries: true,
            },
        });

        const existingLibrary = project?.libraries.filter(library => library.name?.toLowerCase() === name.toLowerCase() && library.id !== id)[0];

        if (existingLibrary) {
            return new Response(JSON.stringify(LIBRARY_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        const updatedLibrary = await prisma.library.update({
            where: { id },
            data: {
                name,
                description,
                target,
                updated_by: {
                    connect: { id: userId }, // Associate the user who created/updated the project
                },
                updated_at: new Date().toISOString(),
            },
        });

        return new Response(JSON.stringify(updatedLibrary), {
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
