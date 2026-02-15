"use client"

import { useEffect } from "react"

import { Map, Source, Layer, Marker } from "@vis.gl/react-maplibre";

export default function Maps() {
  useEffect(() => {
    fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "chat:history",
        data: {
          
        }
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

  return <>
    <Map
      style={{
        width: "100%",
        height: "100dvh",
      }}
      mapStyle="https://tiles.openfreemap.org/styles/bright"
    >

    </Map>
  </>
}