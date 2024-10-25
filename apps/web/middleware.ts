import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const sessionData = request.cookies.get('session')?.value;

    // Add a new header x-current-path which passes the path to downstream components
    /* const headers = new Headers(request.headers);
    headers.set("x-current-path", request.nextUrl.pathname); */
    if (sessionData) {
        // const userData = JSON.parse(sessionData);
        // const { roles } = userData;
        //const isAdmin = roles.some((role: { id: number, type: string }) => role.type === 'admin');
        //if (!isAdmin) { // If logged in user is not admin
            const routesEnabled = request.cookies.get('routes_enabled')?.value;
            if (routesEnabled) {
                const routes = JSON.parse(routesEnabled);
                const isRouteFound = routes.some((route: string) =>
                    request.nextUrl.pathname.includes(route));
                if (isRouteFound) {
                    return NextResponse.next(/* { headers } */);
                } /* else if (request.nextUrl.pathname === '/') {
                    return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
                } else {
                    return NextResponse.error();
                } */
                return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
            } else {
                return NextResponse.error();
            }
        //} else if (request.nextUrl.pathname === '/') {
            //return NextResponse.redirect(new URL('/dashboard', process.env.NEXT_PUBLIC_UI_APP_HOST_URL));
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