import type { Metadata } from "next";
import { Onboarding } from "@/components/onboarding/Onboarding";

export const metadata: Metadata = { title: "Get started" };

export default function StartPage() {
  return <Onboarding />;
}
