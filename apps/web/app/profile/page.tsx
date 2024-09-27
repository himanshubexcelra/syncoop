import styles from "./page.module.css";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/utils/auth";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { BreadCrumbsObj } from "@/lib/definition";

export default async function Profile() {

    if (!await isAuthenticated()) {
        revalidatePath('/');
        redirect("/")
    }

    const breadcrumbs: BreadCrumbsObj[] = [
        { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
        { label: 'Admin', svgPath: '/icons/admin-inactive-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
        { label: 'Profile', svgPath: '', svgWidth: 16, svgHeight: 16, href: '/', isActive: true }
    ]

    return (
        <>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className={styles.page}>
                <main className={styles.main}>
                    <div>
                        Profile page
                    </div>
                </main>
            </div>
        </>
    );
}
