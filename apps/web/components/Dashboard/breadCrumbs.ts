import { BreadCrumbsObj } from "@/lib/definition";

export const getDashBoardBreadCrumbs = (
    myRoles: string[],
    orgDetailLoggedIn: { name: string } | null,
    isCustomerOrg: boolean,
): BreadCrumbsObj[] => {
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        {
            label: `Admin: EMDD`,
            svgPath: "/icons/admin-inactive-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
            isActive: (myRoles.includes("admin") && !isCustomerOrg) ? true : false,
        },
        ...((!myRoles.includes("admin") || isCustomerOrg) && orgDetailLoggedIn
            ? [{
                label: orgDetailLoggedIn.name,
                svgPath: "/icons/organization.svg",
                svgWidth: 16,
                svgHeight: 16,
                href: "/",
                isActive: true,
            }]
            : []),
    ];

}