"use client";

import { useEffect, useMemo, useRef } from "react";
import { usePageStore } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";
import "@blocknote/react/style.css";

function useSelectedPage() {
  const search = useSearchParams();
  const pageId = search.get("pageId");
  const getPageById = usePageStore((s) => s.getPageById);
  return pageId ? getPageById(pageId) : null;
}

export function Editor() {
  const page = useSelectedPage();
  const setPageContent = usePageStore((s) => s.setPageContent);

  const initialContent = useMemo(() => {
    return (page?.content as any) ?? undefined;
  }, [page?.content]);

  const editor = useCreateBlockNote({ initialContent });

  // When the page changes, update the editor content
  useEffect(() => {
    if (!page) return;
    const doc = (page.content as any) ?? undefined;
    if (doc) {
      editor.replaceBlocks(editor.document, doc);
    } else {
      // clear to a default empty doc
      editor.replaceBlocks(editor.document, [editor.schema.blockSpecs.paragraph.create()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page?.id]);

  // Debounced save
  const timer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!page) return;
    const unsubscribe = editor.onChange(() => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setPageContent(page.id, editor.document);
      }, 400);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, [editor, page, setPageContent]);

  if (!page) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-500">
        Select or create a page
      </div>
    );
  }

  return (
    <div className="h-screen overflow-auto">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <input
          className="w-full text-3xl font-semibold outline-none bg-transparent placeholder-slate-400 mb-4"
          placeholder="Untitled"
          defaultValue={page.title}
          onBlur={(e) => usePageStore.getState().renamePage(page.id, e.currentTarget.value || "Untitled")}
        />
        <div className="rounded-lg border border-slate-200">
          <BlockNoteView editor={editor} theme="light" />
        </div>
      </div>
    </div>
  );
}
