
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  ImagePlus,
  Plus,
  RefreshCw,
  Trash2,
  UserCircle,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Author = {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  role: string | null;
  avatar_url: string | null;
  website_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  whatsapp_url: string | null;
  created_at: string;
  updated_at: string;
};

type AuthorForm = {
  name: string;
  slug: string;
  bio: string;
  role: string;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_url: string;
};

const STORAGE_BUCKET = "blog-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm: AuthorForm = {
  name: "",
  slug: "",
  bio: "",
  role: "",
  website_url: "",
  facebook_url: "",
  instagram_url: "",
  whatsapp_url: "",
};

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function getFileExtension(file: File): string {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (!extension) {
    return "jpg";
  }

  return extension;
}

function getStoragePathFromUrl(
  avatarUrl: string | null
): string | null {
  if (!avatarUrl) {
    return null;
  }

  try {
    const marker = `/${STORAGE_BUCKET}/`;
    const markerIndex = avatarUrl.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    const path = avatarUrl.substring(
      markerIndex + marker.length
    );

    if (!path) {
      return null;
    }

    return decodeURIComponent(path.split("?")[0]);
  } catch {
    return null;
  }
}

export default function AuthorsPage() {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<AuthorForm>({
    ...emptyForm,
  });

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState<string | null>(null);

  const [existingAvatarUrl, setExistingAvatarUrl] =
    useState<string | null>(null);

  const [removeExistingImage, setRemoveExistingImage] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAuthors() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("authors")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (fetchError) {
        throw fetchError;
      }

      setAuthors((data ?? []) as Author[]);
    } catch (err) {
      console.error("Load authors error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load authors."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAuthors();

    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  function clearPreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  }

  function resetForm() {
    clearPreviewUrl();

    setForm({
      ...emptyForm,
    });

    setEditingId(null);
    setSelectedImage(null);
    setImagePreview(null);
    setExistingAvatarUrl(null);
    setRemoveExistingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function openCreateForm() {
    resetForm();

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function openEditForm(author: Author) {
    clearPreviewUrl();

    setEditingId(author.id);

    setForm({
      name: author.name ?? "",
      slug: author.slug ?? "",
      bio: author.bio ?? "",
      role: author.role ?? "",
      website_url: author.website_url ?? "",
      facebook_url: author.facebook_url ?? "",
      instagram_url: author.instagram_url ?? "",
      whatsapp_url: author.whatsapp_url ?? "",
    });

    setExistingAvatarUrl(author.avatar_url ?? null);
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveExistingImage(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    resetForm();
  }

  function updateField(
    field: keyof AuthorForm,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug:
        editingId || current.slug
          ? current.slug
          : createSlug(value),
    }));
  }

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please choose a JPG, PNG, WebP, or GIF image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Profile image must be 5MB or smaller.");

      event.target.value = "";
      return;
    }

    clearPreviewUrl();

    const previewUrl = URL.createObjectURL(file);

    previewUrlRef.current = previewUrl;

    setSelectedImage(file);
    setImagePreview(previewUrl);
    setRemoveExistingImage(false);
  }

  function removeSelectedImage() {
    clearPreviewUrl();

    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleRemoveExistingImage() {
    clearPreviewUrl();

    setRemoveExistingImage(true);
    setExistingAvatarUrl(null);
    setSelectedImage(null);
    setImagePreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function uploadAuthorImage(
    file: File,
    slug: string
  ): Promise<{
    publicUrl: string;
    filePath: string;
  }> {
    const extension = getFileExtension(file);
    const safeSlug = createSlug(slug) || "author";

    const fileName = `${safeSlug}-${Date.now()}.${extension}`;
    const filePath = `authors/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error(
        "Image uploaded, but the public image URL could not be created."
      );
    }

    return {
      publicUrl,
      filePath,
    };
  }

  async function deleteStorageImage(
    avatarUrl: string | null
  ) {
    const filePath = getStoragePathFromUrl(avatarUrl);

    if (!filePath) {
      return;
    }

    try {
      const { error: removeError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([filePath]);

      if (removeError) {
        console.warn(
          "Could not remove author image:",
          removeError
        );
      }
    } catch (err) {
      console.warn(
        "Could not remove author image:",
        err
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = form.name.trim();
    const slug = createSlug(form.slug || name);

    if (!name) {
      setError("Author name is required.");
      return;
    }

    if (!slug) {
      setError("Please enter a valid author slug.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      let avatarUrl = existingAvatarUrl;
      let uploadedFilePath: string | null = null;

      if (selectedImage) {
        const uploaded = await uploadAuthorImage(
          selectedImage,
          slug
        );

        avatarUrl = uploaded.publicUrl;
        uploadedFilePath = uploaded.filePath;
      }

      if (removeExistingImage && !selectedImage) {
        avatarUrl = null;
      }

      const payload = {
        name,
        slug,
        bio: form.bio.trim() || null,
        role: form.role.trim() || null,
        avatar_url: avatarUrl,
        website_url:
          form.website_url.trim() || null,
        facebook_url:
          form.facebook_url.trim() || null,
        instagram_url:
          form.instagram_url.trim() || null,
        whatsapp_url:
          form.whatsapp_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const {
          data: currentAuthor,
          error: currentError,
        } = await supabase
          .from("authors")
          .select("avatar_url")
          .eq("id", editingId)
          .single();

        if (currentError) {
          if (uploadedFilePath) {
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([uploadedFilePath]);
          }

          throw currentError;
        }

        const { error: updateError } = await supabase
          .from("authors")
          .update(payload)
          .eq("id", editingId);

        if (updateError) {
          if (uploadedFilePath) {
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([uploadedFilePath]);
          }

          throw updateError;
        }

        const oldAvatarUrl =
          currentAuthor?.avatar_url ?? null;

        if (
          oldAvatarUrl &&
          oldAvatarUrl !== avatarUrl
        ) {
          await deleteStorageImage(oldAvatarUrl);
        }

        setSuccess(
          "Author updated successfully."
        );
      } else {
        const { error: insertError } = await supabase
          .from("authors")
          .insert({
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (insertError) {
          if (uploadedFilePath) {
            await supabase.storage
              .from(STORAGE_BUCKET)
              .remove([uploadedFilePath]);
          }

          throw insertError;
        }

        setSuccess(
          "Author created successfully."
        );
      }

      setShowForm(false);
      resetForm();

      await loadAuthors();
    } catch (err) {
      console.error("Save author error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save author."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(author: Author) {
    const confirmed = window.confirm(
      `Delete "${author.name}"?\n\nThis should only be done if no articles are using this author.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(author.id);
      setError("");
      setSuccess("");

      const { error: deleteError } = await supabase
        .from("authors")
        .delete()
        .eq("id", author.id);

      if (deleteError) {
        throw deleteError;
      }

      await deleteStorageImage(
        author.avatar_url
      );

      setSuccess(
        "Author deleted successfully."
      );

      await loadAuthors();
    } catch (err) {
      console.error("Delete author error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete author."
      );
    } finally {
      setDeleting(null);
    }
  }

  const displayedImage =
    imagePreview ||
    (!removeExistingImage
      ? existingAvatarUrl
      : null);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="mb-3 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              ← Back to Dashboard
            </button>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              Authors
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Manage the professional author profiles
              used across AnantaGo.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadAuthors()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Add Author
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            {success}
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Authors
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-950">
            {authors.length}
          </p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading authors...
          </div>
        ) : authors.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <UserCircle
              size={48}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              No author profiles yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your first professional author
              profile. You can upload the profile photo
              directly from your computer.
            </p>

            <button
              type="button"
              onClick={openCreateForm}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Create Author
            </button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {authors.map((author) => (
              <article
                key={author.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-start gap-4">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={`${author.name} profile photo`}
                      className="h-16 w-16 shrink-0 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UserCircle size={36} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-slate-950">
                      {author.name}
                    </h2>

                    {author.role && (
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {author.role}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      /author/{author.slug}
                    </p>
                  </div>
                </div>

                {author.bio && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                    {author.bio}
                  </p>
                )}

                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(author)
                    }
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Edit3 size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void handleDelete(author)
                    }
                    disabled={
                      deleting === author.id
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={15} />

                    {deleting === author.id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center py-8">
            <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    {editingId
                      ? "Edit Author"
                      : "Create Author"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Build a professional AnantaGo
                    author profile.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="max-h-[78vh] overflow-y-auto"
              >
                <div className="space-y-6 p-5">
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="mb-4">
                      <h3 className="text-sm font-bold text-slate-900">
                        Profile Photo
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Upload a professional headshot.
                        JPG, PNG, WebP or GIF up to 5MB.
                      </p>
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                      <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm ring-1 ring-slate-200">
                        {displayedImage ? (
                          <img
                            src={displayedImage}
                            alt="Author preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserCircle
                            size={58}
                            className="text-slate-300"
                          />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={
                            handleImageSelect
                          }
                          className="hidden"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            fileInputRef.current?.click()
                          }
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
                        >
                          <ImagePlus size={17} />

                          {displayedImage
                            ? "Change Photo"
                            : "Upload Photo"}
                        </button>

                        {imagePreview && (
                          <button
                            type="button"
                            onClick={
                              removeSelectedImage
                            }
                            disabled={saving}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                          >
                            Cancel Photo
                          </button>
                        )}

                        {existingAvatarUrl &&
                          !imagePreview &&
                          !removeExistingImage && (
                            <button
                              type="button"
                              onClick={
                                handleRemoveExistingImage
                              }
                              disabled={saving}
                              className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                            >
                              Remove Photo
                            </button>
                          )}
                      </div>
                    </div>

                    {selectedImage && (
                      <p className="mt-4 text-xs font-medium text-slate-500">
                        Selected:{" "}
                        {selectedImage.name}
                      </p>
                    )}
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Basic Information
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Full Name *
                        </label>

                        <input
                          type="text"
                          value={form.name}
                          onChange={(event) =>
                            handleNameChange(
                              event.target.value
                            )
                          }
                          placeholder="Dhanush Varma"
                          required
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Author Slug *
                        </label>

                        <input
                          type="text"
                          value={form.slug}
                          onChange={(event) =>
                            updateField(
                              "slug",
                              createSlug(
                                event.target.value
                              )
                            )
                          }
                          placeholder="dhanush-varma"
                          required
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                        <p className="mt-1.5 text-xs text-slate-400">
                          Public author page: /author/
                          {form.slug ||
                            "author-name"}
                        </p>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Professional Role
                        </label>

                        <input
                          type="text"
                          value={form.role}
                          onChange={(event) =>
                            updateField(
                              "role",
                              event.target.value
                            )
                          }
                          placeholder="Founder & Technology Writer"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Website
                        </label>

                        <input
                          type="url"
                          value={form.website_url}
                          onChange={(event) =>
                            updateField(
                              "website_url",
                              event.target.value
                            )
                          }
                          placeholder="https://www.anatago.com"
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      About the Author
                    </h3>

                    <textarea
                      value={form.bio}
                      onChange={(event) =>
                        updateField(
                          "bio",
                          event.target.value
                        )
                      }
                      rows={6}
                      placeholder="Write a concise professional biography..."
                      className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                      Keep this factual,
                      professional and
                      reader-focused.
                    </p>
                  </section>

                  <section>
                    <h3 className="mb-4 text-sm font-bold text-slate-900">
                      Social Profiles
                    </h3>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Facebook
                        </label>

                        <input
                          type="url"
                          value={form.facebook_url}
                          onChange={(event) =>
                            updateField(
                              "facebook_url",
                              event.target.value
                            )
                          }
                          placeholder="https://facebook.com/..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Instagram
                        </label>

                        <input
                          type="url"
                          value={form.instagram_url}
                          onChange={(event) =>
                            updateField(
                              "instagram_url",
                              event.target.value
                            )
                          }
                          placeholder="https://instagram.com/..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          WhatsApp
                        </label>

                        <input
                          type="url"
                          value={form.whatsapp_url}
                          onChange={(event) =>
                            updateField(
                              "whatsapp_url",
                              event.target.value
                            )
                          }
                          placeholder="https://wa.me/..."
                          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </section>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Author"
                        : "Create Author"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

