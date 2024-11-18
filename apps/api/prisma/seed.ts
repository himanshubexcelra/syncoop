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
    const sysAdminCreate = await prisma.users.create({
        data: {
            email_id: 'sys_admin@external.milliporesigma.com',
            first_name: 'User System',
            last_name: 'Admin',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
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
    const orgAdminCreate = await prisma.users.create({
        data: {
            email_id: 'org_admin@external.milliporesigma.com',
            first_name: 'User Org',
            last_name: 'Admin',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
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
    await prisma.users.create({
        data: {
            email_id: 'lib_manager@external.milliporesigma.com',
            first_name: 'User Library',
            last_name: 'Manager',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
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
    await prisma.users.create({
        data: {
            email_id: 'protocol_approver@external.milliporesigma.com',
            first_name: 'User Protocol',
            last_name: 'Approver',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
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
    await prisma.users.create({
        data: {
            email_id: 'researcher@external.milliporesigma.com',
            first_name: 'User Researcher',
            last_name: '',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
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
    const orgManagementModule = await prisma.product_module.create({
        data: {
            name: 'Organization Management',
            description: '',
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Edit Own Organization',
                        type: 'edit_own_org',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Own Organization',
                        type: 'view_own_org',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Create Client Organization',
                        type: 'create',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Client Organization',
                        type: 'create_client_org',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Client Organization',
                        type: 'view_client_org',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Disable Client Organization',
                        type: 'disable_client_org',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Client Organization',
                        type: 'delete_client_org',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                }
                            ]
                        }
                    }
                ]
            }
        },
    });

    // Insert Module Project management
    const projectMangementModule = await prisma.product_module.create({
        data: {
            name: 'Project Management',
            description: '',
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Create Project',
                        type: 'create_project',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Project',
                        type: 'edit_project',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Project',
                        type: 'view_project',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Project',
                        type: 'delete_project',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Create Library',
                        type: 'create_library',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Library',
                        type: 'edit_library',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Library',
                        type: 'view_library',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Library',
                        type: 'delete_library',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },

                    {
                        name: 'Create Molecule',
                        type: 'create_molecule',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Molecule',
                        type: 'edit_molecule',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Molecule',
                        type: 'view_molecule',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Molecule',
                        type: 'delete_molecule',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Create Molecule Order',
                        type: 'create_molecule_order',
                        route: '/molecule_order',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Molecule Order',
                        type: 'edit_molecule_order',
                        route: '/molecule_order',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View Molecule Order',
                        type: 'view_molecule_order',
                        route: '/molecule_order',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete Molecule Order',
                        type: 'delete_molecule_order',
                        route: '/molecule_order',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Submit Molecule Order',
                        type: 'submit_molecule_order',
                        route: '/projects',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                }
                            ]
                        }
                    },
                ]
            }
        },
    });

    // Insert Module User management
    const userManagementModule = await prisma.product_module.create({
        data: {
            name: 'User Management',
            description: '',
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Create User',
                        type: 'create_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit User',
                        type: 'edit_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Invite User',
                        type: 'invite_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Disable User',
                        type: 'disable_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'View User',
                        type: 'view_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                                {
                                    role_id: lmRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Delete User',
                        type: 'delete_user',
                        route: '/dashboard',
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
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
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            orgAdminId: sysAdminCreate.id,
            org_product_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        product_module_id: orgManagementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,

                    },
                    {
                        product_module_id: userManagementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                    },
                    {
                        product_module_id: projectMangementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                    }
                ],

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
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            orgAdminId: orgAdminCreate.id,
            org_product_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        product_module_id: orgManagementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                    },
                    {
                        product_module_id: userManagementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
                    },
                    {
                        product_module_id: projectMangementModule.id,
                        created_at: new Date(),
                        created_by: sysAdminCreate.id,
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
            created_at: new Date(),
            created_by: sysAdminCreate.id,
            orgAdminId: orgAdminCreate.id
        }
    }); */

    /**
     * Assign organization id to each user
     */

    // Update organization Id of System Admin
    await prisma.users.update({
        where: { email_id: 'sys_admin@external.milliporesigma.com' },
        data: {
            organization_id: emddOrgCreate.id
        },
    });

    // Update organization Id of Org Admin
    await prisma.users.update({
        where: { email_id: 'org_admin@external.milliporesigma.com' },
        data: {
            organization_id: fauxbioOrgCreate.id
        },
    });

    // Update organization Id of Library Manager
    await prisma.users.update({
        where: { email_id: 'lib_manager@external.milliporesigma.com' },
        data: {
            organization_id: fauxbioOrgCreate.id
        },
    });

    // Update organization Id of Researcher
    await prisma.users.update({
        where: { email_id: 'researcher@external.milliporesigma.com' },
        data: {
            organization_id: emddOrgCreate.id
        },
    });

    // Update organization Id of Protocol Approver
    await prisma.users.update({
        where: { email_id: 'protocol_approver@external.milliporesigma.com' },
        data: {
            organization_id: fauxbioOrgCreate.id
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