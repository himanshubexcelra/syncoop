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
            definition: '',
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
            definition: '',
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
            definition: '',
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
            definition: '',
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
            definition: '',
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
            email: 'sys_admin@external.milliporesigma.com',
            firstName: 'User System',
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
            firstName: 'User Org',
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
            firstName: 'User Library',
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
            firstName: 'User Protocol',
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
            firstName: 'User Researcher',
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
     * Insert all modules
     */
    // Insert Module Organization management
    const orgManagementModule = await prisma.module.create({
        data: {
            name: 'Organization Management',
            description: '',
            createdBy: sysAdminCreate.id,
            module_action: {
                create: [
                    {
                        name: 'Edit Own Organization',
                        type: 'edit_own_org',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Own Organization',
                        type: 'view_own_org',
                        route: '/dashboard',
                        module_action_role_permission: {
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
                    {
                        name: 'Create Client Organization',
                        type: 'create',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Client Organization',
                        type: 'create_client_org',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Client Organization',
                        type: 'view_client_org',
                        route: '/dashboard',
                        module_action_role_permission: {
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
                    {
                        name: 'Disable Client Organization',
                        type: 'disable_client_org',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Client Organization',
                        type: 'delete_client_org',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                }
                            ]
                        }
                    }
                ]
            }
        },
    });

    // Insert Module Project management
    const projectMangementModule = await prisma.module.create({
        data: {
            name: 'Project Management',
            description: '',
            requiredPurchase: true,
            createdBy: sysAdminCreate.id,
            module_action: {
                create: [
                    {
                        name: 'Create Project',
                        type: 'create_project',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Project',
                        type: 'edit_project',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Project',
                        type: 'view_project',
                        route: '/projects',
                        module_action_role_permission: {
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
                    {
                        name: 'Delete Project',
                        type: 'delete_project',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Create Library',
                        type: 'create_library',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Library',
                        type: 'edit_library',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Library',
                        type: 'view_library',
                        route: '/projects',
                        module_action_role_permission: {
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
                    {
                        name: 'Delete Library',
                        type: 'delete_library',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },

                    {
                        name: 'Create Molecule',
                        type: 'create_molecule',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Molecule',
                        type: 'edit_molecule',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Molecule',
                        type: 'view_molecule',
                        route: '/projects',
                        module_action_role_permission: {
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
                    {
                        name: 'Delete Molecule',
                        type: 'delete_molecule',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Create Molecule Order',
                        type: 'create_molecule_order',
                        route: '/molecule_order',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Molecule Order',
                        type: 'edit_molecule_order',
                        route: '/molecule_order',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Molecule Order',
                        type: 'view_molecule_order',
                        route: '/molecule_order',
                        module_action_role_permission: {
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
                    {
                        name: 'Delete Molecule Order',
                        type: 'delete_molecule_order',
                        route: '/molecule_order',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Submit Molecule Order',
                        type: 'submit_molecule_order',
                        route: '/projects',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                },
                                {
                                    roleId: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                ]
            }
        },
    });

    // Insert Module User management
    const userManagementModule = await prisma.module.create({
        data: {
            name: 'User Management',
            description: '',
            createdBy: sysAdminCreate.id,
            module_action: {
                create: [
                    {
                        name: 'Create User',
                        type: 'create_user',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit User',
                        type: 'edit_user',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Invite User',
                        type: 'invite_user',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Disable User',
                        type: 'disable_user',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                },
                                {
                                    roleId: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View User',
                        type: 'view_user',
                        route: '/dashboard',
                        module_action_role_permission: {
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
                    {
                        name: 'Delete User',
                        type: 'delete_user',
                        route: '/dashboard',
                        module_action_role_permission: {
                            create: [
                                {
                                    roleId: sARoleCreate.id
                                }
                            ]
                        }
                    },
                ]

            }
        }
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
            createdBy: sysAdminCreate.id,
            orgAdminId: sysAdminCreate.id,
            org_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        moduleId: orgManagementModule.id
                    },
                    {
                        moduleId: userManagementModule.id
                    },
                    {
                        moduleId: projectMangementModule.id
                    }
                ]
            }
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
            createdBy: sysAdminCreate.id,
            orgAdminId: orgAdminCreate.id,
            org_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        moduleId: orgManagementModule.id
                    },
                    {
                        moduleId: userManagementModule.id
                    },
                    {
                        moduleId: projectMangementModule.id
                    }
                ]
            }
        }
    });

    // Insert Astra organization
    /* const astraOrgCreate = await prisma.organization.create({
        data:
        {
            name: 'Astra',
            status: 'Enabled',
            type: 'External',
            createdAt: new Date(),
            createdBy: sysAdminCreate.id,
            orgAdminId: orgAdminCreate.id
        }
    }); */

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
            organizationId: fauxbioOrgCreate.id
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