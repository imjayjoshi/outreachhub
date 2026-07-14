"use client";
import { useFormik } from "formik";
import { templateSchema } from "../schemas/templateSchema";
import { templateService } from "../services/templateService";
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

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface TemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
  onSuccess: () => void;
}

const VARIABLE_HINTS = ["{{name}}", "{{company}}", "{{role}}", "{{date}}"];

export function TemplateForm({
  open,
  onOpenChange,
  template,
  onSuccess,
}: TemplateFormProps) {
  const isEditing = !!template;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: template?.name ?? "",
      subject: template?.subject ?? "",
      body: template?.body ?? "",
    },
    validationSchema: templateSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        if (isEditing) {
          await templateService.update(template!.id, values);
          toast.success("Template updated.");
        } else {
          await templateService.create(values);
          toast.success("Template created.");
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
        className="w-full sm:max-w-lg bg-midnight-surface border-midnight-border text-white flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-white text-lg font-bold">
            {isEditing ? "Edit Template" : "New Template"}
          </SheetTitle>
          <SheetDescription className="text-midnight-muted text-sm">
            Use variables like{" "}
            {VARIABLE_HINTS.map((v) => (
              <code
                key={v}
                className="text-midnight-secondary bg-midnight-card px-1 rounded text-xs mx-0.5"
              >
                {v}
              </code>
            ))}{" "}
            that will be replaced when sending campaigns.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={formik.handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
        >
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-white">
              Template Name <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Cold Outreach - Engineering"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("name")}
            />
            {formik.touched.name && formik.errors.name && (
              <p className="text-xs text-rose-500">{formik.errors.name}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="subject" className="text-sm font-medium text-white">
              Email Subject <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="e.g. Interested in {{role}} opportunity at {{company}}"
              value={formik.values.subject}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={fieldClass("subject")}
            />
            {formik.touched.subject && formik.errors.subject && (
              <p className="text-xs text-rose-500">{formik.errors.subject}</p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="body" className="text-sm font-medium text-white">
              Email Body <span className="text-rose-500">*</span>
            </Label>
            <textarea
              id="body"
              name="body"
              rows={12}
              placeholder={`Hi {{name}},\n\nI came across {{company}} and was impressed by...\n\nBest,`}
              value={formik.values.body}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full resize-none rounded-xl border px-3 py-2.5 text-sm text-white placeholder:text-midnight-muted/40 bg-midnight-bg focus:outline-none focus:ring-1 transition-all duration-200 font-mono leading-relaxed ${
                formik.touched.body && formik.errors.body
                  ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                  : "border-midnight-border focus:border-midnight-primary focus:ring-midnight-primary/20"
              }`}
            />
            {formik.touched.body && formik.errors.body && (
              <p className="text-xs text-rose-500">{formik.errors.body}</p>
            )}
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
              "Create Template"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
