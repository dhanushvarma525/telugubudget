"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type FeaturedBlog = {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  cover_image_alt?: string | null;
  category: string | null;
  author: string | null;
  reading_time?: number | null;
  created_at: string;
  published_at?: string | null;
};

type Props = {
  blogs: FeaturedBlog[];
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function FeaturedSlider({ blogs }: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (blogs.length <= 1 || paused) return;

    const timer = window.setInterval(() => {
      setCurrent((previous) => (previous + 1) % blogs.length);
    }, 3000);

    return () => window.clearInterval(timer);
  }, [blogs.length, paused]);

  if (!blogs.length) return null;

  const article = blogs[current];

  function previousSlide() {
    setCurrent((previous) =>
      previous === 0 ? blogs.length - 1 : previous - 1
    );
  }

  function nextSlide() {
    setCurrent((previous) => (previous + 1) % blogs.length);
  }

  return (
    <section
      className="mx-auto max-w-[1280px] px-5 py-12 sm:px-6 sm:py-14 lg:px-8 lg:py-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Header */}

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              Featured
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            Stories worth knowing
          </h2>
        </div>

        <Link
          href="/blog"
          className="hidden text-sm font-semibold text-zinc-500 transition hover:text-zinc-950 sm:block"
        >
          View all →
        </Link>
      </div>

      {/* Featured card */}

      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div
          key={article.id}
          className="grid animate-featured-fade lg:grid-cols-[1fr_1.05fr]"
        >
          {/* Text */}

          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10 xl:p-12">
            {article.category && (
              <span className="w-fit rounded-full bg-zinc-950 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white">
                {article.category}
              </span>
            )}

            <h3 className="mt-4 max-w-2xl text-2xl font-black leading-tight tracking-[-0.025em] text-zinc-950 sm:text-3xl lg:text-4xl">
              {article.title}
            </h3>

            {article.excerpt && (
              <p className="mt-4 max-w-xl text-sm leading-6 text-zinc-600 sm:text-base sm:leading-7">
                {article.excerpt}
              </p>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
              {article.author && (
                <>
                  <span>{article.author}</span>
                  <span className="text-zinc-300">•</span>
                </>
              )}

              <span>
                {formatDate(
                  article.published_at || article.created_at
                )}
              </span>

              {article.reading_time && (
                <>
                  <span className="text-zinc-300">•</span>
                  <span>{article.reading_time} min read</span>
                </>
              )}
            </div>

            <div className="mt-6">
              <Link
                href={`/blog/${article.slug}`}
                className="group inline-flex h-10 items-center rounded-lg bg-zinc-950 px-4 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                Read the story
                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Image */}

          <Link
            href={`/blog/${article.slug}`}
            className="group relative h-[250px] overflow-hidden bg-zinc-100 sm:h-[330px] lg:h-[390px]"
          >
            {article.cover_image ? (
              <Image
                src={article.cover_image}
                alt={
                  article.cover_image_alt || article.title
                }
                fill
                priority={current === 0}
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover transition duration-700 group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-zinc-400">
                AnantaGo
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </Link>
        </div>

        {/* Navigation */}

        {blogs.length > 1 && (
          <>
            <button
              type="button"
              onClick={previousSlide}
              aria-label="Previous featured article"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white opacity-0 backdrop-blur-sm transition group-hover:opacity-100 hover:bg-black/50 lg:left-4"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next featured article"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white opacity-0 backdrop-blur-sm transition hover:bg-black/50 lg:right-4"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dots */}

      {blogs.length > 1 && (
        <div className="mt-5 flex items-center justify-center gap-1.5">
          {blogs.map((blog, index) => (
            <button
              key={blog.id}
              type="button"
              aria-label={`Show featured article ${index + 1}`}
              onClick={() => setCurrent(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-7 bg-zinc-950"
                  : "w-1.5 bg-zinc-300 hover:bg-zinc-500"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}