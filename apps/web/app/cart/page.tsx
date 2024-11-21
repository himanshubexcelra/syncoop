import Breadcrumb from "@/components/Breadcrumbs/BreadCrumbs";
import { BreadCrumbsObj } from "@/lib/definition";
import Layout from "@/components/layout";

export default async function Cart() {

    const breadcrumbs: BreadCrumbsObj[] = [
        { label: 'Home', svgPath: '/icons/home-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
        { label: 'Admin', svgPath: '/icons/admin-inactive-icon.svg', svgWidth: 16, svgHeight: 16, href: '/' },
        { label: 'Cart', svgPath: '', svgWidth: 16, svgHeight: 16, href: '/', isActive: true }
    ]

    return (
        <Layout>
            <Breadcrumb breadcrumbs={breadcrumbs} />
            <div>
                <main className="main main-padding">
                    <div>
                        Cart page
                    </div>
                </main>
            </div>
        </Layout>
    );
}
