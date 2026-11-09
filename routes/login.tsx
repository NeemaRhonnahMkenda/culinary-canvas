import type { Metadata } from "next";
import Auth from "../components/pages/Auth";

export const metadata: Metadata = { title: "Log in", robots: { index: false } };

export default function Page() {
  return <Auth mode="login" />;
}
