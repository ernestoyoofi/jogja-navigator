import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Chat_Delete_Validator = z.object({
  id: z
    .string("field-is-string")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid"),
});

export default function Chat_Delete_Valid(data = {}) {
  return validator(Chat_Delete_Validator, data, "chat-delete");
}