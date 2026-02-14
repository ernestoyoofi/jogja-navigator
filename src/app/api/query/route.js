import { cookies, headers } from "next/headers"
import { NextResponse } from "next/server"
import { ipAddress } from "@vercel/functions"
import actions from "@/action/actions"

export async function POST(req) {
  const header = await headers()
  const cookie = await cookies()
  const ipXhead = header.get("x-real-ip") || header.get("x-forwarded-for")
  const ipaddress = ipAddress({ headers: header })
  const ip = ipXhead || ipaddress

  try {
    // Header
    let header_ctx = {}
    let cookie_ctx = {}
    header.forEach((val, key) => {
      header_ctx[key] = String(val).trim()
    })
    for(const cookie_item of cookie.getAll()) {
      cookie_ctx[cookie_item.name||""] = String(cookie_item?.value||"").trim()
    }
    // Jsonbody
    const bodydata = await req.json()
    // Request API Action
    const requestdata = await actions.APIAction({
      system: {
        headers: header_ctx,
        cookies: cookie_ctx,
        ip: ip,
        location: "" // No Location Detected
      },
      type: String(bodydata?.type || ""),
      data: (bodydata?.data || {})
    })
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
    // Set Cookie
    for(const cookie_data of requestdata.set_cookie) {
      responses.cookies.set(cookie_data?.key, cookie_data?.value, cookie_data?.options || {})
    }
    // Remove Cookie
    for(const cookie_key of requestdata.rm_cookie) {
      console.log("Remove key:", cookie_key)
      if(cookie_key.key) {
        // Old Version
        responses.cookies.delete(cookie_key.key)
      } else {
        // New Version
        responses.cookies.delete(cookie_key)
      }
    }
    return responses
  } catch(e) {
    console.log("[Crash System]:", e.stack)
    return new NextResponse("Oh No.., System Crash!", { status: 500 })
  }
}