import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Chat_Submit_Validator = z.object({
  id: z
    .string("field-is-string")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid"),
  message: z
    .string("field-is-string")
    .min(1, "field-is-required"),
});

export default function Chat_Submit_Valid(data = {}) {
  return validator(Chat_Submit_Validator, data, "chat-submit");
}
