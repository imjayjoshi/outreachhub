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
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  notes?: string | null;
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
      name: company?.name ?? "",
      website: company?.website ?? "",
      industry: company?.industry ?? "",
      size: company?.size ?? "",
      location: company?.location ?? "",
      notes: company?.notes ?? "",
    },
    validationSchema: companySchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        // strip empty strings to null for optional fields
        const payload = {
          name: values.name,
          website: values.website || null,
          industry: values.industry || null,
          size: values.size || null,
          location: values.location || null,
          notes: values.notes || null,
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
              placeholder="e.g. SaaS, Fintech, Healthcare"
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
              placeholder="e.g. 1-10, 11-50, 50-200, 200+"
              value={formik.values.size}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("size")}
            />
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
              rows={3}
              placeholder="Any notes about this company..."
              value={formik.values.notes}
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
