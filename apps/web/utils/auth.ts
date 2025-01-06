'use server'

import { cookies } from "next/headers";
import { Messages } from "./message";
import { getUserModulePermissions } from "@/components/User/service";
import { defaultRoutesEnabled } from "./constants";

export async function authorize(formData: FormData) {
    try {
        const body = JSON.stringify({
            email_id: formData.get('email_id'),
            password_hash: formData.get('password_hash')
        });
        const response: any = await fetch(`${process.env.NEXT_API_HOST_URL}/v1/auth`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body
        });
        if (response.status === 200) {
            const output = await response.json();
            const {
                id,
                first_name,
                last_name,
                email_id,
                organization_id,
                user_role,
                orgUser
            } = output.data;

            const roles = user_role.map(({ role }: any) => role);
            const userData = {
                id,
                first_name,
                last_name,
                email_id,
                roles,
                myRoles: roles.map((role: any) => role.type),
                organization_id,
                orgUser
            };
            const sessionData = JSON.stringify(userData);
            const cookie = cookies();

            const getModulePermissions = await getUserModulePermissions(userData);
            const { data } = getModulePermissions;
            let enabledRoutes: string[] = defaultRoutesEnabled;
            let enabledActions: string[] = [];
            data.org_product_module.forEach((elem: any) => {
                const { product_module_action } = elem.product_module;
                const allActions: string[] =
                    Array.from(new Set(product_module_action.map((action: any) => action.route)));
                enabledRoutes = [
                    ...enabledRoutes,
                    ...allActions
                ];

                enabledActions = [
                    ...enabledActions,
                    ...product_module_action.map((action: any) => action.type)
                ]
            });
            enabledRoutes = Array.from(new Set(enabledRoutes));
            cookie.set('session', sessionData, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // One week
                path: '/',
            });
            cookie.set('routes_enabled', JSON.stringify(enabledRoutes), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // One week
                path: '/',
            });
            cookie.set('actions_enabled', JSON.stringify(enabledActions), {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // One week
                path: '/',
            });
            return output;
        } else if (response.status === 404) {
            const output = await response.json();
            return output;
        }
        throw new Error(Messages.SOMETHING_WENT_WRONG);
    }
    catch (error) {
        return error;
    }
}

export async function clearSession() {
    cookies().delete('session');
    cookies().delete('actions_enabled');
    cookies().delete('routes_enabled');
}

export async function getUserData() {
    const sessionData: any = cookies().get('session')?.value;
    const actionsEnabled: any = cookies().get('actions_enabled')?.value;
    const routesEnabled: any = cookies().get('routes_enabled')?.value;
    if (sessionData) {
        return {
            'userData': JSON.parse(sessionData),
            'actionsEnabled': JSON.parse(actionsEnabled),
            'routesEnabled': JSON.parse(routesEnabled),
        }
    }
    return null;
}