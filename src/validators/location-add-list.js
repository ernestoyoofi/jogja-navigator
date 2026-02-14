import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Location_AddList_Validator = z.object({
  id: z
    .string("field-is-string")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid"),
});

export default function Location_AddList_Valid(data = {}) {
  return validator(Location_AddList_Validator, data, "location-addlist");
}
