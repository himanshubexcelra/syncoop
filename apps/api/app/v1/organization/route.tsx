import prisma from "@/lib/prisma";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";

const { ORGANIZATION_ALREADY_EXISTS, USER_BELONGS_TO_ANOTHER_ORG } = MESSAGES;
const { SUCCESS, CONFLICT, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const orgId = searchParams.get('id'); // Get the organization ID from query parameters
    const type = searchParams.get("type");
    const joins = searchParams.get('with');
    const count = searchParams.get('withCount');
    const roleIds = searchParams.get('roleIds');
    const query: any = {};

    if (joins && joins.length) {
      query.include = {};
      if (joins.includes('orgUser') && !joins.includes('user_role')) {
        query.include = {
          ...query.include,
          user: true,
          orgUser: {
            select: {
              id: true,
              projectPermissions: true,
              orgAdmin: true,
              orgUser: true,
            },
          }
        }
      }
      if (joins.includes('user_role')) {
        query.include = {
          ...query.include,
          user: true,
          orgUser: { // Include users related to this organization
            include: {
              projectPermissions: true,
              orgAdmin: true,
              orgUser: true,
              user_role: {
                orderBy: {
                  role: {
                    priority: 'asc',
                  },
                },
                select: {
                  role: {
                    select: {
                      type: true,
                    }
                  }
                },
                take: 1
              },
            }
          },
        }
      }
      if (joins.includes('org_module') && joins.includes('module_action_role_permission') && roleIds) {
        query.include = {
          ...query.include,
          org_module: {
            include: {
              module: {
                include: {
                  module_action: {
                    where: {
                      module_action_role_permission: {
                        some: {
                          roleId: { in: JSON.parse(roleIds) }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (joins.includes('projects')) {
        query.include = {
          ...query.include,
          projects: {
            include: {
              sharedUsers: true, // Include shared users for each project
              libraries: true,
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
          }
        }
      }
    }
    if (count && count.includes('projects')) {
      query.include = {
        ...query.include,
        _count: {
          select: {
            projects: true, // Count of projects in each organization
          },
        },
      }
    }
    if (orgId) {
      // If an ID is present, fetch the specific organization with users and projects
      query.where = { id: Number(orgId) }; // Add the where condition to the query
      const organization = await prisma.organization.findUnique(query);

      if (!organization) {
        return new Response(JSON.stringify({ error: 'Organization not found' }), {
          headers: { "Content-Type": "application/json" },
          status: NOT_FOUND,
        });
      }

      return new Response(JSON.stringify(organization), {
        headers: { "Content-Type": "application/json" },
        status: SUCCESS, // success status code
      });
    }
    else if (type) {
      query.where = { type: type }; // Add the where condition to the query
      const organization = await prisma.organization.findMany(query);

      if (!organization) {
        return new Response(JSON.stringify({ error: 'Organization not found' }), {
          headers: { "Content-Type": "application/json" },
          status: NOT_FOUND,
        });
      }

      return new Response(JSON.stringify(organization), {
        headers: { "Content-Type": "application/json" },
        status: SUCCESS, // success status code
      });
    }
    else {
      // If no ID is present, fetch all organizations, users, and projects
      const organizations = await prisma.organization.findMany(query);

      return new Response(JSON.stringify(organizations), {
        headers: { "Content-Type": "application/json" },
        status: SUCCESS, // success status code
      });
    }
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, {
      headers: { "Content-Type": "application/json" },
      status: BAD_REQUEST, // bad request
    });
  }
}

export async function POST(request: Request) {

  const req = await request.json();
  const { name, firstName, lastName, email, roleId, createdBy } = req;

  // Check if an organization with the same name already exists (case insensitive)
  try {
    const existingOrganization = await prisma.organization.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive', // Perform case-insensitive comparison
        },
      },
    });

    if (existingOrganization) {
      return new Response(JSON.stringify(ORGANIZATION_ALREADY_EXISTS), {
        headers: { "Content-Type": "application/json" },
        status: INTERNAL_SERVER_ERROR,
      });
    }

    try {
      // Step 1: Create the user (admin)
      const adminUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          status: 'Enabled',
          user_role: {
            create: {
              roleId: roleId,
            },
          },
        },
      });



      // Step 2: Create the organization and link the admin user
      const organization = await prisma.organization.create({
        data: {
          name,
          status: 'Enabled',
          type: "External",
          orgAdminId: adminUser.id, // Link the user as the org admin
          createdBy,
          org_module: {
            create: [
              {
                moduleId: 1
              },
              {
                moduleId: 2
              },
              {
                moduleId: 3
              }
            ]
          }
        },
      });

      // Step 3: Link the admin user as an organization user
      await prisma.user.update({
        where: {
          id: adminUser.id,
        },
        data: {
          organizationId: organization.id, // Associate user with the organization
        },
      });
      return new Response(JSON.stringify(organization), {
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
    const { id, name, user: { id: orgAdminId }, status, metadata } = req;

    // Check if user is associated with another organization
    const existingUser = await prisma.organization.findFirst({
      where: {
        orgAdminId,
        NOT: {
          id,
        },
      },
    });

    if (existingUser) {
      return new Response(JSON.stringify(USER_BELONGS_TO_ANOTHER_ORG), {
        headers: { "Content-Type": "application/json" },
        status: CONFLICT,
      });
    }

    // Update the organization and user details
    const updatedOrganization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        orgAdminId,
        metadata,
        status,
      },
      include: {
        user: {
          include: {
            user_role: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    return new Response(JSON.stringify(updatedOrganization), {
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
