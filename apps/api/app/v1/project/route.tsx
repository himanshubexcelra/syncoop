import prisma from "@/lib/prisma";
import { getUTCTime, json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { PROJECT_EXISTS, PROJECT_NOT_FOUND } = MESSAGES;
const { SUCCESS, INTERNAL_SERVER_ERROR, BAD_REQUEST, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const orgId = searchParams.get('orgId');
        const project_id = searchParams.get('project_id');
        const joins = searchParams.get('with');
        const query: any = {
            where: {
                type: 'P'
            }
        };

        if (joins && joins.length) {
            query.include = {};
            if (joins.includes('libraries')) {
                query.include = {
                    ...query.include,
                    other_container: {
                        include: {
                            libraryMolecules: {
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
                            userWhoCreated: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email_id: true,
                                },
                            },
                            userWhoUpdated: {
                                select: {
                                    id: true,
                                    first_name: true,
                                    last_name: true,
                                    email_id: true,
                                },
                            },
                        },
                        where: {
                            type: 'L'
                        },
                        orderBy: [
                            {
                                created_at: 'desc'
                            }
                        ]
                    }
                }
            }
        }
        if (orgId) {
            query.where = {
                ...query.where,
                parent_id: Number(orgId)
            };
        }

        if (condition === "count") {
            const count = await prisma.container.count(query);
            return new Response(JSON.stringify(count), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }

        if (project_id) {
            query.where = {
                ...query.where,
                id: Number(project_id),
            }; // Add the where condition to the query

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
                container: {
                    select: {
                        id: true,
                        name: true,
                        config: true,
                    }
                },
                // sharedUsers: true, // Include shared users for each project
                userWhoCreated: { // Include the user who created the project
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
                userWhoUpdated: { // Include the user who updated the project
                    select: {
                        first_name: true,
                        last_name: true,
                    },
                },
            }
            const project = await prisma.container.findUnique(query);

            if (!project) {
                return new Response(JSON.stringify({ error: PROJECT_NOT_FOUND }), {
                    headers: { "Content-Type": "application/json" },
                    status: NOT_FOUND,
                });
            }

            return new Response(json(project), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS, // success status code
            });
        }

        query.where = {
            ...query.where,
            orderBy:
            {
                id: 'desc',
            }
        }

        const projects = await prisma.container.findMany(query);
        return new Response(json(projects), {
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
    const {
        name,
        type,
        target,
        description,
        organization_id,
        user_id,
        config,
        /* sharedUsers */
    } = req;

    try {
        if (name && organization_id) {
            const existingProject = await prisma.container.findMany({
                where: {
                    name,
                    type: 'P',
                    parent_id: organization_id
                }
            });

            if (existingProject.length) {
                return new Response(JSON.stringify(PROJECT_EXISTS), {
                    headers: { "Content-Type": "application/json" },
                    status: INTERNAL_SERVER_ERROR,
                });
            }
        }

        /* include: {
            projects: { // Include projects related to this organization
                include: {
                    owner: {
                        select: {
                            first_name: true,
                            last_name: true,
                        },
                    }
                },
            },
        }, */

        // Create a new project
        const newProject = await prisma.container.create({
            data: {
                name,
                type: 'P',
                description,
                metadata: {
                    target,
                    type
                },
                is_active: true,
                created_at: getUTCTime(new Date().toISOString()),
                owner: {
                    connect: {
                        id: user_id, // Associate the project with the organization
                    },
                },
                container: {
                    connect: {
                        id: organization_id, // Associate the project with the organization
                    },
                },
                userWhoCreated: {
                    connect: {
                        id: user_id
                    }, // Associate the user who created the project
                },
                config,
                /* sharedUsers: {
                    create: sharedUsers?.map(({ id: user_id, permission, first_name }: { id: number, permission: string, first_name: string }) => ({
                        user: {
                            connect: { id: user_id }, // Connect the user by ID
                        },
                        role: permission,
                        first_name,
                    })) || [] // If sharedUsers is undefined, default to an empty array
                } */
            },
        });

        return new Response(json(newProject), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { name, metadata, target, description,
            organization_id, user_id, /* sharedUsers, */ id, config, inherits_configuration } = req;

        // Check if user is associated with another organization
        /* const organization = await prisma.container.findUnique({
            where: { id: Number(organization_id) },
            include: {
                projects: { // Include projects related to this organization
                    include: {
                        sharedUsers: true, // Include shared users for each project
                        owner: {
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                        userWhoUpdated: { // Include the user who updated the project
                            select: {
                                first_name: true,
                                last_name: true,
                            },
                        },
                    },
                },
            },
        }); */

        // Check if an project with the same name already exists (case insensitive)
        /* let existingProject = organization?.projects.filter(project =>
            project.name?.toLowerCase() === name.toLowerCase()
            && Number(project.id) !== Number(id))[0]; */

        /* if (existingProject) {
            return new Response(JSON.stringify(PROJECT_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        existingProject = organization?.projects.filter(project => project.id === id)[0]; */

        if (name && organization_id) {
            const existingProject = await prisma.container.findMany({
                where: {
                    AND: [
                        { id: { not: Number(id) } },
                        {
                            name: name,
                            type: 'P',
                            parent_id: organization_id
                        }
                    ]
                }
            });
            if (existingProject.length) {
                return new Response(json(PROJECT_EXISTS), {
                    headers: { "Content-Type": "application/json" },
                    status: INTERNAL_SERVER_ERROR,
                });
            }
        }


        /* // Step 3: Create a set of user IDs from the incoming shared users
        const incomingUserIds = new Set(sharedUsers?.map(({ id }: { id: number }) => id));

        // Step 4: Determine which users need to be removed
        const usersToRemove = existingProject?.sharedUsers
            .filter(user => !incomingUserIds.has(user.user_id))
            .map(user => user.id); // Collect the IDs of shared users to remove */


        const updatedProject = await prisma.container.update({
            where: { id },
            data: {
                name,
                description,
                metadata: {
                    ...metadata,
                    target,
                },
                config,
                inherits_configuration,
                userWhoUpdated: {
                    connect: { id: user_id }, // Associate the user who created/updated the project
                },
                updated_at: getUTCTime(new Date().toISOString()),
                /* sharedUsers: {
                    deleteMany: {
                        id: { in: usersToRemove }, // Remove users not in the request
                    },
                    upsert: sharedUsers?.map(({ id: user_id, permission, first_name }: { id: number, permission: string, first_name: string }) => ({
                        where: { user_id_project_id: { user_id, project_id: id } }, // Ensure you have a unique constraint on user_id and project_id
                        update: {
                            role: permission,
                            first_name,
                        },
                        create: {
                            user: {
                                connect: { id: user_id }, // Connect the user by ID
                            },
                            role: permission,
                            first_name,
                        },
                    })) || []
                } */
            },
        });

        return new Response(json(updatedProject), {
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
