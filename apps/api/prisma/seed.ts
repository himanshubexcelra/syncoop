import prisma from "@/lib/prisma";

async function main() {

    /**
     * Inser all roles
     */

    // Insert System Admin Role
    const sARoleCreate = await prisma.role.create({
        data: {
            type: 'admin',
            name: 'System Admin',
            orgType: 'Internal',
            priority: 1,
            status: 'Enabled'
        },
    });

    // Insert Organization Admin Role
    const oARoleCreate = await prisma.role.create({
        data: {
            type: 'org_admin',
            name: 'Organization Admin',
            orgType: 'External',
            priority: 2,
            status: 'Enabled'
        },
    });

    // Insert Library Manger Role
    const lmRoleCreate = await prisma.role.create({
        data: {
            type: 'library_manager',
            name: 'Library Manager',
            orgType: 'External',
            priority: 3,
            status: 'Enabled'
        },
    });

    // Insert Researcher Role
    const resRoleCreate = await prisma.role.create({
        data: {
            type: 'researcher',
            name: 'Researcher',
            orgType: 'External',
            priority: 4,
            status: 'Enabled'
        },
    });

    // Insert Protocol Approver Role
    const paRoleCreate = await prisma.role.create({
        data: {
            type: 'protocol_approver',
            name: 'Protocol Approver',
            orgType: 'External',
            priority: 5,
            status: 'Enabled'
        }
    });

    /**
     * Insert all users
     */

    // Insert User System Admin
    const sysAdminCreate = await prisma.user.create({
        data: {
            id: 1,
            email: 'sys_admin@external.milliporesigma.com',
            firstName: 'System',
            lastName: 'Admin',
            password: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            status: 'Enabled',
            user_role: {
                create: {
                    role: {
                        connect: sARoleCreate
                    }
                }
            }
        },
    });

    // Insert Organization Admin
    const orgAdminCreate = await prisma.user.create({
        data: {
            email: 'org_admin@external.milliporesigma.com',
            firstName: 'Org',
            lastName: 'Admin',
            password: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            status: 'Enabled',
            user_role: {
                create: {
                    role: {
                        connect: oARoleCreate
                    }
                }
            }
        },
    });

    // Insert Library Manager
    await prisma.user.create({
        data: {
            email: 'lib_manager@external.milliporesigma.com',
            firstName: 'Library',
            lastName: 'Manager',
            password: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            status: 'Enabled',
            user_role: {
                create: {
                    role: {
                        connect: lmRoleCreate
                    }
                }
            }
        },
    });

    // Insert Protocol Approver
    await prisma.user.create({
        data: {
            email: 'protocol_approver@external.milliporesigma.com',
            firstName: 'Protocol',
            lastName: 'Approver',
            password: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            status: 'Enabled',
            user_role: {
                create: {
                    role: {
                        connect: paRoleCreate
                    }
                }
            }
        },
    });

    // Insert Researcher
    await prisma.user.create({
        data: {
            email: 'researcher@external.milliporesigma.com',
            firstName: 'Researcher',
            lastName: '',
            password: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            status: 'Enabled',
            user_role: {
                create: {
                    role: {
                        connect: resRoleCreate
                    }
                }
            }
        },
    });

    /**
     * Insert all organizations
     */

    // Insert EMD DD organization
    const emddOrgCreate = await prisma.organization.create({
        data:
        {
            name: 'EMD DD',
            status: 'Enabled',
            type: 'Internal',
            createdAt: new Date(),
            orgAdminId: sysAdminCreate.id
        }
    });

    // Insert Fauxbio organization
    const fauxbioOrgCreate = await prisma.organization.create({
        data:
        {
            name: 'Fauxbio',
            status: 'Enabled',
            type: 'External',
            createdAt: new Date(),
            orgAdminId: orgAdminCreate.id
        }
    });

    /**
     * Assign organization id to each user
     */

    // Update organization Id of System Admin
    await prisma.user.update({
        where: { email: 'sys_admin@external.milliporesigma.com' },
        data: {
            organizationId: emddOrgCreate.id
        },
    });

    // Update organization Id of Org Admin
    await prisma.user.update({
        where: { email: 'org_admin@external.milliporesigma.com' },
        data: {
            organizationId: fauxbioOrgCreate.id
        },
    });

    // Update organization Id of Library Manager
    await prisma.user.update({
        where: { email: 'lib_manager@external.milliporesigma.com' },
        data: {
            organizationId: fauxbioOrgCreate.id
        },
    });

    // Update organization Id of Researcher
    await prisma.user.update({
        where: { email: 'researcher@external.milliporesigma.com' },
        data: {
            organizationId: emddOrgCreate.id
        },
    });

    // Update organization Id of Protocol Approver
    await prisma.user.update({
        where: { email: 'protocol_approver@external.milliporesigma.com' },
        data: {
            organizationId: emddOrgCreate.id
        },
    });

    /**
     * Insert all modules
     */

    // Insert Module Organization with it's role permission
    await prisma.module.create({
        data: {
            name: 'Organization',
            route: '/dashboard',
            status:'Enabled',
            module_permission: {
                create: [
                    {
                        roleId: sARoleCreate.id
                    },
                    {
                        roleId: oARoleCreate.id
                    },
                    {
                        roleId: lmRoleCreate.id
                    },
                    {
                        roleId: paRoleCreate.id
                    },
                    {
                        roleId: resRoleCreate.id
                    }
                ]
            }
        },
    });

    // Insert Module User with it's role permission
    await prisma.module.create({
        data: {
            name: 'User',
            route: '/dashboard',
            status:'Enabled',
            module_permission: {
                create: [
                    {
                        roleId: sARoleCreate.id
                    },
                    {
                        roleId: oARoleCreate.id
                    },
                    {
                        roleId: lmRoleCreate.id
                    },
                    {
                        roleId: paRoleCreate.id
                    },
                    {
                        roleId: resRoleCreate.id
                    }
                ]
            }
        },
    });

    // Insert Module Project with it's role permission
    await prisma.module.create({
        data: {
            name: 'Project',
            route: '/project',
            status:'Enabled',
            module_permission: {
                create: [
                    {
                        roleId: sARoleCreate.id
                    },
                    {
                        roleId: oARoleCreate.id
                    },
                    {
                        roleId: lmRoleCreate.id
                    },
                    {
                        roleId: paRoleCreate.id
                    },
                    {
                        roleId: resRoleCreate.id
                    }
                ]
            }
        },
    });

    // Insert Module Profile with it's role permission
    await prisma.module.create({
        data: {
            name: 'Profile',
            route: '/profile',
            status:'Enabled',
            module_permission: {
                create: [
                    {
                        roleId: sARoleCreate.id
                    },
                    {
                        roleId: oARoleCreate.id
                    },
                    {
                        roleId: lmRoleCreate.id
                    },
                    {
                        roleId: paRoleCreate.id
                    },
                    {
                        roleId: resRoleCreate.id
                    }
                ]
            }
        },
    });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })