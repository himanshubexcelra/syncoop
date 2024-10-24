import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";

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
          select: {
            role: {
              select: {
                id: true,
                type: true,
                /* priority: true, */
              }
            }
          },
        },
        orgUser: {
          select: {
            id: true,
            name: true,
            /* org_module: {
              include: {
                module: {
                  include: {
                    module_action: {
                      include: {
                        module_action_role_permission: {
                          where: { roleId:  16}
                        }
                      }
                    }
                  }
                }
              }
            } */
          }
        }
      },
      where: {
        email: req.email,
      },
    });

    if (user) {
      const isMatch = await bcrypt.compare(req.password, `${user.password}`);
      if (isMatch) {
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