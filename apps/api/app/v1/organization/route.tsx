/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@/utils/constants";
import { getUTCTime, json } from "@/utils/helper";

const { ORGANIZATION_ALREADY_EXISTS, } = MESSAGES;
const { SUCCESS, BAD_REQUEST, INTERNAL_SERVER_ERROR, NOT_FOUND } = STATUS_TYPE;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const searchParams = new URLSearchParams(url.searchParams);
    const orgId = searchParams.get('id'); // Get the organization ID from query parameters
    const type = searchParams.get("type");
    const joins = searchParams.get('with');
    const count = searchParams.get('withCount');
    const role_ids = searchParams.get('role_ids');
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
      if (joins.includes('org_product_module')
        && joins.includes('product_module_action_role_permission')
        && role_ids) {
        query.include = {
          ...query.include,
          org_product_module: {
            include: {
              product_module: {
                include: {
                  product_module_action: {
                    where: {
                      product_module_action_role_permission: {
                        some: {
                          role_id: { in: JSON.parse(role_ids) }
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
              libraries: {
                select: {
                  _count: {
                    select: {
                      molecule: true, // Count molecules in each library
                    },
                  },
                },
              },
              owner: {
                select: {
                  first_name: true,
                  last_name: true,
                },
              },
              userWhoCreated: { // Include the user who updated the project
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
      const organization = await prisma.container.findUnique(query);

      if (!organization) {
        return new Response(JSON.stringify({ error: 'Organization not found' }), {
          headers: { "Content-Type": "application/json" },
          status: NOT_FOUND,
        });
      }

      return new Response(json(organization), {
        headers: { "Content-Type": "application/json" },
        status: SUCCESS, // success status code
      });
    }
    else if (type) {
      query.where = { type: type }; // Add the where condition to the query
      const organization = await prisma.container.findMany(query);

      if (!organization) {
        return new Response(JSON.stringify({ error: 'Organization not found' }), {
          headers: { "Content-Type": "application/json" },
          status: NOT_FOUND,
        });
      }

      return new Response(json(organization), {
        headers: { "Content-Type": "application/json" },
        status: SUCCESS, // success status code
      });
    }
    else {
      // If no ID is present, fetch all organizations, users, and projects
      const organizations = await prisma.container.findMany(query);

      return new Response(json(organizations), {
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
  const { name, first_name, last_name, email_id, role_id, created_by, password_hash } = req;
  const hashedPassword = await bcrypt.hash(password_hash, SALT_ROUNDS);
  // Check if an organization with the same name already exists (case insensitive)
  try {
    const existingOrganization = await prisma.container.findFirst({
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
      const adminUser = await prisma.users.create({
        data: {
          first_name,
          last_name,
          email_id,
          password_hash: hashedPassword,
          status: 'Enabled',
          user_role: {
            create: {
              role_id: role_id,
            },
          },
        },
      });



      // Step 2: Create the organization and link the admin user
      const organization = await prisma.container.create({
        data: {
          name,
          status: 'Enabled',
          type: "External",
          orgAdminId: adminUser.id, // Link the user as the org admin
          created_by,
          org_product_module: {
            create: [
              {
                product_module_id: 1,
                created_at: getUTCTime(new Date().toISOString()),
                created_by: adminUser.id,
              },
              {
                product_module_id: 2,
                created_at: getUTCTime(new Date().toISOString()),
                created_by: adminUser.id,
              },
              {
                product_module_id: 3,
                created_at: getUTCTime(new Date().toISOString()),
                created_by: adminUser.id,
              }
            ]
          }
        },
      });

      // Step 3: Link the admin user as an organization user
      await prisma.users.update({
        where: {
          id: adminUser.id,
        },
        data: {
          organization_id: organization.id, // Associate user with the organization
        },
      });
      return new Response(json(organization), {
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
    const { id, primaryContactId, status, metadata } = req;

    // Update the organization and user details
    const updatedOrganization = await prisma.container.update({
      where: { id },
      data: {
        orgAdminId: primaryContactId,
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

    return new Response(json(updatedOrganization), {
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
