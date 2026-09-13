import { Contact } from "@/components/store/contact";
export const metadata = { title: "Contato e orçamentos" };
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  return <Contact subject={(await searchParams).assunto || ""} />;
}
