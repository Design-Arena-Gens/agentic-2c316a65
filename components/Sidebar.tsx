"use client";

import { useMemo, useState } from "react";
import { usePageStore } from "@/lib/store";
import type { PageNode } from "@/lib/types";
import { Plus, MoreHorizontal, Trash2, FilePlus2, ChevronDown, ChevronRight, Pencil } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

function useSelectedPageId(): [string | null, (id: string) => void] {
  const router = useRouter();
  const search = useSearchParams();
  const pathname = usePathname();
  const selected = search.get("pageId");
  return [selected, (id: string) => router.replace(`${pathname}?pageId=${id}`)];
}

function TreeItem({ node, depth }: { node: PageNode; depth: number }) {
  const [expanded, setExpanded] = useState(true);
  const [isRenaming, setRenaming] = useState(false);
  const renamePage = usePageStore((s) => s.renamePage);
  const deletePage = usePageStore((s) => s.deletePage);
  const addPage = usePageStore((s) => s.addPage);
  const [selectedId, setSelectedId] = useSelectedPageId();

  const isSelected = selectedId === node.id;

  return (
    <div className="text-sm">
      <div
        className={clsx(
          "group flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer",
          isSelected ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/5"
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => setSelectedId(node.id)}
      >
        {node.children.length > 0 ? (
          <button
            className="p-1 rounded hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : (
          <div className="w-6" />
        )}
        {isRenaming ? (
          <input
            autoFocus
            defaultValue={node.title}
            onBlur={(e) => {
              const v = e.currentTarget.value.trim() || "Untitled";
              renamePage(node.id, v);
              setRenaming(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.currentTarget as HTMLInputElement).blur();
              if (e.key === "Escape") setRenaming(false);
            }}
            className="flex-1 bg-transparent outline-none border-b border-white/20 text-white"
          />
        ) : (
          <span className="flex-1 truncate">{node.title || "Untitled"}</span>
        )}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button
            className="p-1 rounded hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              setRenaming(true);
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation();
              const id = addPage(node.id);
              setSelectedId(id);
            }}
            aria-label="Add child page"
          >
            <FilePlus2 size={16} />
          </button>
          <button
            className="p-1 rounded hover:bg-white/10 text-red-300"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Delete this page and all its children?")) {
                deletePage(node.id);
              }
            }}
            aria-label="Delete page"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      {expanded && node.children.length > 0 && (
        <div className="mt-1">
          {node.children.map((child) => (
            <TreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const rootPages = usePageStore((s) => s.rootPages);
  const addPage = usePageStore((s) => s.addPage);
  const ensureDefaultPage = usePageStore((s) => s.ensureDefaultPage);
  const [selectedId, setSelectedId] = useSelectedPageId();

  const flatFirstId = useMemo(() => {
    const stack = [...rootPages];
    while (stack.length) {
      const n = stack.shift()!;
      if (n) return n.id;
    }
    return null;
  }, [rootPages]);

  // Ensure there is at least one page and a selected one
  if (!selectedId && flatFirstId) setSelectedId(flatFirstId);
  if (rootPages.length === 0) ensureDefaultPage();

  return (
    <aside
      className="h-screen w-[var(--sidebar-width)] bg-sidebar-bg text-slate-100 border-r border-sidebar-border flex flex-col"
    >
      <div className="px-3 py-3 border-b border-sidebar-border flex items-center justify-between">
        <span className="font-semibold">Notion Clone</span>
        <button
          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20"
          onClick={() => {
            const id = addPage(null);
            setSelectedId(id);
          }}
        >
          <Plus size={16} /> New
        </button>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {rootPages.map((node) => (
          <TreeItem key={node.id} node={node} depth={0} />
        ))}
      </div>
    </aside>
  );
}
