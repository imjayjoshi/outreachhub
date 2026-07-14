import * as Yup from "yup";

export const companySchema = Yup.object({
  name: Yup.string().required("Company name is required"),
  website: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  industry: Yup.string().nullable(),
  size: Yup.string().nullable(),
  location: Yup.string().nullable(),
  notes: Yup.string().nullable(),
});
