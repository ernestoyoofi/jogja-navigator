"use client";

import { Toaster } from "sonner";

export default function Root({ children }) {
  return (
    <>
      <Toaster richColors position="top-center" />
      {children}
    </>
  );
}