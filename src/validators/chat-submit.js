import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Chat_Submit_Validator = z.object({
  id: z
    .string("field-is-string|field:ID")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid|field:ID")
    .optional(),
  message: z
    .string("field-is-string|field:Message")
    .min(1, "field-is-required|field:Message"),
  latitude: z
    .number("field-is-number|field:Latitude")
    .min(-250, "field-is-min|field:Latitude|min:-250")
    .max(250, "field-is-max|field:Latitude|max:250"),
  longitude: z
    .number("field-is-number|field:Longitude")
    .min(-250, "field-is-min|field:Longitude|min:-250")
    .max(250, "field-is-max|field:Longitude|max:250"),
});

export default function Chat_Submit_Valid(data = {}) {
  return validator(Chat_Submit_Validator, data, "chat-submit");
}
