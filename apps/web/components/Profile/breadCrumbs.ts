import { BreadCrumbsObj } from "@/lib/definition";

export const getProfileBreadCrumbs = (
    isMyProfile: boolean,
    myRoles: string[],
    orgDetailLoggedIn: { name: string } | null
): BreadCrumbsObj[] => {
    return [
        {
            label: 'Home',
            svgPath: '/icons/home-icon.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: '/'
        },
        ...(isMyProfile
            ? [
                {
                    label: 'Profile',
                    svgPath: '/icons/profile-icon-sm-active.svg',
                    svgWidth: 16,
                    svgHeight: 16,
                    href: '/profile',
                    isActive: true
                }
            ]
            : [
                {
                    label: `${['admin', 'org_admin'].some((role) => myRoles?.includes(role)) ? 'Admin: ' : ''}${orgDetailLoggedIn?.name ?? ''}`,
                    svgPath: "/icons/admin-inactive-icon.svg",
                    svgWidth: 16,
                    svgHeight: 16,
                    href: "/dashboard",
                },
                {
                    label: 'Profile',
                    svgPath: '/icons/profile-icon-sm-active.svg',
                    svgWidth: 16,
                    svgHeight: 16,
                    href: '/profile',
                    isActive: true
                }
            ]
        )
    ];
};