import { z } from "zod";
import validator from "@/lib/seishiro-zodformat";

const Location_List_Validator = z.object({});

export default function Location_List_Valid(data = {}) {
  return validator(Location_List_Validator, data, "location-list");
}
