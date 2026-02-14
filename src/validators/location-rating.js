import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Location_Rating_Validator = z.object({
  id: z
    .string("field-is-string")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid"),
  rating: z
    .number({
      required_error: "field-is-required",
      invalid_type_error: "field-is-number"
    })
    .min(1, "field-is-rating")
    .max(5, "field-is-rating"),
});

export default function Location_Rating_Valid(data = {}) {
  return validator(Location_Rating_Validator, data, "location-rating");
}
