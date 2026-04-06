"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, Button, TextField, Label, TextArea } from "@heroui/react";

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) setFiles(Array.from(e.target.files));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (files.length === 0) return;
    setUploading(true);
    setMessage("");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", caption);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
      }
      setMessage(`${files.length} file(s) uploaded successfully!`);
      setFiles([]);
      setCaption("");
      if (inputRef.current) inputRef.current.value = "";
      setTimeout(() => router.push("/portal"), 1500);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Upload Media</h1>
          <Link href="/portal"><Button variant="light" size="sm">← Back to Portal</Button></Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <Card shadow="sm">
          <CardHeader className="pb-0 px-6 pt-6">
            <h2 className="font-semibold">Select files to upload</h2>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input
                ref={inputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-white file:font-medium file:cursor-pointer"
              />

              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {files.map((file, i) => (
                    <div key={i} className="h-32 bg-gray-100 rounded-lg overflow-hidden">
                      {file.type.startsWith("video/") ? (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" muted playsInline />
                      ) : (
                        <Image src={URL.createObjectURL(file)} alt="" className="w-full h-32 object-cover" width={400} height={300} />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <TextField>
                <Label>Caption (optional)</Label>
                <TextArea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe the content..."
                />
              </TextField>

              {message && (
                <p className={`text-sm ${message.includes("success") ? "text-success" : "text-danger"}`}>
                  {message}
                </p>
              )}

              <Button
                type="submit"
                variant="solid"
                isDisabled={files.length === 0 || uploading}
                fullWidth
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
