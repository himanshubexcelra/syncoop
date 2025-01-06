/*eslint max-len: ["error", { "code": 100 }]*/
import prisma from "@/lib/prisma";
import { json } from "@/utils/helper";
import { STATUS_TYPE, MESSAGES } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;
const { NOTFOUND, REQUIRED } = MESSAGES

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const name = url.searchParams.get("name");

        if (!name) {
            return new Response(JSON.stringify({ error: REQUIRED("name parameter") }), {
                headers: { "Content-Type": "application/json" },
                status: BAD_REQUEST,
            });
        }

        const data = await prisma.reaction_template_master.findFirst({
            where: { name: name },
        });

        if (!data) {
            return new Response(JSON.stringify({ error: NOTFOUND('template') }), {
                headers: { "Content-Type": "application/json" },
                status: BAD_REQUEST,
            });
        }

        return new Response(json(data), {
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