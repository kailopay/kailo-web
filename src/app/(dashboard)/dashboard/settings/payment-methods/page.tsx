import { redirect } from "next/navigation";

export default function LegacyPaymentMethodsPage() {
  redirect("/dashboard/developers/wallets");
}
