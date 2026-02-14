"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { LogInIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <Empty className="w-full h-dvh">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <LogInIcon />
        </EmptyMedia>
        <EmptyTitle>Masuk terlebih dahulu</EmptyTitle>
        <EmptyDescription>
          Silahkan masuk terlebih dahulu untuk melanjutkan
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          className="ml-1.5 p-5 py-1 shadow-md cursor-pointer"
          onClick={() => {
            window.location.href = "/api/auth?typelogin=1";
          }}
        >
          <p>Masuk dengan Google</p>
        </Button>
      </EmptyContent>
    </Empty>
  );
}