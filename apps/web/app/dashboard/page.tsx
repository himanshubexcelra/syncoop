import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/utils/auth";
import Table from "@/components/Organization/ListOrganization";
import Image from "next/image";
import { getOrganization } from "@/components/Organization/service";
import { BreadCrumbsObj } from "@/lib/definition";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";

export default async function Dashboard() {
  if (!(await isAuthenticated())) {
    revalidatePath("/");
    redirect("/");
  }

  const breadcrumbs: BreadCrumbsObj[] = [
    {
      label: "Home",
      svgPath: "/icons/home-icon.svg",
      svgWidth: 16,
      svgHeight: 16,
      href: "/",
    },
    {
      label: "Admin",
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

  const response = await getOrganization();

  return (
    <>
      <Breadcrumb breadcrumbs={breadcrumbs} />
      <div className={styles.page}>
        <main className={styles.main}>
          <Image
            src="/icons/organization.svg"
            width={33}
            height={30}
            alt="organization"
          />
          <span>Customer Organizations</span>
        </main>
        <div className={styles.table}>
          <Table data={response} />
        </div>
      </div>
    </>
  );
}
