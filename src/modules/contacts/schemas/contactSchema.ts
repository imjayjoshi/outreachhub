import * as Yup from "yup";

export const contactSchema = Yup.object({
  name: Yup.string().required("Contact name is required"),
  email: Yup.string()
    .email("Must be a valid email")
    .required("Email is required"),
  phone: Yup.string().nullable(),
  role: Yup.string().nullable(),
  linkedinUrl: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  companyId: Yup.string().nullable(),
  status: Yup.string()
    .oneOf(["new", "contacted", "replied", "rejected"])
    .default("new"),
});
