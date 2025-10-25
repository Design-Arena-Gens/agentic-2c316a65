"use client";

import { Sidebar } from "@/components/Sidebar";
import { Editor } from "@/components/Editor";

export default function HomePage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Editor />
      </main>
    </div>
  );
}
