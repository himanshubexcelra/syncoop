/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { getUTCTime, json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";
import { ContainerType, MoleculeStatusCode } from "@/utils/definition";

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
                        type: ContainerType.LIBRARY,
                        container: {
                            type: ContainerType.PROJECT,
                            container: {
                                type: ContainerType.CLIENT_ORGANIZATION,
                                parent_id: Number(organization_id)
                            }
                        }
                    }
                })
                : await prisma.container.count({
                    where: {
                        type: ContainerType.LIBRARY
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
                type: ContainerType.LIBRARY
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
    const { name,
        target,
        description,
        project_id,
        organization_id,
        user_id,
        config
    } = req;

    try {
        const existingLibrary = await prisma.container.findMany({
            where: {
                container: {
                    id: Number(project_id),
                    type: ContainerType.PROJECT,
                    container: {
                        id: Number(organization_id),
                        type: {
                            in: [
                                ContainerType.CLIENT_ORGANIZATION,
                                ContainerType.ORGANIZATION
                            ]
                        }
                    }
                },
                name,
                type: ContainerType.LIBRARY
            },
        });

        // Check if an library with the same name already exists (case insensitive)
        if (existingLibrary.length) {
            return new Response(JSON.stringify({ error: LIBRARY_EXISTS }), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR, // Adjust status code as needed
            });
        }
        // Create a new library
        const newLibrary = await prisma.container.create({
            data: {
                name,
                description,
                type: ContainerType.LIBRARY,
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
                config,
            },
        });

        return new Response(json(newLibrary), {
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

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const {
            name,
            target,
            description, user_id,
            project_id,
            organization_id,
            id,
            config,
            inherits_configuration,
            inherits_bioassays,
            metadata,
        } = req;

        const existingLibrary = await prisma.container.findMany({
            where: {
                AND: [
                    { id: { not: Number(id) } },
                    {
                        container: {
                            id: Number(project_id),
                            type: ContainerType.PROJECT,
                            container: {
                                id: Number(organization_id),
                                type: {
                                    in: [
                                        ContainerType.CLIENT_ORGANIZATION,
                                        ContainerType.ORGANIZATION
                                    ]
                                }
                            }
                        },
                        name,
                        type: ContainerType.LIBRARY
                    }
                ]
            }
        });

        if (existingLibrary.length) {
            return new Response(JSON.stringify({ error: LIBRARY_EXISTS }), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR, // Adjust status code as needed
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
                config,
                inherits_configuration,
                inherits_bioassays,
                metadata,
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

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const library_id = searchParams.get('library_id');

        const result = [];
        // check if the library has any molecule with status except New.
        const countMolecule = await (prisma.molecule as any).count({
            where: {
                library_id: Number(library_id),
                status: {
                    not: MoleculeStatusCode.New,
                },
            },
        });
        // delete library if libraries has only molecule with new status.
        if (countMolecule === 0) {
            const deleteRecord = await (prisma.molecule as any).deleteMany({
                where: {
                    library_id: Number(library_id),
                    status: MoleculeStatusCode.New,
                },
            });
            if (deleteRecord) {
                await prisma.container.delete({
                    where: {
                        id: Number(library_id),
                    },
                })
            }
            countMolecule === 0 ? result.push(deleteRecord) : result.push(countMolecule);
        }
        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // BAD_REQUEST
        });
    }
}
