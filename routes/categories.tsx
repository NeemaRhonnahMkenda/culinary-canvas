import type { Metadata } from "next";
import Categories from "../components/pages/Categories";

export const metadata: Metadata = { title: "Blog Posts", description: "Browse every recipe on Culinary Canvas by category, or search by ingredient or cook." };

export default function Page() {
  return <Categories />;
}
