import prisma from "@/lib/prisma";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";
import bcrypt from "bcrypt";
import { SALT_ROUNDS } from "@/utils/constants";
import { getUTCTime, json } from "@/utils/helper";
import { ContainerType } from "@/utils/definition";

const { EMAIL_ALREADY_EXIST, NOTFOUND } = MESSAGES;
const { SUCCESS, CONFLICT, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const joins = searchParams.get('with');
        const user_id = searchParams.get('id');
        const orgId = searchParams.get('orgId');
        const orgType = searchParams.get('orgType');
        const query: any = {};

        if (joins && joins.length) {
            query.include = {};
            if (joins.includes('orgUser')) {
                query.include = {
                    ...query.include,
                    orgUser: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    }
                }
            }
            if (joins.includes('user_role')) {
                query.include = {
                    ...query.include,
                    user_role: {
                        select: {
                            id: true,
                            role_id: true,
                            role: {
                                select: {
                                    name: true,
                                    type: true,
                                },
                            },
                        },
                    },
                }
            }
            if (joins.includes('projects')) {
                query.include = {
                    ...query.include,
                    owner: {
                        select: {
                            id: true,
                            name: true,
                        },
                        where: {
                            type: {
                                in: [
                                    ContainerType.LIBRARY,
                                    ContainerType.PROJECT
                                ]
                            }
                        }
                    },
                }
            }
        }
        if (user_id) {
            query.where = {
                id: Number(user_id),
            };
        }
        if (orgId) {
            query.where = {
                ...query.where,
                organization_id: Number(orgId),
            };
        }
        if (orgType) {
            query.where = {
                ...query.where,
                orgUser: {
                    type: orgType
                }
            };
        }

        const users = await prisma.users.findMany(query);

        return new Response(json(users), {
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
    try {
        const req = await request.json();
        const { first_name, last_name, roles, email_id, organization } = req
        const existingUser = await prisma.users.findUnique({
            where: { email_id: email_id },
        });
        const password_hash = await bcrypt.hash(req.password_hash, SALT_ROUNDS);
        if (existingUser) {
            return new Response(JSON.stringify({ error: EMAIL_ALREADY_EXIST }), {
                headers: { "Content-Type": "application/json" },
                status: CONFLICT,
            });
        }
        const newUser = await prisma.users.create({
            data: {
                first_name,
                last_name,
                email_id,
                password_hash,
                is_active: true,
                organization_id: organization,
                created_at: getUTCTime(new Date().toISOString()),
                user_role: {
                    create: roles.map((role_id: number) => ({
                        role: {
                            connect: {
                                id: role_id
                            }
                        },
                        created_at: getUTCTime(new Date().toISOString()),
                    })),

                },
            },
            include: {
                user_role: {
                    select: {
                        role_id: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return new Response(json(newUser), {
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

export async function PUT(request: Request) {
    try {
        const req = await request.json();
        const { email_id, first_name, last_name, is_active, primary_contact_id,
            oldPassword, newPassword, organization, roles } = req;

        const existingUser = await prisma.users.findUnique({
            where: { email_id: email_id },
        });

        if (!existingUser) {
            return new Response(
                JSON.stringify({ error: MESSAGES.USER_NOT_FOUND }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: STATUS_TYPE.NOT_FOUND,
                }
            );
        }

        if (oldPassword && newPassword) {
            const dbPassword = existingUser?.password_hash || ''
            const isPasswordValid = await bcrypt.compare(oldPassword, dbPassword);
            if (!isPasswordValid) {
                return new Response(
                    JSON.stringify(
                        { error: MESSAGES.INVALID_LOGIN_CREDENTIALS }),
                    {
                        headers: { "Content-Type": "application/json" },
                        status: STATUS_TYPE.UNAUTORIZED,
                    }
                );
            }
        }
        const updatedData: any = {};

        if (first_name) {
            updatedData.first_name = first_name;
        }

        if (last_name) {
            updatedData.last_name = last_name;
        }

        if (newPassword) {
            updatedData.password_hash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        }
        if (organization) {
            updatedData.organization_id = organization;
        }
        if (is_active !== undefined) {
            updatedData.is_active = is_active;
            if (is_active === true) {
                updatedData.primary_contact_id = null;
            } else if (is_active === false) {
                if (!!primary_contact_id) {
                    const primaryContact = await prisma.users.findUnique({
                        where: { id: primary_contact_id }
                    });

                    if (!primaryContact) {
                        return new Response(
                            JSON.stringify({ error: NOTFOUND('Primary Contact') }),
                            {
                                headers: { "Content-Type": "application/json" },
                                status: STATUS_TYPE.NOT_FOUND,
                            }
                        );
                    } else {
                        updatedData.primary_contact_id = primary_contact_id;

                        await prisma.container.updateMany({
                            where: {
                                owner_id: existingUser.id,
                                type: {
                                    in: [
                                        ContainerType.LIBRARY,
                                        ContainerType.PROJECT
                                    ]
                                }
                            },
                            data: { owner_id: primaryContact.id }
                        });
                    }
                }
            }
        }
        if (roles && Array.isArray(roles)) {
            await prisma.user_role.deleteMany({
                where: { user_id: existingUser.id },
            });

            const userRolesData = roles.map((role_id: number) => ({
                user_id: existingUser.id,
                role_id: role_id,
                created_at: getUTCTime(new Date().toISOString()),
            }));

            await prisma.user_role.createMany({
                data: userRolesData,
            });
        }
        const updatedUser = await prisma.users.update({
            where: { email_id: email_id },
            data: updatedData,
            include: {
                user_role: {
                    select: {
                        role_id: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return new Response(json(updatedUser), {
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

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const user_id = searchParams.get('user_id');
        const role_id = searchParams.get('role_id');
        await prisma.user_role.delete({
            where: { id: Number(role_id) },
        });
        const result = await prisma.users.delete({
            where: { id: Number(user_id) },
        });
        return new Response(json(result), {
            headers: { "Content-Type": "application/json" },
            status: SUCCESS,
        });
    } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { "Content-Type": "application/json" },
            status: BAD_REQUEST, // BAD_REQUEST
        });
    }
}