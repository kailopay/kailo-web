import { redirect } from "next/navigation";

export default function LegacyReceivingWalletPage() {
  redirect("/dashboard/developers/wallets");
}
