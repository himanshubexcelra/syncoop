import { BreadCrumbsObj, OrganizationDataFields } from "@/lib/definition";
import { isAdmin } from "@/utils/helpers";

export const getProjectBreadCrumbs = (
    orgInfo: OrganizationDataFields[],
    roles: string[],
    organizationId?: number,
): BreadCrumbsObj[] => {
    const admin = isAdmin(roles);
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
            isActive: !admin ? true : false
        },
        ...(organizationId
            ? [{
                label: orgInfo[0]?.name || '',
                svgPath: "/icons/org-icon-inactive.svg",
                svgWidth: 16,
                svgHeight: 16,
                href: `/organization/${organizationId}`,
                isActive: false,
            }]
            : []),
        ...(admin
            ? [{
                label: 'Projects',
                svgPath: '/icons/project-icon.svg',
                svgWidth: 16,
                svgHeight: 16,
                href: organizationId
                    ? `/organization/${organizationId}/projects/`
                    : '/projects',
                isActive: true
            }] : []),
    ];
}