import prisma from "@/lib/prisma";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { EMAIL_ALREADY_EXIST, } = MESSAGES;
const { SUCCESS, CONFLICT, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const joins = searchParams.get('with');
        const query: any = {};

        if (joins && joins.length) {
            query.include = {};
            if (joins.includes('orgUser')) {
                query.include = {
                    ...query.include,
                    orgUser: {
                        select: {
                            id: true,
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
        const { firstName, lastName, roles, password, email, organization } = req
        const existingUser = await prisma.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return new Response(JSON.stringify(EMAIL_ALREADY_EXIST), {
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