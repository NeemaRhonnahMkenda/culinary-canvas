import type { Metadata } from "next";
import Mine from "../components/pages/Mine";

export const metadata: Metadata = { title: "My recipes", robots: { index: false } };

export default function Page() {
  return <Mine />;
}
