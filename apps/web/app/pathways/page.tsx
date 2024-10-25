import Layout from "@/components/layout";
import { redirect } from "next/navigation";
import { getUserData } from "@/utils/auth";
import styles from "./page.module.css";
import PathwayImage from "@/components/PathwayImage/PathwayImage";

export default async function Pathway() {

  const sessionData = await getUserData();
  if (!sessionData) {
    redirect('/');
  }

  return (
    <Layout>
      <div className={styles.page}>
        <main className={styles.main}>
          <PathwayImage></PathwayImage>
        </main>
      </div>
    </Layout>
  );
}
