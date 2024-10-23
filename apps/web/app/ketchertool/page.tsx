import EditorBox from "@/components/KetcherTool/Editor";
import Layout from "@/components/layout";
import styles from "./page.module.css";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";

export default async function Ketchertool() {

  const sessionData = await getUserData();
  if (!sessionData) {
    redirect('/');
  }

  return (
    <Layout>
      <div className={styles.page}>
        <main className={styles.main}>
          <EditorBox></EditorBox>
        </main>
      </div>
    </Layout>
  );
}
