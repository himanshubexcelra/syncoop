import prisma from "@/lib/prisma";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";
import bcrypt from "bcrypt";

const { EMAIL_ALREADY_EXIST, } = MESSAGES;
const { SUCCESS, CONFLICT, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const joins = searchParams.get('with');
        const userId = searchParams.get('id');

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
                        },
                    }
                }
            }
            if (joins.includes('user_role')) {
                query.include = {
                    ...query.include,
                    user_role: {
                        select: {
                            roleId: true,
                            role: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                }
            }
        }
        if (userId) {
            query.where = {
                id: Number(userId),
            };
        }

        const users = await prisma.user.findMany(query);

        return new Response(JSON.stringify(users), {
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
        const { firstName, lastName, roles, email, organization } = req
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });
        const saltRounds = 10;
        const password = await bcrypt.hash(req.password, saltRounds);
        if (existingUser) {
            return new Response(JSON.stringify({ error: EMAIL_ALREADY_EXIST }), {
                headers: { "Content-Type": "application/json" },
                status: CONFLICT,
            });
        }
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password,
                status: 'Enabled',
                organizationId: organization,
                user_role: {
                    create: roles.map((roleId: number) => ({
                        role: { connect: { id: roleId } }
                    })),
                },
            },
            include: {
                user_role: {
                    select: {
                        roleId: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        return new Response(JSON.stringify(newUser), {
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
        const { email, firstName, lastName,
            oldPassword, newPassword, organization, roles } = req;

        const existingUser = await prisma.user.findUnique({
            where: { email: email },
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
            const dbPassword = existingUser?.password || ''
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

        if (firstName) {
            updatedData.firstName = firstName;
        }

        if (lastName) {
            updatedData.lastName = lastName;
        }

        if (newPassword) {
            const saltRounds = 10;
            updatedData.password = await bcrypt.hash(newPassword, saltRounds);
        }
        if (organization) {
            updatedData.organizationId = organization;
        }
        if (roles && Array.isArray(roles)) {
            await prisma.user_role.deleteMany({
                where: { userId: existingUser.id },
            });

            const userRolesData = roles.map((roleId: number) => ({
                userId: existingUser.id,
                roleId: roleId,
            }));

            await prisma.user_role.createMany({
                data: userRolesData,
            });
        }
        const updatedUser = await prisma.user.update({
            where: { email: email },
            data: updatedData,
            include: {
                user_role: {
                    select: {
                        roleId: true,
                        role: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return new Response(JSON.stringify(updatedUser), {
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