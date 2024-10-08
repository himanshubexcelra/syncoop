import prisma from "@/lib/prisma";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";

const { ORGANIZATION_ALREADY_EXISTS, USER_BELONGS_TO_ANOTHER_ORG } = MESSAGES;
const { SUCCESS, CONFLICT, BAD_REQUEST, INTERNAL_SERVER_ERROR } = STATUS_TYPE;

export async function GET() {
  try {
    const organizations = await prisma.organization.findMany({
      relationLoadStrategy: "join",
      include: {
        user: true,
      },
    } as any);
    return new Response(JSON.stringify(organizations), {
      headers: { "Content-Type": "application/json" },
      status: SUCCESS,
    });
  } catch (error: any) {
    return new Response(`Webhook error: ${error.message}`, {
      status: BAD_REQUEST,
    });
  }
}

export async function POST(request: Request) {

  const req = await request.json();
  const { name, firstName, lastName, email, roleId } = req;

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
          orgAdminId: adminUser.id, // Link the user as the org admin
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
                role: true, // Include role details if needed
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
