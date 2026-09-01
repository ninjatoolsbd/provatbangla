import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Youtube from "@tiptap/extension-youtube";
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
  Youtube as YoutubeIcon,
  Palette,
  Type,
  Maximize,
  Minimize,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";

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

  const addImage = () => {
    const url = window.prompt("ছবির URL লিখুন:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutubeVideo = () => {
    const url = window.prompt("YouTube ভিডিওর URL লিখুন:");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const colors = [
    { name: "ডিফল্ট", value: "inherit" },
    { name: "কালো", value: "#000000" },
    { name: "লাল", value: "#ED1C24" },
    { name: "নীল", value: "#1a73e8" },
    { name: "সবুজ", value: "#25D366" },
  ];

  const fontSizes = [
    { label: "ছোট", value: "14px" },
    { label: "স্বাভাবিক", value: "16px" },
    { label: "বড়", value: "20px" },
    { label: "বিশাল", value: "24px" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/30 p-2 sticky top-0 z-10">
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="টেক্সট কালার">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {colors.map((color) => (
            <DropdownMenuItem 
              key={color.value}
              onClick={() => color.value === 'inherit' ? editor.chain().focus().unsetColor().run() : editor.chain().focus().setColor(color.value).run()}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: color.value === 'inherit' ? 'transparent' : color.value }} />
                <span>{color.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <div className="mx-1 h-6 w-px bg-border" />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="হেডিং">
            <Type className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
            প্যারাগ্রাফ
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
            হেডিং ১
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
            হেডিং ২
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
            হেডিং ৩
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={addImage}
        title="ছবি যোগ করুন"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={addYoutubeVideo}
        title="ভিডিও যোগ করুন"
      >
        <YoutubeIcon className="h-4 w-4" />
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
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Youtube.configure({
        controls: true,
        HTMLAttributes: {
          class: "aspect-video w-full rounded-lg my-4",
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
        class: "prose prose-slate max-w-none focus:outline-none min-h-[500px] p-6 text-justify text-[14px] md:text-[17px] leading-[1.85] md:leading-[1.9] text-black font-sans",
      },
    },
    immediatelyRender: false,
  });

  // Handle external content updates (e.g. from AI rewrite)
  if (editor && content !== editor.getHTML() && !editor.isFocused) {
    // Only set content if the difference is more than just whitespace or minor HTML formatting
    editor.commands.setContent(content);
  }

  return (
    <div className="flex flex-col border border-border rounded-md overflow-hidden bg-card">
      <MenuBar editor={editor} />
      <div className="overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}