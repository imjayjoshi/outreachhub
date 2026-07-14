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
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  notes?: string | null;
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
      name: company?.name ?? "",
      website: company?.website ?? "",
      industry: company?.industry ?? "",
      size: company?.size ?? "",
      location: company?.location ?? "",
      notes: company?.notes ?? "",
    },
    validationSchema: companySchema,
    onSubmit: async (values) => {
      try {
        const payload = {
          name: values.name,
          website: values.website || null,
          industry: values.industry || null,
          size: values.size || null,
          location: values.location || null,
          notes: values.notes || null,
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
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Company Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Acme Corp"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-rose-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium text-white">
              Website
            </Label>
            <Input
              id="website"
              name="website"
              placeholder="https://example.com"
              value={formik.values.website}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("website")}
            />
            {formik.touched.website && formik.errors.website && (
              <p className="text-xs text-rose-500">{formik.errors.website}</p>
            )}
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
              <Label htmlFor="size" className="text-sm font-medium text-white">
                Company Size
              </Label>
              <Input
                id="size"
                name="size"
                placeholder="e.g. 11-50, 50-200"
                value={formik.values.size}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={fieldClass("size")}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <Label
              htmlFor="location"
              className="text-sm font-medium text-white"
            >
              Location
            </Label>
            <Input
              id="location"
              name="location"
              placeholder="e.g. San Francisco, CA"
              value={formik.values.location}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("location")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-sm font-medium text-white">
              Notes
            </Label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Any notes about this company..."
              value={formik.values.notes}
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
