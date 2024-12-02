import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Projects() {

    const sessionData = await getUserData();
    if (!sessionData) {
        redirect('/');
    }

    return (
        <>{"Test"}</>
    );
}