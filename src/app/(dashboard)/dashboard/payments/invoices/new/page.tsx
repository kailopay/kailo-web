import { CreateInvoicePage } from "@/components/dashboard/invoices/create-invoice-page";
import { getDashboardOrganization } from "@/lib/dashboard/dashboard/get-organization";

export default async function NewInvoicePage() {
  const organization = await getDashboardOrganization();

  return (
    <CreateInvoicePage
      organizationId={organization.id}
      organizationName={organization.name}
      organizationLogoUrl={organization.logoUrl}
      organizationLogoInitials={organization.logoInitials}
      environment={organization.environment}
    />
  );
}
