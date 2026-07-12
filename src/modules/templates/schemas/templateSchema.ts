import * as Yup from "yup";

export const templateSchema = Yup.object({
  name: Yup.string().required("Template name is required"),
  subject: Yup.string().required("Subject line is required"),
  body: Yup.string().required("Email body is required"),
});
