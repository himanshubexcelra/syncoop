/*eslint max-len: ["error", { "code": 80 }]*/
import Layout from "@/components/layout";
import styles from "./page.module.css";
import { getUserData } from "@/utils/auth";
import { redirect } from "next/navigation";
import KetcherBox from "@/components/KetcherTool/KetcherBox";

export default async function Ketchertool() {

  const sessionData = await getUserData();
  if (!sessionData) {
    redirect('/');
  }

  return (
    <Layout>
      <div className={styles.page}>
        <main className={styles.main}>
          <KetcherBox></KetcherBox>
        </main>
      </div>
    </Layout>
  );
}
