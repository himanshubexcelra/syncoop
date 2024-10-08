import styles from "./page.module.css";
import Image from "next/image";
import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import Layout from "@/components/layout";
import UsersTable from "@/components/User/UsersTable";
import { getUsers } from "@/components/User/service";
import { getLowPriorityRole } from "@/components/Role/service";
import ListOrganization from "@/components/Organization/ListOrganization";
import { getUserData } from "@/utils/auth";
import { OrganizationDataFields } from "@/lib/definition";
import Heading from "@/components/Heading/Heading";
import { getOrganization } from "@/components/Organization/service";
import Tabs from "@/ui/Tab/Tabs";
import { countCardsDetails, dataSource, featuresLeft, featuresRight, filterOrganizationList, filterUsersByOrgId, stats } from "@/utils/helpers";
import AssayTable from "@/components/AssayTable/AssayTable";
import Module from "@/components/Module/Module";
import StatusComponent from "@/components/StatusDetails/StatusComponent";

export default async function Dashboard() {

  const userData = await getUserData();
  const { type: roleType, priority: currentUserPriority } = userData.user_role[0].role;
  const { orgUser } = userData;
  let organizations: OrganizationDataFields[] = [orgUser];

  if (roleType === 'admin') {
    organizations = await getOrganization();
  }

  const usersList = await getUsers(['orgUser', 'user_role']);
  const filteredRoles = await getLowPriorityRole(currentUserPriority);

  const breadcrumbs: BreadCrumbsObj[] = [
    {
      label: "Home",
      svgPath: "/icons/home-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: `Admin: ${orgUser?.name}`,
      svgPath: "/icons/admin-inactive-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: "Dashboard",
      svgPath: "",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
      isActive: true,
    },
  ];

  const heading: BreadCrumbsObj[] = [
    {
      svgPath: "/icons/admin-icon-lg.svg",
      label: `${orgUser?.name}`,
      svgWidth: 28,
      svgHeight: 28,
      href: "",
      type: "Admin:"
    },
    {
      svgPath: "/icons/box-arrow-icon-lg.svg",
      label: "",
      svgWidth: 25,
      svgHeight: 22,
      href: ""
    }
  ];

  const { id, name } = orgUser;
  const { internalUsers, externalUsers } = filterUsersByOrgId(usersList, id);
  const { orgInternal, clients } = filterOrganizationList(organizations, name)

  const tabsStatus = [
    {
      title: "Overview",
      Component: StatusComponent,
      props: { stats, countCardsDetails }
    },
    {
      title: "Assays",
      Component: AssayTable,
      props: { dataSource },
    },
    {
      title: "Modules",
      Component: Module,
      props: { featuresLeft, featuresRight },
    }
  ];

  function tabsInfo(obj: any): any {
    const {
      roleType,
      name,
      internalUsers,
      externalUsers,
      orgInternal,
      clients,
      roles
    } = obj;
    return [
      {
        title: `${name} Users (${internalUsers?.length})`,
        Component: UsersTable,
        props: { roles, roleType, data: internalUsers, organizationData: orgInternal }
      },
      {
        title: `Client Users (${externalUsers?.length})`,
        Component: UsersTable,
        props: { roles, roleType, data: externalUsers, organizationData: clients }
      },
    ]
  }

  return (
    <Layout>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <Heading {...{ heading }} />
      <Tabs tabsDetails={tabsStatus} />
      <div className={styles.page}>
        <main className={styles.main}>
          {roleType === 'admin' && <div className='py-5'>
            <Tabs tabsDetails={tabsInfo({
              roles: filteredRoles,
              roleType,
              name,
              internalUsers,
              externalUsers,
              orgInternal,
              clients
            })} />
          </div>
          }
          {roleType === 'admin' && <div>
            <div className={styles.imageContainer}>
              <Image

                src="/icons/organization.svg"
                width={33}
                height={30}
                alt="organization"
              />
              <span>Customer Organizations</span>
            </div>
            <div className={styles.table}>
              <ListOrganization userData={userData} />
            </div>
          </div>
          }
          {roleType === 'org_admin' && <div>
            <div className={styles.imageContainer}>
              <Image
                src="/icons/Users-icon-lg.svg"
                width={40}
                height={32}
                alt="organization"
              />
              <span>Users</span>
            </div>
            <div className={styles.table}>
              <UsersTable data={usersList} organizationData={organizations} roles={filteredRoles} roleType={roleType} />
            </div>
          </div>
          }
        </main>
      </div>
    </Layout>
  );
}
