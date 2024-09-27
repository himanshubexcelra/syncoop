import prisma from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const req = await request.json();
        const user = await prisma.user.findFirst({
            /* relationLoadStrategy: 'join', // or 'query' */
            include: {
                user_role: {
                    select: {
                        role: {
                            select: {
                                type: true
                            }
                        }
                    }
                },
            },
            where: {
                email: req.email,
                password: req.password
            },
        } as any);
        if (user) {
            return new Response(JSON.stringify({
                success: true,
                data: user
            }), {
                status: 200,
            });
        } else {
            return new Response(JSON.stringify({
                success: false,
                errorMessage: "User does not exist."
            }), {
                status: 404,
            });
        }
    } catch (error: any) {
        return new Response(`Webhook error: ${error?.message || error}`, {
            status: 400,
        })
    }
}