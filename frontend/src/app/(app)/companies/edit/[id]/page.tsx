import { CompanyFormInline } from "@/modules/companies/components/CompanyFormInline";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCompanyPage({ params }: EditPageProps) {
  const { id } = await params;
  return <CompanyFormInline companyId={id} />;
}
