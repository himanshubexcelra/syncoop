import prisma from "@/lib/prisma";
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
                ? await prisma.project.count({ where: { organizationId: Number(orgId) } })
                : await prisma.project.count();
            return new Response(JSON.stringify(count), {
                headers: { "Content-Type": "application/json" },
                status: SUCCESS,
            });
        }
        if (orgId) {
            query.where = { organizationId: Number(orgId) };
        }

        const projects = await prisma.project.findMany(query);
        return new Response(JSON.stringify(projects), {
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
    const { name, type, target, description, organizationId, userId, sharedUsers } = req;

    try {
        const organization = await prisma.organization.findUnique({
            where: { id: Number(organizationId) },
            include: {
                projects: { // Include projects related to this organization
                    include: {
                        sharedUsers: true, // Include shared users for each project
                        owner: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                        updatedBy: { // Include the user who updated the project
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
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
                            id: userId, // Associate the project with the organization
                        },
                    },
                    organization: {
                        connect: {
                            id: organizationId, // Associate the project with the organization
                        },
                    },
                    updatedBy: {
                        connect: { id: userId }, // Associate the user who created/updated the project
                    },
                    sharedUsers: {
                        create: sharedUsers?.map(({ id, permission, firstName }: { id: number, permission: string, firstName: string }) => ({
                            user: {
                                connect: { id: id }, // Connect the user by ID
                            },
                            role: permission,
                            firstName,
                        })) || []
                    }
                },
            });

            return new Response(JSON.stringify(newProject), {
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
        const { name, type, target, description, organizationId, userId, sharedUsers, id } = req;

        // Check if user is associated with another organization
        const organization = await prisma.organization.findUnique({
            where: { id: Number(organizationId) },
            include: {
                projects: { // Include projects related to this organization
                    include: {
                        sharedUsers: true, // Include shared users for each project
                        owner: {
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                        updatedBy: { // Include the user who updated the project
                            select: {
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });

        // Check if an project with the same name already exists (case insensitive)
        const existingProject = organization?.projects.filter(project => project.name?.toLowerCase() === name.toLowerCase() && project.id !== id)[0];

        if (existingProject) {
            return new Response(JSON.stringify(PROJECT_EXISTS), {
                headers: { "Content-Type": "application/json" },
                status: INTERNAL_SERVER_ERROR,
            });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: {
                name,
                type,
                description,
                target,
                updatedBy: {
                    connect: { id: userId }, // Associate the user who created/updated the project
                },
                sharedUsers: {
                    create: sharedUsers?.map(({ id, permission, firstName }: { id: number, permission: string, firstName: string }) => ({
                        user: {
                            connect: { id: id }, // Connect the user by ID
                        },
                        role: permission,
                        firstName,
                    })) || []
                }
            },
        });

        return new Response(JSON.stringify(updatedProject), {
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
