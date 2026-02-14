"use client"

import { useEffect } from "react"

export default function App_MapNavigator() {
  useEffect(() => {
    fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "user:profile",
      }),
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data)
    })
    .catch((err) => {
      console.log(err)
    })
  }, [])

  return <div>App Map Navigator</div>
}
