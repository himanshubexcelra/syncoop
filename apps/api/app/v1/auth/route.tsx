import prisma from "@/lib/prisma";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import bcrypt from "bcrypt";
export async function POST(request: Request) {
  try {
    const req = await request.json();
    const user = await prisma.user.findFirst({
      /* relationLoadStrategy: 'join', // or 'query' */
      select: {
        firstName: true,
        lastName: true,
        email: true,
        organizationId: true,
        id: true,
        password: true,
        user_role: {
          orderBy: {
            role: {
              priority: 'asc',
            },
          },
          select: {
            role: {
              select: {
                id: true,
                user_role: {
                    orderBy: {
                        role: {
                            priority: 'asc',
                        },
                    },
                    select: {
                        role: {
                            select: {
                                id: true,
                                type: true,
                                priority: true,
                                module_permission: {
                                    select: {
                                        module: true
                                    }
                                },
                                /* module_action_role_permission: {
                                    select: {
                                        module_action: true
                                    }
                                } */
                            }
                        }
                    },
                    take: 1,
                },
                module_action_role_permission: {
                  select: {
                    module_action: true
                  }
                }
              }
            }
          },
          take: 1,
        },
        orgUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      where: {
        email: req.email,
      },
    });
    const isMatch = await bcrypt.compare(req.password, `${user?.password}`);
    if (user && isMatch) {
      return new Response(JSON.stringify({
        success: true,
        data: user
      }), {
        status: STATUS_TYPE.SUCCESS,
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        errorMessage: MESSAGES.INVALID_LOGIN_CREDENTIALS
      }), {
        status: STATUS_TYPE.NOT_FOUND,
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      errorMessage: `Webhook error: ${error}`
    }), {
      status: STATUS_TYPE.BAD_REQUEST,
    })
  }
}