/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@/utils/constants";
import { getUTCTime, json } from "@/utils/helper";
import { ContainerType } from "@/utils/definition";

const { ORGANIZATION_ALREADY_EXISTS, EMAIL_ALREADY_EXIST } = MESSAGES;
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
    const query: any = {
      where: {
        OR: [
          {
            type: ContainerType.ORGANIZATION
          },
          {
            type: ContainerType.CLIENT_ORGANIZATION
          }
        ]
      }
    };

    if (joins && joins.length) {
      query.include = {};
      if (joins.includes('orgUser')) {
        query.include = {
          ...query.include,
          owner: true,   // owner
          orgUser: {    // All organization users
            select: {
              id: true,
              first_name: true,
              last_name: true,
              // projectPermissions: true,
              owner: true,
              orgUser: true,
              ...(() => {
                if (joins.includes('user_role')) {
                  return {
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
                    }
                  }
                }
              })()
            },
          }
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
          other_container: {
            where: {
              type: ContainerType.PROJECT
            },
            orderBy:
            {
              id: 'desc',
            },
            include: {
              // sharedUsers: true, // Include shared users for each project
              other_container: {
                where: {
                  type: ContainerType.LIBRARY
                },
                select: {
                  _count: {
                    select: {
                      libraryMolecules: true, // Count molecules in each library
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
            other_container: { // Count of projects in each organization
              where: {
                type: ContainerType.PROJECT
              }
            }
          }
        }
      }
    }
    if (count && count.includes('molecules')) {
      query.include = {
        ...query.include,
        _count: {
          select: {
            ...query.include._count?.select,  // Keep the existing count of projects
            organizationMolecules: true,  // Count of molecules for each organization
          },
        },
        organizationMolecules: true, // Include the actual molecules if needed
      };
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
    } else {
      if (type) {
        query.where = { type: type }; // Add the where condition to the query
      } if (joins?.includes('projects')) {
        query.orderBy = {
          name: 'asc',
        }
      }
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
  } catch (error: any) {
    return new Response(`Error: ${error.message}`, {
      headers: { "Content-Type": "application/json" },
      status: BAD_REQUEST, // bad request
    });
  }
}

export async function POST(request: Request) {

  const req = await request.json();
  const { name, first_name, last_name, email_id, role_id, created_by, password_hash, config } = req;
  // Check if an organization with the same name already exists (case insensitive)
  try {
    const existingOrganization = await prisma.container.findFirst({
      where: {
        OR: [
          {
            type: ContainerType.ORGANIZATION
          },
          {
            type: ContainerType.CLIENT_ORGANIZATION
          }
        ],
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
    const existingUser = await prisma.users.findUnique({
      where: { email_id: email_id },
    });
    if (existingUser) {
      return new Response(JSON.stringify(EMAIL_ALREADY_EXIST), {
        headers: { "Content-Type": "application/json" },
        status: INTERNAL_SERVER_ERROR,
      });
    }
    try {
      const emddORG = await prisma.container.findMany({
        where: {
          type: ContainerType.ORGANIZATION,
          name: 'EMD DD'
        },
      });

      const orgManagementProductModule = await prisma.product_module.findUnique({
        where: {
          name: 'Organization Management'
        },
      });

      const projectManagementProductModule = await prisma.product_module.findUnique({
        where: {
          name: 'Project Management'
        },
      });

      const userManagementProductModule = await prisma.product_module.findUnique({
        where: {
          name: 'User Management'
        },
      });
      const retroSynthesisModule = await prisma.product_module.findUnique({
        where: {
          name: 'Retrosynthesis'
        },
      });
      const pathwayModule = await prisma.product_module.findUnique({
        where: {
          name: 'Pathway Viewer'
        },
      });
      // Step 1: Create the user (admin)
      const hashedPassword = await bcrypt.hash(password_hash, SALT_ROUNDS);
      const adminUser = await prisma.users.create({
        data: {
          first_name,
          last_name,
          email_id,
          password_hash: hashedPassword,
          is_active: true,
          created_at: getUTCTime(new Date().toISOString()),
          user_role: {
            create: {
              role_id: role_id,
              created_at: getUTCTime(new Date().toISOString()),
            },
          },
        },
      });

      let clientOrgModulePurchased: any[] = [];
      if (orgManagementProductModule) {
        clientOrgModulePurchased = [
          ...clientOrgModulePurchased,
          {
            product_module_id: orgManagementProductModule?.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: adminUser.id,
          }
        ]
      }


      if (projectManagementProductModule) {
        clientOrgModulePurchased = [
          ...clientOrgModulePurchased,
          {
            product_module_id: projectManagementProductModule?.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: adminUser.id,
          }
        ]
      }


      if (userManagementProductModule) {
        clientOrgModulePurchased = [
          ...clientOrgModulePurchased,
          {
            product_module_id: userManagementProductModule?.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: adminUser.id,
          }
        ]
      }
      if (retroSynthesisModule) {
        clientOrgModulePurchased = [
          ...clientOrgModulePurchased,
          {
            product_module_id: retroSynthesisModule?.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: adminUser.id,
          }
        ]
      }
      if (pathwayModule) {
        clientOrgModulePurchased = [
          ...clientOrgModulePurchased,
          {
            product_module_id: pathwayModule?.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: adminUser.id,
          }
        ]
      }
      if (emddORG.length) {
        // Step 2: Create the organization and link the admin user
        const organization = await prisma.container.create({
          data: {
            name,
            is_active: true,
            type: "CO",
            parent_id: emddORG[0].id,
            owner_id: adminUser.id, // Link the user as the org admin
            created_by,
            inherits_configuration: false,
            created_at: getUTCTime(new Date().toISOString()),
            config: config,
            org_product_module: {
              create: clientOrgModulePurchased
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
      }
    } catch (error: any) {
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { "Content-Type": "application/json" },
        status: BAD_REQUEST, // Adjust status code as needed
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: BAD_REQUEST, // Adjust status code as needed
    });
  }
}

export async function PUT(request: Request) {
  try {
    const req = await request.json();
    const { id, primaryContactId, is_active, metadata, config } = req;

    // Update the organization and user details
    const updatedOrganization = await prisma.container.update({
      where: { id },
      data: {
        owner_id: primaryContactId,
        metadata,
        is_active,
        updated_at: getUTCTime(new Date().toISOString()),
        config,
        inherits_configuration: false,
      },
      include: {
        owner: {
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
