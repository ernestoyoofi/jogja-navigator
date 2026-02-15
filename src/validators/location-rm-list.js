import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Location_RmList_Validator = z.object({
  id: z
    .string("field-is-string|field:ID")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid|field:ID"),
});

export default function Location_RmList_Valid(data = {}) {
  return validator(Location_RmList_Validator, data, "location-rmlist");
}
