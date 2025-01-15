import prisma from "@/lib/prisma";
import { ContainerType } from "@/utils/definition";
import { json } from "@/utils/helper";
import { STATUS_TYPE } from "@/utils/message";

const { SUCCESS, BAD_REQUEST } = STATUS_TYPE;

export async function GET(request: Request) {
    try {

        const url = new URL(request.url);
        const searchParams = new URLSearchParams(url.searchParams);
        const org_id = searchParams.get('orgId');

        const moleculeQuery: any = {
            by: ['status'],
            _count: true,
            where: {
                ...(() => {
                    if (org_id) {

                        return {
                            organization_id: org_id
                        }
                    }
                })()
            }
        };
        const molecule_status_count = await prisma.molecule.groupBy(moleculeQuery);

        const projectQuery: any = {
            where: {
                type: ContainerType.PROJECT,
                ...(() => {
                    if (org_id) {
                        return {
                            parent_id: org_id
                        }
                    }
                })()
            }
        };

        const projectCount = await prisma.container.count(projectQuery);

        const libraryQuery: any = {
            where: {
                type: ContainerType.LIBRARY
            },
        };
        if (org_id) {
            libraryQuery.where = {
                ...libraryQuery.where,
                container: {
                    type: ContainerType.PROJECT,
                    parent_id: org_id
                }
            }
        }
        const libraryCount = await prisma.container.count(libraryQuery);

        return new Response(json(
            {
                molecule_status_count,
                projectCount,
                libraryCount,
                moleculeCount: molecule_status_count.reduce((acc: any, num: any) => {
                    return num._count + acc
                }, 0)
            }), {
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
