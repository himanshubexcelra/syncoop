import { BreadCrumbsObj } from "@/lib/definition";

export const getDashBoardBreadCrumbs = (
    myRoles: string[],
    orgDetailLoggedIn: { name: string } | null,
    customerOrgId?: number,
): BreadCrumbsObj[] => {
    const admin = myRoles.includes("admin")
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
        },
        ...((admin) ?
            [{
                label: `Admin: EMDD`,
                svgPath: (!customerOrgId)
                    ? "/icons/admin-icon.svg"
                    : "/icons/admin-inactive-icon.svg",
                svgWidth: 16,
                svgHeight: 16,
                href: "/",
                isActive: !customerOrgId
            }] : []),
        ...((!admin || customerOrgId) && orgDetailLoggedIn
            ? [{
                label: customerOrgId
                    ? orgDetailLoggedIn.name
                    : `Admin: ${orgDetailLoggedIn.name}`,
                svgPath: "/icons/organization.svg",
                svgWidth: 16,
                svgHeight: 16,
                href: "/",
                isActive: true,
            }]
            : []),
    ];

}