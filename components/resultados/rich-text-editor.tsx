"use client";

import * as React from "react";
import {
  Bold,
  Eraser,
  Heading,
  Italic,
  List,
  ListOrdered,
  Underline,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface RichTextEditorHandle {
  getHTML: () => string;
  setHTML: (html: string) => void;
  focus: () => void;
}

function ToolButton({
  cmd,
  value,
  icon: Icon,
  label,
}: {
  cmd: string;
  value?: string;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      // onMouseDown + preventDefault mantiene el foco/selección en el editor.
      onMouseDown={(e) => {
        e.preventDefault();
        document.execCommand(cmd, false, value);
      }}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

/** Editor de texto enriquecido mínimo (contentEditable) — sin dependencias externas. */
export const RichTextEditor = React.forwardRef<
  RichTextEditorHandle,
  { initialHTML?: string; placeholder?: string; className?: string }
>(function RichTextEditor({ initialHTML = "", placeholder, className }, ref) {
  const divRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      getHTML: () => divRef.current?.innerHTML ?? "",
      setHTML: (html: string) => {
        if (divRef.current) divRef.current.innerHTML = html;
      },
      focus: () => divRef.current?.focus(),
    }),
    [],
  );

  React.useEffect(() => {
    if (divRef.current && initialHTML) divRef.current.innerHTML = initialHTML;
    // Solo al montar: el contenido posterior se maneja imperativamente.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1">
        <ToolButton cmd="bold" icon={Bold} label="Negrita" />
        <ToolButton cmd="italic" icon={Italic} label="Cursiva" />
        <ToolButton cmd="underline" icon={Underline} label="Subrayado" />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolButton cmd="formatBlock" value="h3" icon={Heading} label="Título de sección" />
        <ToolButton cmd="insertUnorderedList" icon={List} label="Lista con viñetas" />
        <ToolButton cmd="insertOrderedList" icon={ListOrdered} label="Lista numerada" />
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolButton cmd="removeFormat" icon={Eraser} label="Quitar formato" />
      </div>
      <div
        ref={divRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="min-h-[340px] p-4 text-sm leading-relaxed outline-none [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-bold [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-6 empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
      />
    </div>
  );
});
