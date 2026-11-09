import type { Metadata } from "next";
import Editor from "../components/pages/Editor";

export const metadata: Metadata = { title: "Edit recipe", robots: { index: false } };

export default function Page() {
  return <Editor mode="edit" />;
}
