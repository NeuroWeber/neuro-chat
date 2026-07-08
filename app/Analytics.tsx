"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";

export default function Analytics() {
  const pathName = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    sendGAEvent("event", "page_view", {
      page_path: pathName + searchParams.toString(),
    });
  }, [pathName, searchParams]);
}
