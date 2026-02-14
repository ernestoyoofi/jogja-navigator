import "@/lib/dotenv";
import { google } from "googleapis";

const oauth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

export async function GoogleOAuth_UrlAuth() {
  const scopeGoogle = ["auth/userinfo.profile", "auth/userinfo.email"];
  return oauth.generateAuthUrl({
    access_type: "offline",
    login_hint: "select_account",
    scope: scopeGoogle.map((a) => `https://www.googleapis.com/${a}`).join(" "),
  });
}

export async function GoogleOAuth_GetProfile(code) {
  try {
    const { tokens } = await oauth.getToken(code);
    oauth.setCredentials(tokens);
    const request = await oauth.request({
      url: `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${tokens.access_token}`,
    });
    return {
      data: {
        id: `GoogleOAuth|${request?.data?.id || "unknowing"}`,
        name: String(request?.data?.name || ""),
        picture: String(request?.data?.picture || "").replace(
          "s96-c",
          "s164-c",
        ),
        email: String(request?.data?.email || ""),
        language: String(request?.data?.locale || "en"),
        verified: Boolean(request?.data?.verified_email || false),
      },
    };
  } catch (err) {
    console.error("[GoogleOAuth GetProfile]:", err.stack);
    if (err.message?.match("invalid_request")) {
      return {
        error: "oauth-google:oauth_invalid_request#1",
        error_params: [{ name_service: "OAuth Google" }],
      };
    }
    if (err.message?.match("invalid_grant")) {
      return { error: "oauth-google:oauth_invalid_grant#2" };
    }
    return { error: "oauth-google:_breakcrash" };
  }
}
