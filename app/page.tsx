import { getAuthSession } from "@/lib/auth";
import TrackerKalorii from "./components/TrackerKalorii";
import { redirect } from "next/navigation";

export default async function StronaGlowna() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/logowanie");
  }

  return (
    <main>
      <TrackerKalorii />
    </main>
  );
}
