import type { Metadata } from "next";
import { Review } from "@/components/review/Review";

export const metadata: Metadata = { title: "Review" };

export default function ReviewPage() {
  return <Review />;
}
