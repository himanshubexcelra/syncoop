import Layout from "@/components/layout";
import TestComponent from "@/components/Test/TestComponent";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Projects() {

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    return (
        <Layout>
            <TestComponent sessionData={sessionData}></TestComponent>
        </Layout>
    );
}