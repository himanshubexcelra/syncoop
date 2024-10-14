import styles from "./page.module.css";
import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { BreadCrumbsObj } from "@/lib/definition";
import Layout from "@/components/layout";

export default async function Profile() {

    const breadcrumbs: BreadCrumbsObj[] = [
        { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/dashboard' },
        { label: 'Admin', svgPath: '/icons/admin-inactive-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
        { label: 'Profile', svgPath: '', svgWidth: 16, svgHeight: 16, href: '/', isActive: true }
    ]

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div className={styles.page}>
                <main className={styles.main}>
                    <div>
                        Profile page
                    </div>
                </main>
            </div>
        </Layout>
    );
}
