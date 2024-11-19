/* eslint max-len: ["error", { "code": 100 }] */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionData = request.cookies.get('session')?.value;

    // Add a new header x-current-path which passes the path to downstream components
    /* const headers = new Headers(request.headers);
    headers.set("x-current-path", request.nextUrl.pathname); */
    if (sessionData) {
        const userData = JSON.parse(sessionData);
        //  redirect route based on the user role type
        let route = '/dashboard';
        if (['admin', 'org_admin'].some((role) => userData?.myRoles?.includes(role))) {
            route = '/dashboard';
        } else if (['researcher', 'protocol_approver'].some((role) =>
            userData?.myRoles?.includes(role))
        ) {
            route = '/molecule_order';
        } else if (['library_manager'].some((role) => userData?.myRoles?.includes(role))) {
            route = '/projects';
        }
        const routesEnabled = request.cookies.get('routes_enabled')?.value;
        if (routesEnabled) {
            const routes = JSON.parse(routesEnabled);
            const isRouteFound = routes.some((route: string) =>
                request.nextUrl.pathname.includes(route));
            if (isRouteFound) {
                return NextResponse.next(/* { headers } */);
            } /* else if (request.nextUrl.pathname === '/') {
                    return NextResponse.redirect(new URL('/dashboard',
                     process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
                } else {
                    return NextResponse.error();
                } */
            return NextResponse.redirect(new URL(route, process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
        } else {
            return NextResponse.error();
        }
        //} else if (request.nextUrl.pathname === '/') {
        //return NextResponse.redirect(new URL('/dashboard',
        //  process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
        //}
        return NextResponse.next();
    }
    if (!sessionData) {
        if (request.nextUrl.pathname === '/') {
            return NextResponse.next();
        } else {
            return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
        }
    }
}




export const config = {
    matcher: ['/((?!api|icons|images|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}