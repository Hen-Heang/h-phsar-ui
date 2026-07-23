import { redirect } from "next/navigation";

export default async function RedirectRetailerBeveragePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (typeof value === "string") params.set(key, value);
  }
  const query = params.toString();
  redirect(`/buyer/beverage${query ? `?${query}` : ""}`);
}
