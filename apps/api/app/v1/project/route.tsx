/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { ContainerAccessPermissionType, ContainerType } from "@/utils/definition";
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
                type: ContainerType.PROJECT
            }
        };

        if (joins && joins.length) {
            query.include = {};
            if (joins.includes('libraries')) {
                query.include = {
                    ...query.include,
                    other_container: {
                        include: {
                            container_access_permission: true,
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
                            type: ContainerType.LIBRARY
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
                container_access_permission: true,
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
                        metadata: true,
                    }
                },
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
        sharedUsers,
    } = req;

    try {
        if (name && organization_id) {
            const existingProject = await prisma.container.findMany({
                where: {
                    name,
                    type: ContainerType.PROJECT,
                    parent_id: organization_id
                }
            });

            if (existingProject.length) {
                return new Response(JSON.stringify({ error: PROJECT_EXISTS }), {
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
                type: ContainerType.PROJECT,
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
                container_access_permission: {
                    create: sharedUsers?.map(({ id: user_id, permission }: {
                        id: number, permission: string
                    }) => ({
                        user: {
                            connect: { id: user_id }, // Connect the user by ID
                        },
                        access_type: ContainerAccessPermissionType[
                            permission as keyof typeof ContainerAccessPermissionType],
                        created_at: getUTCTime(new Date().toISOString()),
                    }))
                }
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
        const { 
            name, 
            metadata, 
            description,
            organization_id, 
            user_id, 
            sharedUsers, 
            id, 
            config,
            inherits_configuration, 
            inherits_bioassays 
        } = req;

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
                            type: ContainerType.PROJECT,
                            parent_id: organization_id
                        }
                    ]
                }
            });
            if (existingProject.length) {
                return new Response(JSON.stringify({ error: PROJECT_EXISTS }), {
                    headers: { "Content-Type": "application/json" },
                    status: INTERNAL_SERVER_ERROR,
                });
            }
        }

        const existingProject = await prisma.container.findMany({
            where: {
                id: Number(id)
            },
            include: {
                container_access_permission: true,
            }
        });

        // Step 3: Create a set of user IDs from the incoming shared users
        const incomingUserIds = new Set(sharedUsers?.map(({ id }: { id: number }) => id));

        // Step 4: Determine which users need to be removed
        const usersToRemove = existingProject[0]?.container_access_permission
            .filter(user => !incomingUserIds.has(user.user_id) && user.user_id != user_id)
            .map(user => user.id); // Collect the IDs of shared users to remove


        const updatedProject = await prisma.container.update({
            where: { id },
            data: {
                name,
                description,
                metadata,
                config,
                inherits_configuration,
                inherits_bioassays,
                userWhoUpdated: {
                    connect: { id: user_id }, // Associate the user who created/updated the project
                },
                updated_at: getUTCTime(new Date().toISOString()),
                container_access_permission: {
                    deleteMany: {
                        id: { in: usersToRemove }, // Remove users not in the request
                    },
                    upsert: sharedUsers?.map(({ id: user_id, permission }: {
                        id: number, permission: string
                    }) => ({
                        where: { container_id_user_id: { user_id, container_id: id } },
                        update: {
                            access_type: ContainerAccessPermissionType[
                                permission as keyof typeof ContainerAccessPermissionType],
                        },
                        create: {
                            user: {
                                connect: { id: user_id }, // Connect the user by ID
                            },
                            access_type: ContainerAccessPermissionType[
                                permission as keyof typeof ContainerAccessPermissionType],
                            created_at: getUTCTime(new Date().toISOString()),
                        },
                    })) || []
                }
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

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const project_id = searchParams.get('project_id');
        const isDeleteRelationEnable = searchParams.get('isDeleteRelationEnable');
        if (isDeleteRelationEnable) {
            await prisma.molecule.deleteMany({
                where: {
                    project_id: Number(project_id),
                },
            });
            await prisma.container.deleteMany({
                where: {
                    parent_id: Number(project_id),
                },
            });

        }
        const result = await prisma.container.delete({
            where: {
                id: Number(project_id),
            },
        })
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