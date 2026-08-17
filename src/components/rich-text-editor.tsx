import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Code,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("URL লিখুন:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-2">
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("bold") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="বোল্ড"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("italic") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="ইটালিক"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("underline") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="আন্ডারলাইন"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("heading", { level: 1 }) && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        title="হেডিং ১"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("heading", { level: 2 }) && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="হেডিং ২"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("heading", { level: 3 }) && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="হেডিং ৩"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("bulletList") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="বুলেট লিস্ট"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("orderedList") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="অর্ডারড লিস্ট"
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("blockquote") && "bg-accent text-primary")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="উদ্ধৃতি"
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", editor.isActive("link") && "bg-accent text-primary")}
        onClick={addLink}
        title="লিঙ্ক যোগ করুন"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <div className="mx-1 h-6 w-px bg-border" />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="আগের অবস্থায় ফিরুন"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="পরের অবস্থায় যান"
      >
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || "এখানে নিউজের মূল লেখা লিখুন...",
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-slate max-w-none focus:outline-none min-h-[400px] p-4 text-[16px] leading-[1.8] font-sans",
      },
    },
    immediatelyRender: false,
  });

  // Handle external content updates (e.g. from AI rewrite)
  if (editor && content !== editor.getHTML() && !editor.isFocused) {
    editor.commands.setContent(content);
  }

  return (
    <div className="flex flex-col border-0">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
