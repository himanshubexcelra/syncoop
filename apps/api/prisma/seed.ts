import prisma from "@/lib/prisma";
import {
    MoleculeOrderStatusCode,
    MoleculeOrderStatusLabel,
    MoleculeStatusCode,
    MoleculeStatusLabel
} from "@/utils/definition";
import { getUTCTime } from "@/utils/helper";

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
            priority: 1,
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
        },
    });

    // Insert Organization Admin Role
    const oARoleCreate = await prisma.role.create({
        data: {
            type: 'org_admin',
            name: 'Organization Admin',
            definition: '',
            priority: 2,
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
        },
    });

    // Insert Library Manger Role
    const lmRoleCreate = await prisma.role.create({
        data: {
            type: 'library_manager',
            name: 'Library Manager',
            definition: '',
            priority: 3,
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
        },
    });

    // Insert Researcher Role
    const resRoleCreate = await prisma.role.create({
        data: {
            type: 'researcher',
            name: 'Researcher',
            definition: '',
            priority: 4,
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
        },
    });

    // Insert Protocol Approver Role
    const paRoleCreate = await prisma.role.create({
        data: {
            type: 'protocol_approver',
            name: 'Protocol Approver',
            definition: '',
            priority: 5,
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
        }
    });

    /**
     * Insert all users
     */

    // Insert User System Admin
    const sysAdminCreate = await prisma.users.create({
        data: {
            email_id: 'sys_admin@external.milliporesigma.com',
            first_name: 'System',
            last_name: 'Admin',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            user_role: {
                create: {
                    role: {
                        connect: sARoleCreate,
                    },
                    created_at: getUTCTime(new Date().toISOString()),
                },
            }
        },
    });

    // Insert Organization Admin
    const orgAdminCreate = await prisma.users.create({
        data: {
            email_id: 'org_admin@external.milliporesigma.com',
            first_name: 'Org',
            last_name: 'Admin',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            user_role: {
                create: {
                    role: {
                        connect: oARoleCreate,
                    },
                    created_at: getUTCTime(new Date().toISOString()),
                }
            }
        },
    });

    // Insert Library Manager
    await prisma.users.create({
        data: {
            email_id: 'lib_manager@external.milliporesigma.com',
            first_name: 'Library',
            last_name: 'Manager',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            user_role: {
                create: {
                    role: {
                        connect: lmRoleCreate
                    },
                    created_at: getUTCTime(new Date().toISOString()),
                }
            }
        },
    });

    // Insert Protocol Approver
    await prisma.users.create({
        data: {
            email_id: 'protocol_approver@external.milliporesigma.com',
            first_name: 'Protocol',
            last_name: 'Approver',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            user_role: {
                create: {
                    role: {
                        connect: paRoleCreate
                    },
                    created_at: getUTCTime(new Date().toISOString()),
                }
            }
        },
    });

    // Insert Researcher
    await prisma.users.create({
        data: {
            email_id: 'researcher@external.milliporesigma.com',
            first_name: 'Researcher',
            last_name: '',
            password_hash: '$2b$10$z8A02N6GcgfTZ./k4rge/.skIEZToeUW6ADhCz95A66BlT/PtV1Mm',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            user_role: {
                create: {
                    role: {
                        connect: resRoleCreate
                    },
                    created_at: getUTCTime(new Date().toISOString()),
                }
            }
            /* user_role: {
                create: {
                    role: {
                        connect: resRoleCreate
                    }
                }
            } */
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
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Edit Own Organization',
                        type: 'edit_own_org',
                        route: '/projects',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        type: 'create_client_org',
                        route: '/dashboard',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        type: 'edit_client_org',
                        route: '/dashboard',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Create Project',
                        type: 'create_project',
                        route: '/projects',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Create User',
                        type: 'create_user',
                        route: '/dashboard',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
                        created_at: getUTCTime(new Date().toISOString()),
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
    // Insert Module Pathway Viewer
    const pathwayViewerModule = await prisma.product_module.create({
        data: {
            name: 'Pathway Viewer',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'View Pathways',
                        type: 'view_pathways',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        name: 'View Reactions',
                        type: 'view_reactions',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                ]
            }
        },
    });
    // Insert Module Retrosynthesis
    const retrosynthesisModule = await prisma.product_module.create({
        data: {
            name: 'Retrosynthesis',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Generate Pathway',
                        type: 'generate_pathway',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Edit Reactions',
                        type: 'edit_reactions',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                                {
                                    role_id: resRoleCreate.id
                                }
                            ]
                        }
                    },
                    {
                        name: 'Validate Pathway',
                        type: 'validate_pathway',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Create/Modify/Submit Synthesis Lab Job',
                        type: 'create_modify_submit_synthesis_lab_job',
                        route: '/molecule_order',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });

    //Insert Module Data Management
    const dataManagementModule = await prisma.product_module.create({
        data: {
            name: 'Data Management',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'View experimental data',
                        type: 'view_experimental_data',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: resRoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });
    //Insert Module Inventory Management
    const inventoryManagementModule = await prisma.product_module.create({
        data: {
            name: 'Inventory Management',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'View Reaction templates',
                        type: 'view_reaction_templates',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: resRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'View Reaction Conditions',
                        type: 'view_reaction_conditions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: resRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'View Reaction Inventory',
                        type: 'view_reaction_inventory',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: resRoleCreate.id
                                },
                                {
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });
    //Insert Module Instrument Management
    const instrumentManagementModule = await prisma.product_module.create({
        data: {
            name: 'Instrument Management',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'Create Reaction templates',
                        type: 'create_reaction_templates',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Add Reaction Conditions',
                        type: 'add_reaction_conditions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Update Inventory',
                        type: 'update_inventory',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                                    role_id: paRoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });
    //Insert Module Bioassays
    const bioAssaysModule = await prisma.product_module.create({
        data: {
            name: 'Bioassays',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'View Functional Assays',
                        type: 'view_functional_assays',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        name: 'Validate Functional Assay',
                        type: 'validate_functional_assay',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Add Functional Assay to system',
                        type: 'add_functional_assay_to_system',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });

    //Insert Module Roles & Modules Management
    const rolesModulesManagementModule = await prisma.product_module.create({
        data: {
            name: 'Roles Modules Management',
            description: '',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            product_module_action: {
                create: [
                    {
                        name: 'View Role Definitions',
                        type: 'view_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
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
                        name: 'View Module Definitions',
                        type: 'view_module_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Create System Role Definitions',
                        type: 'create_system_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Edit System Role Definitions',
                        type: 'edit_system_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Create System Module Definitions',
                        type: 'create_system_module_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Edit System Module Definitions',
                        type: 'edit_system_module_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Create Custom Org Specific Role Definitions',
                        type: 'create_custom_org_specific_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Edit Custom Org Specific Role Definitions',
                        type: 'edit_custom_org_specific_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                            ]
                        }
                    },
                    {
                        name: 'Delete Custom Org Specific Role Definitions',
                        type: 'delete_custom_org_specific_role_definitions',
                        route: '',
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        product_module_action_role_permission: {
                            create: [
                                {
                                    role_id: sARoleCreate.id
                                },
                                {
                                    role_id: oARoleCreate.id
                                },
                            ]
                        }
                    },
                ]
            }
        },
    });
    /**
     * Insert all organizations
     */

    // Insert EMD DD organization
    const emddOrgCreate = await prisma.container.create({
        data:
        {
            name: 'EMD DD',
            is_active: true,
            type: 'O',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            owner_id: sysAdminCreate.id,
            org_product_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        product_module_id: orgManagementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true

                    },
                    {
                        product_module_id: userManagementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: projectMangementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: pathwayViewerModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: retrosynthesisModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    }
                ],

            }
        }
    });

    // Insert Fauxbio organization
    const fauxbioOrgCreate = await prisma.container.create({
        data:
        {
            name: 'Fauxbio',
            is_active: true,
            type: 'CO',
            parent_id: emddOrgCreate.id,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            owner_id: orgAdminCreate.id,
            org_product_module: {
                create: [ // Fauxbio purchased Project Management Module
                    {
                        product_module_id: orgManagementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: userManagementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: projectMangementModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: pathwayViewerModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    },
                    {
                        product_module_id: retrosynthesisModule.id,
                        created_at: getUTCTime(new Date().toISOString()),
                        created_by: sysAdminCreate.id,
                        is_active: true
                    }
                ]
            }
        }
    });

    // Insert Astra organization
    /* const astraOrgCreate = await prisma.container.create({
        data:
        {
            name: 'Astra',
            status: 'Enabled',
            type: 'External',
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,
            owner_id: orgAdminCreate.id
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
            organization_id: emddOrgCreate.id
        },
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.New),
            status_name: MoleculeStatusLabel.New,
            status_description: 'User creates/imports molecule',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id
        }
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.NewInCart),
            status_name: MoleculeStatusLabel.NewInCart,
            status_description: 'User adds molecule to Molecule Order',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,

        }
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.Ordered),
            status_name: MoleculeStatusLabel.Ordered,
            status_description: 'User submits Molecule Order',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,


        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.InRetroQueue),
            status_name: MoleculeStatusLabel.InRetroQueue,
            status_description: 'User sends molecule to retrosynthesis',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,

        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.Failed),
            status_name: MoleculeStatusLabel.Failed,
            status_description: 'System fails to return synthesis prediction for molecule or Automation lab result fails',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,


        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.Ready),
            status_name: MoleculeStatusLabel.Ready,
            status_description: 'System returns synthesis prediction for molecule',
            is_active: true,
            created_by: sysAdminCreate.id,
            created_at: getUTCTime(new Date().toISOString()),

        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.InReview),
            status_name: MoleculeStatusLabel.InReview,
            status_description: 'Researcheer selects and tunes a pathway',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,


        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.Validated),
            status_name: MoleculeStatusLabel.Validated,
            status_description: 'Revalidation with replacement pathway or conditions',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,


        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.ValidatedInCart),
            status_name: MoleculeStatusLabel.ValidatedInCart,
            status_description: 'User re-adds to cart',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,

        },
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.InProgress),
            status_name: MoleculeStatusLabel.InProgress,
            status_description: 'Automation lab job executes',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,

        },
    });
    await prisma.status_code.create({
        data: {
            table_name: 'molecule',
            column_name: 'status',
            status_code: String(MoleculeStatusCode.Done),
            status_name: MoleculeStatusLabel.Done,
            status_description: 'Automation lab job process completed',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id,

        },
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule_order',
            column_name: 'status',
            status_code: String(MoleculeOrderStatusCode.InProgress),
            status_name: MoleculeOrderStatusLabel.InProgress,
            status_description: 'Order created',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id
        }
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule_order',
            column_name: 'status',
            status_code: String(MoleculeOrderStatusCode.Failed),
            status_name: MoleculeOrderStatusLabel.Completed,
            status_description: 'Order completed',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id
        }
    });

    await prisma.status_code.create({
        data: {
            table_name: 'molecule_order',
            column_name: 'status',
            status_code: String(MoleculeOrderStatusCode.Failed),
            status_name: MoleculeOrderStatusLabel.Failed,
            status_description: 'Order failed',
            is_active: true,
            created_at: getUTCTime(new Date().toISOString()),
            created_by: sysAdminCreate.id
        }
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