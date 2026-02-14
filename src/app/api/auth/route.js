import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { ipAddress } from "@vercel/functions"
import actions from "@/action/actions"
import { GoogleOAuth_GetProfile, GoogleOAuth_UrlAuth } from "@/lib/google-auth"

export async function GET(req) {
  const header = await headers()
  const cookie = await cookies();
  const params = new URL(req.url).searchParams;
  const ipXhead = header.get("x-real-ip") || header.get("x-forwarded-for");
  const ipaddress = ipAddress({ headers: header });
  const ip = ipXhead || ipaddress;

  try {
    if(!!params?.get("typelogin")) {
      const buildURL = await GoogleOAuth_UrlAuth()
      return NextResponse.redirect(new URL(buildURL, req.url))
    }
    // Get Profile
    const getProfile = await GoogleOAuth_GetProfile(
      params?.get("code") || "",
    )
    if(getProfile.error) {
      return NextResponse.json({
        error: getProfile.error
      }, {
        status: 400
      })
    }
    // Header
    let header_ctx = {}
    let cookie_ctx = {}
    header.forEach((val, key) => {
      header_ctx[key] = String(val).trim()
    })
    for(const cookie_item of cookie.getAll()) {
      cookie_ctx[cookie_item.name||""] = String(cookie_item?.value||"").trim()
    }
    // Request System Action
    const requestdata = await actions.SystemAction({
      system: {
        headers: header_ctx,
        cookies: cookie_ctx,
        ip: ip,
        location: "" // No Location Detected
      },
      type: "user:getauth",
      data: getProfile.data || {}
    })
    // --- [ Set Cookie ] ---
    // Set Cookie
    for(const cookie_data of requestdata.set_cookie) {
      cookie.set(cookie_data?.key, cookie_data?.value, cookie_data?.options || {})
    }
    // Remove Cookie
    for(const cookie_key of requestdata.rm_cookie) {
      if(cookie_key.key) {
        // Old Version
        cookie.delete(cookie_key.key)
      } else {
        // New Version
        cookie.delete(cookie_key)
      }
    }
    // --- [ Redirect ] ---
    if(!!requestdata.redirect) {
      return NextResponse.redirect(new URL(requestdata.redirect, req.url))
    }
    // --- [ Response Data ] ---
    const responses = NextResponse.json(requestdata.response, {
      status: requestdata.status
    })
    // Set Header
    for(const header_data of requestdata.header) {
      responses.headers.set(header_data?.key, header_data?.value)
    }
    return responses
  } catch(e) {
    console.log("[Crash System]:", e.stack)
    return new NextResponse("Oh No.., System Crash!", { status: 500 })
  }
}