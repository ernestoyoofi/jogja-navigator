import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Location_Rating_Validator = z.object({
  id: z
    .string("field-is-string|field:ID")
    .regex(/^[0-9a-fA-F]{24}$/, "field-is-objectid|field:ID"),
  rating: z
    .number({
      required_error: "field-is-required|field:Rating",
      invalid_type_error: "field-is-number|field:Rating"
    })
    .min(1, "field-is-min|field:Rating|min:1")
    .max(5, "field-is-max|field:Rating|max:5"),
});

export default function Location_Rating_Valid(data = {}) {
  return validator(Location_Rating_Validator, data, "location-rating");
}
