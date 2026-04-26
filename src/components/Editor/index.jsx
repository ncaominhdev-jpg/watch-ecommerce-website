import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { CustomImage } from "../../extensions/CustomImage";
import Heading from "@tiptap/extension-heading";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

const MyEditor = ({ value, onChange }) => {
  const [showImageForm, setShowImageForm] = useState(false);
  const [altText, setAltText] = useState("");
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Heading.configure({ levels: [1, 2, 3] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Link.configure({ openOnClick: false }),
      CustomImage,
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none dark:prose-invert max-w-full min-h-[300px]",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (html !== value) {
        onChange(html);
      }
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result, alt: altText }).run();
      setShowImageForm(false);
      setAltText("");
    };
    reader.readAsDataURL(file);
  };

  const openImageForm = () => {
    setShowImageForm(true);
  };

  const handleInsertImage = () => {
    fileInputRef.current.click();
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="border rounded">
      <div className="flex flex-wrap gap-2 items-center border-b p-2">
        <div
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`cursor-pointer ${editor?.isActive("bold") ? "text-orange-600" : ""}`}
        >
          <Bold size={18} />
        </div>

        <div
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`cursor-pointer ${editor?.isActive("italic") ? "text-orange-600" : ""}`}
        >
          <Italic size={18} />
        </div>

        <div
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          className={`cursor-pointer ${editor?.isActive("strike") ? "text-orange-600" : ""}`}
        >
          <Strikethrough size={18} />
        </div>

        <div
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`cursor-pointer ${editor?.isActive("bulletList") ? "text-orange-600" : ""}`}
        >
          <List size={18} />
        </div>

        <div
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={`cursor-pointer ${editor?.isActive("orderedList") ? "text-orange-600" : ""}`}
        >
          <ListOrdered size={18} />
        </div>

        <div onClick={openImageForm} className="cursor-pointer">
          <ImageIcon size={18} />
        </div>

        <div
          onClick={() => {
            const url = window.prompt("Nhập đường dẫn liên kết:");
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run();
            }
          }}
          className="cursor-pointer"
        >
          <LinkIcon size={18} />
        </div>
      </div>

      {showImageForm && (
        <div className="flex items-center gap-2 px-2 py-2 border-b">
          <input
            type="text"
            placeholder="Nhập mô tả ảnh (alt)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full"
          />
          <button
            onClick={handleInsertImage}
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1 rounded"
          >
            Chọn ảnh
          </button>
          <button
            onClick={() => setShowImageForm(false)}
            type="button"
            className="text-sm px-3 py-1 rounded border text-gray-600"
          >
            Huỷ
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />

      <EditorContent editor={editor} />
    </form>
  );
};

export default MyEditor;
