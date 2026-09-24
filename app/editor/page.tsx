import type { Metadata } from "next";
import EditorLoader from "@/components/editor/EditorLoader";

export const metadata: Metadata = {
  title: "Editor · Email Template Editor",
};

export default function EditorPage() {
  return <EditorLoader />;
}
