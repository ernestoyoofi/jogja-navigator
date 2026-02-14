import "./dotenv";
import jwt from "jsonwebtoken";
import isJson from "./is-json";

const passkey = String(process.env?.APP_JWT_SECRET || "");

export function toAuthToken({ id, email } = {}) {
  return jwt.sign(
    {
      time: new Date().getTime(),
      id: id,
      email: email,
    },
    passkey,
    {
      algorithm: "HS256",
      expiresIn: "2d", // 2 day only
    },
  );
}

export function toAuthData(data = "") {
  try {
    const a = jwt.verify(data, passkey);
    return {
      id: a.id,
      email: a.email,
      error: false,
    };
  } catch (e) {
    console.log("[Jsonwebtoken]:", e);
    return {
      error: true,
      isExpired: !!(e?.name === "TokenExpiredError"),
    };
  }
}

export function validateJWT(data = "") {
  const openTokenVariable = String(
    typeof data !== "string" ? "" : data || "",
  ).trim();
  const [headerJWT, payloadJWT] = openTokenVariable.split(".");
  if (!(headerJWT.startsWith("eyJ") && payloadJWT.startsWith("eyJ"))) {
    return false;
  }
  if (!isJson(Buffer.from(headerJWT, "base64").toString())) {
    return false;
  }
  if (!isJson(Buffer.from(payloadJWT, "base64").toString())) {
    return false;
  }
  return true;
}
