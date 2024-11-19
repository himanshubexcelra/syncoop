import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { MESSAGES, STATUS_TYPE } from "@/utils/message";
import json from "@/utils/helper";

export async function POST(request: Request) {
  try {
    const req = await request.json();
    const user = await prisma.users.findFirst({
      /* relationLoadStrategy: 'join', // or 'query' */
      select: {
        first_name: true,
        last_name: true,
        email_id: true,
        organization_id: true,
        id: true,
        password_hash: true,
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
            type: true,
            /* org_product_module: {
              include: {
                product_module: {
                  include: {
                    product_module_action: {
                      include: {
                        product_module_action_role_permission: {
                          where: { role_id:  16}
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
        email_id: req.email_id,
      },
    });

    if (user) {
      const isMatch = await bcrypt.compare(req.password_hash, `${user.password_hash}`);
      if (isMatch) {
        return new Response(json({
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