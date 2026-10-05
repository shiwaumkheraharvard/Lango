import type { Metadata } from "next";
import { Suspense } from "react";
import { History } from "@/components/history/History";
import { PageSkeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = { title: "History" };

export default function HistoryPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <History />
    </Suspense>
  );
}
