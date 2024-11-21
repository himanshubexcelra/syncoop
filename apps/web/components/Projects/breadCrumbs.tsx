import { BreadCrumbsObj, OrganizationDataFields } from "@/lib/definition";

export const getProjectBreadCrumbs = (
    orgInfo: OrganizationDataFields[],
    organizationId?: number,
): BreadCrumbsObj[] => {
    return [
        {
            label: "Home",
            svgPath: "/icons/home-icon.svg",
            svgWidth: 16,
            svgHeight: 16,
            href: "/",
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
        {
            label: 'Projects',
            svgPath: '/icons/project-icon.svg',
            svgWidth: 16,
            svgHeight: 16,
            href: organizationId
                ? `/organization/${organizationId}/projects/`
                : '/projects',
            isActive: true
        }
    ];
}