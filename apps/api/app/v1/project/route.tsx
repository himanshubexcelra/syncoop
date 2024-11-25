import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { PROJECT_EXISTS } = MESSAGES;
const { SUCCESS, INTERNAL_SERVER_ERROR, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const condition = searchParams.get('condition');
        const orgId = searchParams.get('orgId');
        const query: any = {};

        if (condition === "count") {
            const count = orgId
                ? await prisma.project.count({ where: { organization_id: Number(orgId) } })
                : await prisma.project.count();
            return new Response(JSON.stringify(count), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
        if (orgId) {
            query.where = { organization_id: Number(orgId) };
        }

        const projects = await prisma.project.findMany(query);
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
    const { name, type, target, description, organization_id, user_id, sharedUsers } = req;

    try {
        const organization = await prisma.container.findUnique({
            where: { id: Number(organization_id) },
            include: {
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
            },
        });

        // Check if an project with the same name already exists (case insensitive)
        const existingProject = organization?.projects.filter(project => project.name?.toLowerCase() === name.toLowerCase())[0];

        if (existingProject) {
            return new Response(JSON.stringify(PROJECT_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        try {
            // Create a new project
            const newProject = await prisma.project.create({
                data: {
                    name,
                    type,
                    description,
                    target,
                    owner: {
                        connect: {
                            id: user_id, // Associate the project with the organization
                        },
                    },
                    organization: {
                        connect: {
                            id: organization_id, // Associate the project with the organization
                        },
                    },
                    userWhoCreated: {
                        connect: { id: user_id }, // Associate the user who created the project
                    },
                    sharedUsers: {
                        create: sharedUsers?.map(({ id: user_id, permission, first_name }: { id: number, permission: string, first_name: string }) => ({
                            user: {
                                connect: { id: user_id }, // Connect the user by ID
                            },
                            role: permission,
                            first_name,
                        })) || [] // If sharedUsers is undefined, default to an empty array
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
    } catch (error) {
        console.error(error);
    }
}


export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { name, type, target, description, organization_id, user_id, sharedUsers, id } = req;

        // Check if user is associated with another organization
        const organization = await prisma.container.findUnique({
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
        });

        // Check if an project with the same name already exists (case insensitive)
        let existingProject = organization?.projects.filter(project =>
            project.name?.toLowerCase() === name.toLowerCase()
            && Number(project.id) !== Number(id))[0];
        if (existingProject) {
            return new Response(JSON.stringify(PROJECT_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        existingProject = organization?.projects.filter(project => project.id === id)[0];

        // Step 3: Create a set of user IDs from the incoming shared users
        const incomingUserIds = new Set(sharedUsers?.map(({ id }: { id: number }) => id));

        // Step 4: Determine which users need to be removed
        const usersToRemove = existingProject?.sharedUsers
            .filter(user => !incomingUserIds.has(user.user_id))
            .map(user => user.id); // Collect the IDs of shared users to remove


        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                type,
                description,
                target,
                userWhoUpdated: {
                    connect: { id: user_id }, // Associate the user who created/updated the project
                },
                sharedUsers: {
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
                }
            },
        });

        return new Response(json(updatedProject), {
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
