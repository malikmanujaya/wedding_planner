"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Images, Plus, Trash2, Upload } from "lucide-react";
import {
  api,
  getActiveWeddingId,
  mediaUrl,
  type GalleryAlbum,
} from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function GalleryPage() {
  const [weddingId, setWeddingId] = useState<number | null>(null);
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [uploadAlbumId, setUploadAlbumId] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [linkAlbumId, setLinkAlbumId] = useState<number | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [lightboxAlbumId, setLightboxAlbumId] = useState<number | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async (id: number) => {
    const list = await api.listGalleryAlbums(id);
    setAlbums(list);
  }, []);

  useEffect(() => {
    const id = getActiveWeddingId();
    if (!id) {
      setLoading(false);
      return;
    }
    setWeddingId(id);
    load(id)
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [load]);

  async function createAlbum(e: React.FormEvent) {
    e.preventDefault();
    if (!weddingId || !title.trim()) return;
    setCreating(true);
    try {
      await api.createGalleryAlbum(weddingId, {
        title: title.trim(),
        description: description.trim() || undefined,
        publicVisible: true,
      });
      setTitle("");
      setDescription("");
      await load(weddingId);
      toast.success("Album created");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create album");
    } finally {
      setCreating(false);
    }
  }

  async function togglePublic(album: GalleryAlbum) {
    if (!weddingId) return;
    try {
      await api.updateGalleryAlbum(weddingId, album.id, {
        title: album.title,
        description: album.description ?? undefined,
        publicVisible: !album.publicVisible,
        sortOrder: album.sortOrder,
      });
      await load(weddingId);
      toast.success(album.publicVisible ? "Album hidden from public site" : "Album published");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    }
  }

  async function removeAlbum(albumId: number) {
    if (!weddingId) return;
    if (!confirm("Delete this album and all its photos?")) return;
    try {
      await api.deleteGalleryAlbum(weddingId, albumId);
      await load(weddingId);
      toast.success("Album deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function removePhoto(photoId: number) {
    if (!weddingId) return;
    try {
      await api.deleteGalleryPhoto(weddingId, photoId);
      await load(weddingId);
      toast.success("Photo removed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function startUpload(albumId: number) {
    setUploadAlbumId(albumId);
    fileRef.current?.click();
  }

  async function onFilesSelected(files: FileList | null) {
    if (!weddingId || uploadAlbumId == null || !files?.length) return;
    setProgress(0);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;
        const uploaded = await api.uploadFile(weddingId, file, (p) => {
          const base = (i / files.length) * 100;
          setProgress(Math.round(base + p / files.length));
        });
        await api.addGalleryPhoto(weddingId, uploadAlbumId, {
          imageUrl: uploaded.url,
          uploadId: uploaded.id,
        });
      }
      await load(weddingId);
      toast.success("Photos added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setProgress(null);
      setUploadAlbumId(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function addLink(albumId: number) {
    if (!weddingId || !linkUrl.trim()) return;
    try {
      await api.addGalleryPhoto(weddingId, albumId, { imageUrl: linkUrl.trim() });
      setLinkUrl("");
      setLinkAlbumId(null);
      await load(weddingId);
      toast.success("Photo link added");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add link");
    }
  }

  const lightboxAlbum = albums.find((a) => a.id === lightboxAlbumId);
  const lightboxItems =
    lightboxAlbum?.photos.map((p) => ({
      imageUrl: p.imageUrl,
      caption: p.caption,
    })) ?? [];

  if (loading) {
    return <p className="text-muted-foreground">Loading gallery…</p>;
  }

  if (!weddingId) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <h1 className="font-display text-3xl tracking-tight">Gallery</h1>
        <p className="text-muted-foreground">Select an active wedding first.</p>
        <Button asChild>
          <Link href="/weddings">Go to weddings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-3xl tracking-tight">Gallery</h1>
        <p className="mt-1 text-muted-foreground">
          Albums for your public wedding site. Upload photos or paste image links.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">New album</CardTitle>
          <CardDescription>Visible albums appear on /w/… under Gallery.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={createAlbum} className="grid gap-3 sm:grid-cols-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Album title"
              required
            />
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
            />
            <Button type="submit" className="sm:col-span-2" disabled={creating}>
              <Plus className="h-4 w-4" />
              {creating ? "Creating…" : "Create album"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      {progress != null && (
        <div className="rounded-lg border bg-muted/40 px-4 py-3">
          <p className="mb-2 text-sm font-medium">Uploading… {progress}%</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {albums.map((album) => (
        <Card key={album.id}>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Images className="h-5 w-5" />
                {album.title}
              </CardTitle>
              {album.description && (
                <CardDescription className="mt-1">{album.description}</CardDescription>
              )}
              <div className="mt-2">
                <Badge variant={album.publicVisible ? "secondary" : "outline"}>
                  {album.publicVisible ? "Public" : "Hidden"}
                </Badge>
                <span className="ml-2 text-xs text-muted-foreground">
                  {album.photos.length} photo{album.photos.length === 1 ? "" : "s"}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => startUpload(album.id)}
                disabled={progress != null}
              >
                <Upload className="h-3.5 w-3.5" />
                Upload
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setLinkAlbumId((id) => (id === album.id ? null : album.id))
                }
              >
                Add link
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => togglePublic(album)}
              >
                {album.publicVisible ? "Hide" : "Publish"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeAlbum(album.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {linkAlbumId === album.id && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                />
                <Button type="button" onClick={() => addLink(album.id)}>
                  Add
                </Button>
              </div>
            )}
            {album.photos.length === 0 ? (
              <p className="text-sm text-muted-foreground">No photos yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {album.photos.map((photo, idx) => (
                  <div
                    key={photo.id}
                    className="group relative overflow-hidden rounded-md border bg-muted/30"
                  >
                    <button
                      type="button"
                      className="block w-full"
                      onClick={() => {
                        setLightboxAlbumId(album.id);
                        setLightboxIndex(idx);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mediaUrl(photo.imageUrl)}
                        alt={photo.caption ?? ""}
                        className="h-32 w-full object-cover transition-transform group-hover:scale-[1.02]"
                      />
                    </button>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute right-1.5 top-1.5 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => removePhoto(photo.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {!albums.length && (
        <p className="text-center text-sm text-muted-foreground">
          Create an album to start building the gallery.
        </p>
      )}

      <ImageLightbox
        items={lightboxItems}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex}
      />
    </div>
  );
}
