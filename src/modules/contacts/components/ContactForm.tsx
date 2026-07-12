"use client";
import { useState, useEffect } from "react";
import { useFormik } from "formik";
import { contactSchema } from "../schemas/contactSchema";
import { contactService } from "../services/contactService";
import { companyService } from "@/modules/companies";
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

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  linkedinUrl?: string | null;
  companyId?: string | null;
  status: string;
}

interface Company {
  id: string;
  name: string;
}

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact?: Contact | null;
  onSuccess: () => void;
}

const STATUS_OPTIONS = ["new", "contacted", "replied", "rejected"];

export function ContactForm({
  open,
  onOpenChange,
  contact,
  onSuccess,
}: ContactFormProps) {
  const isEditing = !!contact;
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    if (open) {
      companyService
        .list()
        .then(setCompanies)
        .catch(() => {});
    }
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: contact?.name ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      role: contact?.role ?? "",
      linkedinUrl: contact?.linkedinUrl ?? "",
      companyId: contact?.companyId ?? "",
      status: contact?.status ?? "new",
    },
    validationSchema: contactSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          role: values.role || null,
          linkedinUrl: values.linkedinUrl || null,
          companyId: values.companyId || null,
          status: values.status,
        };
        if (isEditing) {
          await contactService.update(contact!.id, payload);
          toast.success("Contact updated.");
        } else {
          await contactService.create(payload);
          toast.success("Contact created.");
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
            {isEditing ? "Edit Contact" : "New Contact"}
          </SheetTitle>
          <SheetDescription className="text-midnight-muted text-sm">
            {isEditing
              ? "Update contact details."
              : "Add a new contact to your outreach CRM."}
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Full Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Jane Smith"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-rose-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-white">
              Email <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("email")}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-rose-500">{formik.errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-sm font-medium text-white">
              Phone
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+1 555 000 0000"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("phone")}
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <Label htmlFor="role" className="text-sm font-medium text-white">
              Job Title / Role
            </Label>
            <Input
              id="role"
              name="role"
              placeholder="e.g. Engineering Manager"
              value={formik.values.role}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("role")}
            />
          </div>

          {/* LinkedIn */}
          <div className="space-y-1.5">
            <Label
              htmlFor="linkedinUrl"
              className="text-sm font-medium text-white"
            >
              LinkedIn URL
            </Label>
            <Input
              id="linkedinUrl"
              name="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={formik.values.linkedinUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("linkedinUrl")}
            />
            {formik.touched.linkedinUrl && formik.errors.linkedinUrl && (
              <p className="text-xs text-rose-500">
                {formik.errors.linkedinUrl}
              </p>
            )}
          </div>

          {/* Company */}
          <div className="space-y-1.5">
            <Label
              htmlFor="companyId"
              className="text-sm font-medium text-white"
            >
              Company
            </Label>
            <select
              id="companyId"
              name="companyId"
              value={formik.values.companyId}
              onChange={formik.handleChange}
              className="w-full rounded-xl border border-midnight-border bg-midnight-bg px-3 py-2 text-sm text-white focus:border-midnight-primary focus:outline-none focus:ring-1 focus:ring-midnight-primary/20 transition-all"
            >
              <option value="">No company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium text-white">
              Status
            </Label>
            <select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              className="w-full rounded-xl border border-midnight-border bg-midnight-bg px-3 py-2 text-sm text-white focus:border-midnight-primary focus:outline-none focus:ring-1 focus:ring-midnight-primary/20 transition-all capitalize"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
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
              "Add Contact"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
