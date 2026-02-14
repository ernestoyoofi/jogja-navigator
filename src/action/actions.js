import "@/lib/dotenv";
import { Actions, PolicyBuilder } from "seishiro";
import registry from "./registry";
import message from "./message";

const policy = new PolicyBuilder({
  passkey: process.env.SEISHIRO_PASSKEY,
  version_now: "1.4.5",
  version_min: "1.4.0",
  version_forceupdate: true,
});
policy.noaction("user:getauth", ["api-action"])

const action = new Actions({
  policy: policy,
  registry: registry,
  message: message,
});

export default action;
