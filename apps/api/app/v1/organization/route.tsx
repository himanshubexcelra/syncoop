import prisma from "@/lib/prisma";

export const dynamic = "force-static";

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
      status: 200,
    });
  } catch (error: any) {
    return new Response(`Webhook error: ${error.message}`, {
      status: 400,
    });
  }
}

export async function POST(request: Request) {

  const req = await request.json();
  const { name, firstName, lastName, email } = req;

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
      const message = `Organization ${existingOrganization.name} already exists`;
      return new Response(JSON.stringify(message), {
        headers: { "Content-Type": "application/json" },
        status: 500,
      });
      // throw new Error(`An organization with the name "${name}" already exists.`);
    }

    try {

      // Create the organization with the user and role
      const organization = await prisma.organization.create({
        data: {
          name,
          status: "Enabled",
          user: {
            create: {
              firstName,
              lastName,
              email,
              status: "Enabled",
              user_role: {
                create: {
                  roleId: 2, // Assign the role to the user
                },
              },
            },
          },
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

      return new Response(JSON.stringify(organization), {
        headers: { "Content-Type": "application/json" },
        status: 200,
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
