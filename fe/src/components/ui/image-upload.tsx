"use client";

import { useRef, useState } from "react";
import { ImagePlus, Link2, Loader2, Trash2, Upload } from "lucide-react";
import { api, mediaUrl } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";

type ImageUploadFieldProps = {
  weddingId: number;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  className?: string;
};

export function ImageUploadField({
  weddingId,
  value,
  onChange,
  label,
  hint,
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [showLink, setShowLink] = useState(false);
  const [linkDraft, setLinkDraft] = useState("");
  const uploading = progress != null;

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10 MB");
      return;
    }
    setProgress(0);
    try {
      const res = await api.uploadFile(weddingId, file, setProgress);
      onChange(res.url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function applyLink() {
    const url = linkDraft.trim();
    if (!url) return;
    onChange(url);
    setLinkDraft("");
    setShowLink(false);
    toast.success("Image link applied");
  }

  const preview = mediaUrl(value);

  return (
    <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed border-[hsl(150_14%_78%)] bg-[hsl(150_16%_97%)]",
          preview ? "border-solid" : ""
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (uploading) return;
          void onFile(e.dataTransfer.files?.[0]);
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-48 w-full object-cover" />
        ) : (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-48 w-full flex-col items-center justify-center gap-2 px-4 text-center transition-colors hover:bg-[hsl(150_14%_94%)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(162_28%_90%)] text-[hsl(162_42%_28%)]">
              <ImagePlus className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Drop or choose an image</span>
            <span className="text-xs text-muted-foreground">JPEG, PNG, WebP, GIF · max 10 MB</span>
          </button>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[hsl(158_22%_10%/0.55)] px-8 text-white">
            <Loader2 className="h-6 w-6 animate-spin" />
            <div className="h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs tabular-nums">{progress}%</p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {value ? "Replace" : "Upload"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => setShowLink((v) => !v)}
        >
          <Link2 className="h-3.5 w-3.5" />
          Link
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={uploading}
            onClick={() => onChange("")}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        )}
      </div>

      {showLink && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            placeholder="https://… or paste an image URL"
          />
          <Button type="button" variant="secondary" onClick={applyLink}>
            Apply link
          </Button>
        </div>
      )}

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

type MultiImageUploadFieldProps = {
  weddingId: number;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  max?: number;
};

export function MultiImageUploadField({
  weddingId,
  values,
  onChange,
  label,
  max = 12,
}: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [linkDraft, setLinkDraft] = useState("");
  const uploading = progress != null;
  const canAdd = values.length < max;

  async function onFiles(fileList: FileList | null) {
    if (!fileList?.length || !canAdd) return;
    const files = Array.from(fileList).slice(0, max - values.length);
    setProgress(0);
    const next = [...values];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const res = await api.uploadFile(weddingId, file, (p) => {
          const base = (i / files.length) * 100;
          setProgress(Math.round(base + p / files.length));
        });
        next.push(res.url);
        onChange([...next]);
      }
      toast.success(files.length === 1 ? "Photo added" : `${files.length} photos added`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function addLink() {
    const url = linkDraft.trim();
    if (!url || !canAdd) return;
    onChange([...values, url]);
    setLinkDraft("");
    toast.success("Photo link added");
  }

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium">{label}</label>}
      <div className="grid gap-3 sm:grid-cols-2">
        {values.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative overflow-hidden rounded-lg border bg-[hsl(150_16%_97%)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mediaUrl(url)} alt="" className="h-36 w-full object-cover" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2 h-8 w-8 opacity-90"
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[hsl(150_14%_78%)] bg-[hsl(150_16%_97%)] text-sm transition-colors hover:bg-[hsl(150_14%_94%)]"
          >
            {uploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="tabular-nums text-xs text-muted-foreground">{progress}%</span>
                <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            ) : (
              <>
                <ImagePlus className="h-5 w-5 text-primary" />
                <span className="font-medium">Add photos</span>
                <span className="text-xs text-muted-foreground">
                  {values.length}/{max}
                </span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {canAdd && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={linkDraft}
            onChange={(e) => setLinkDraft(e.target.value)}
            placeholder="Or paste an image URL"
          />
          <Button type="button" variant="outline" onClick={addLink}>
            <Link2 className="h-3.5 w-3.5" />
            Add link
          </Button>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Upload from your device or paste a public image URL. Up to {max} photos.
      </p>
    </div>
  );
}
