import * as Yup from "yup";

export const companySchema = Yup.object({
  companyName: Yup.string().required("Company name is required"),
  email: Yup.string()
    .email("Must be a valid email format")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  phone: Yup.string().nullable(),
  careerUrl: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  website: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  linkedin: Yup.string()
    .url("Must be a valid URL")
    .nullable()
    .transform((curr, orig) => (orig === "" ? null : curr)),
  industry: Yup.string().nullable(),
  description: Yup.string().nullable(),
  city: Yup.string().nullable(),
  state: Yup.string().nullable(),
  country: Yup.string().nullable(),
  employeeSize: Yup.string().nullable(),
});
