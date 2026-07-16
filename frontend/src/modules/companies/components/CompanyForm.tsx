"use client";
import { useFormik } from "formik";
import { companySchema } from "../schemas/companySchema";
import { companyService } from "../services/companyService";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
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

interface CompanyFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company?: Company | null;
  onSuccess: () => void;
}

export function CompanyForm({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyFormProps) {
  const isEditing = !!company;

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
    onSubmit: async (values, { resetForm }) => {
      try {
        // Strip empty strings to null for optional fields
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
          await companyService.update(company!.id, payload);
          toast.success("Company updated successfully.");
        } else {
          await companyService.create(payload);
          toast.success("Company created successfully.");
        }
        resetForm();
        onSuccess();
        onOpenChange(false);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-midnight-surface border-midnight-border text-white flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-white text-lg font-bold">
            {isEditing ? "Edit Company" : "New Company"}
          </SheetTitle>
          <SheetDescription className="text-midnight-muted text-sm">
            {isEditing
              ? "Update company details below."
              : "Fill in the details to add a company to your outreach CRM."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
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
              <p className="text-xs text-rose-500">{formik.errors.careerUrl}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-1.5">
            <Label htmlFor="website" className="text-sm font-medium text-white">
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
              placeholder="e.g. SaaS, Fintech, AI"
              value={formik.values.industry}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("industry")}
            />
          </div>

          {/* Company Size */}
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
              placeholder="e.g. 10-50, 100-500"
              value={formik.values.employeeSize}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("employeeSize")}
            />
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
              rows={3}
              placeholder="Any details about this company..."
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full resize-none rounded-xl border border-midnight-border bg-midnight-bg px-3 py-2 text-sm text-white placeholder:text-midnight-muted/40 focus:border-midnight-primary focus:outline-none focus:ring-1 focus:ring-midnight-primary/20 transition-all duration-200"
            />
          </div>
        </form>

        <SheetFooter className="px-6 pb-6 pt-2 border-t border-midnight-border flex gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-midnight-muted hover:text-white hover:bg-midnight-card/40 rounded-xl cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={formik.isSubmitting}
            onClick={() => formik.handleSubmit()}
            className="flex-1 bg-midnight-primary hover:bg-[#4676E5] text-white font-semibold rounded-xl shadow-lg cursor-pointer disabled:opacity-50"
          >
            {formik.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Company"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
