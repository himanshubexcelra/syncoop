/*eslint max-len: ["error", { "code": 80 }]*/
import Layout from "@/components/layout";
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
      <div>
        <main className="main main-padding">
          <KetcherBox></KetcherBox>
        </main>
      </div>
    </Layout>
  );
}
