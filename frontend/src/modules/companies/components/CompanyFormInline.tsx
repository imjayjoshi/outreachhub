"use client";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { companySchema } from "../schemas/companySchema";
import { companyService } from "../services/companyService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  companyName: string;
  email: string | null;
  phone: string | null;
  careerUrl: string | null;
  website: string | null;
  linkedin: string | null;
  industry: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  employeeSize: string | null;
}

interface CompanyFormInlineProps {
  companyId?: string;
}

export function CompanyFormInline({ companyId }: CompanyFormInlineProps) {
  const router = useRouter();
  const isEditing = !!companyId;
  const [loading, setLoading] = useState(isEditing);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!companyId) return;
    companyService
      .get(companyId)
      .then((data) => {
        setCompany(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load company details.");
        router.push("/companies");
      });
  }, [companyId, router]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      companyName: company?.companyName ?? "",
      email: company?.email ?? "",
      phone: company?.phone ?? "",
      careerUrl: company?.careerUrl ?? "",
      website: company?.website ?? "",
      linkedin: company?.linkedin ?? "",
      industry: company?.industry ?? "",
      employeeSize: company?.employeeSize ?? "",
      city: company?.city ?? "",
      state: company?.state ?? "",
      country: company?.country ?? "",
      description: company?.description ?? "",
    },
    validationSchema: companySchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          companyName: values.companyName,
          email: values.email || null,
          phone: values.phone || null,
          careerUrl: values.careerUrl || null,
          website: values.website || null,
          linkedin: values.linkedin || null,
          industry: values.industry || null,
          employeeSize: values.employeeSize || null,
          city: values.city || null,
          state: values.state || null,
          country: values.country || null,
          description: values.description || null,
        };

        if (isEditing) {
          await companyService.update(companyId!, payload);
          toast.success("Company updated successfully.");
        } else {
          await companyService.create(payload);
          toast.success("Company created successfully.");
        }
        router.push("/companies");
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    },
  });

  const fieldClass = (field: keyof typeof formik.touched) =>
    `bg-midnight-bg border-midnight-border text-white placeholder:text-midnight-muted/40 rounded-xl focus:border-midnight-primary focus:ring-midnight-primary/20 transition-all duration-200 ${
      formik.touched[field] && formik.errors[field]
        ? "border-rose-500 focus:border-rose-500"
        : ""
    }`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 text-midnight-primary animate-spin" />
        <p className="text-sm text-midnight-muted mt-2">Loading details...</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/companies")}
          className="p-2 rounded-xl bg-midnight-card hover:bg-midnight-card/80 border border-midnight-border text-midnight-muted hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {isEditing ? "Edit Company" : "New Company"}
          </h1>
          <p className="text-xs text-midnight-muted mt-0.5">
            {isEditing
              ? "Update company details below."
              : "Fill in the details to add a company to your outreach CRM."}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-midnight-surface/30 border border-midnight-border rounded-2xl p-6 shadow-xl">
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Company Name */}
          <div className="space-y-1.5">
            <Label
              htmlFor="companyName"
              className="text-sm font-medium text-white"
            >
              Company Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="companyName"
              name="companyName"
              placeholder="e.g. Acme Corp"
              value={formik.values.companyName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("companyName")}
            />
            {formik.touched.companyName && formik.errors.companyName && (
              <p className="text-xs text-rose-500">
                {formik.errors.companyName}
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email ID
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="info@acme.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-rose-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-white">
              Mobile Number
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 (555) 019-2834"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("phone")}
            />
          </div>

          {/* Grid Layout for URL fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Career Page URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="careerUrl"
                className="text-sm font-medium text-white"
              >
                Career Page URL
              </Label>
              <Input
                id="careerUrl"
                name="careerUrl"
                placeholder="https://acme.com/careers"
                value={formik.values.careerUrl}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("careerUrl")}
              />
              {formik.touched.careerUrl && formik.errors.careerUrl && (
                <p className="text-xs text-rose-500">
                  {formik.errors.careerUrl}
                </p>
              )}
            </div>

            {/* Website URL */}
            <div className="space-y-1.5">
              <Label
                htmlFor="website"
                className="text-sm font-medium text-white"
              >
                Website URL
              </Label>
              <Input
                id="website"
                name="website"
                placeholder="https://acme.com"
                value={formik.values.website}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("website")}
              />
              {formik.touched.website && formik.errors.website && (
                <p className="text-xs text-rose-500">{formik.errors.website}</p>
              )}
            </div>
          </div>

          {/* Grid Layout for Industry & Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Industry */}
            <div className="space-y-1.5">
              <Label
                htmlFor="industry"
                className="text-sm font-medium text-white"
              >
                Industry
              </Label>
              <Input
                id="industry"
                name="industry"
                placeholder="e.g. SaaS, Fintech"
                value={formik.values.industry}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("industry")}
              />
            </div>

            {/* Size */}
            <div className="space-y-1.5">
              <Label
                htmlFor="employeeSize"
                className="text-sm font-medium text-white"
              >
                Company Size
              </Label>
              <Input
                id="employeeSize"
                name="employeeSize"
                placeholder="e.g. 11-50, 50-200"
                value={formik.values.employeeSize}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("employeeSize")}
              />
            </div>
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-sm font-medium text-white">
              City
            </Label>
            <Input
              id="city"
              name="city"
              placeholder="e.g. San Francisco"
              value={formik.values.city}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("city")}
            />
          </div>

          {/* Notes / Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-sm font-medium text-white"
            >
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Any details about this company..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full resize-none rounded-xl border border-midnight-border bg-midnight-bg px-3 py-2 text-sm text-white placeholder:text-midnight-muted/40 focus:border-midnight-primary focus:outline-none focus:ring-1 focus:ring-midnight-primary/20 transition-all duration-200"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-midnight-border">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/companies")}
              className="text-midnight-muted hover:text-white hover:bg-midnight-card/40 rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formik.isSubmitting}
              className="bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl px-6 shadow-lg cursor-pointer flex items-center gap-2"
            >
              {formik.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Company"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
