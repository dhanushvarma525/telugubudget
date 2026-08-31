
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function FeaturedSlider({
  blogs,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const totalSlides = blogs.length;

  /*
   * ==========================================================
   * SAFETY
   * ==========================================================
   */

  useEffect(() => {
    if (totalSlides === 0) {
      setCurrent(0);
      return;
    }

    if (current >= totalSlides) {
      setCurrent(0);
    }
  }, [current, totalSlides]);

  /*
   * ==========================================================
   * AUTO SLIDE
   * ==========================================================
   *
   * Automatically changes the featured article
   * every 4 seconds.
   *
   * Pauses while the user is hovering over the slider.
   */

  useEffect(() => {
    if (totalSlides <= 1 || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((previous) =>
        previous >= totalSlides - 1
          ? 0
          : previous + 1
      );
    }, 4000);

    return () => {
      window.clearInterval(timer);
    };
  }, [paused, totalSlides]);

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  function previousSlide() {
    if (totalSlides <= 1) return;

    setCurrent((previous) =>
      previous === 0
        ? totalSlides - 1
        : previous - 1
    );
  }

  function nextSlide() {
    if (totalSlides <= 1) return;

    setCurrent((previous) =>
      previous >= totalSlides - 1
        ? 0
        : previous + 1
    );
  }

  function goToSlide(index: number) {
    setCurrent(index);
  }

  /*
   * ==========================================================
   * EMPTY STATE
   * ==========================================================
   */

  if (!blogs.length) {
    return null;
  }

  return (
    <section
      className="mx-auto w-full max-w-[1280px] px-5 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =====================================================
          SECTION HEADER
      ====================================================== */}

      <div className="mb-6 flex items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
              Featured
            </p>
          </div>

          <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            Featured stories
          </h2>
        </div>

        <Link
          href="/blog"
          className="hidden text-sm font-bold text-zinc-500 transition-colors hover:text-zinc-950 sm:block"
        >
          View all →
        </Link>
      </div>

      {/* =====================================================
          SLIDER
      ====================================================== */}

      <div
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-zinc-200
          bg-white
          shadow-[0_8px_30px_rgba(0,0,0,0.05)]
        "
      >
        {/* ===================================================
            SLIDE TRACK
        ==================================================== */}

        <div
          className="
            flex
            w-full
            transition-transform
            duration-700
            ease-[cubic-bezier(0.22,1,0.36,1)]
            will-change-transform
          "
          style={{
            transform: `translate3d(-${
              current * 100
            }%, 0, 0)`,
          }}
        >
          {blogs.map((blog, index) => (
            <article
              key={blog.id}
              className="
                grid
                w-full
                min-w-full
                shrink-0
                lg:grid-cols-[0.95fr_1.05fr]
              "
            >
              {/* =================================================
                  CONTENT
              ================================================== */}

              <div
                className="
                  order-2
                  flex
                  min-h-[290px]
                  flex-col
                  justify-center
                  px-5
                  py-7
                  sm:min-h-[320px]
                  sm:px-8
                  sm:py-9
                  lg:order-1
                  lg:min-h-[390px]
                  lg:px-10
                  xl:px-12
                "
              >
                {/* CATEGORY */}

                {blog.category && (
                  <span
                    className="
                      w-fit
                      rounded-full
                      bg-zinc-950
                      px-3
                      py-1.5
                      text-[9px]
                      font-bold
                      uppercase
                      tracking-[0.14em]
                      text-white
                      sm:text-[10px]
                    "
                  >
                    {blog.category}
                  </span>
                )}

                {/* TITLE */}

                <h3
                  className="
                    mt-4
                    line-clamp-3
                    max-w-[650px]
                    text-[24px]
                    font-black
                    leading-[1.12]
                    tracking-[-0.035em]
                    text-zinc-950
                    sm:text-3xl
                    lg:text-[34px]
                    xl:text-[39px]
                  "
                >
                  {blog.title}
                </h3>

                {/* EXCERPT */}

                {blog.excerpt && (
                  <p
                    className="
                      mt-3
                      line-clamp-3
                      max-w-[590px]
                      text-sm
                      leading-6
                      text-zinc-600
                      sm:text-base
                      sm:leading-7
                    "
                  >
                    {blog.excerpt}
                  </p>
                )}

                {/* META */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-2
                    text-[10px]
                    font-medium
                    text-zinc-500
                    sm:text-xs
                  "
                >
                  {blog.author && (
                    <>
                      <span>{blog.author}</span>

                      <span className="text-zinc-300">
                        •
                      </span>
                    </>
                  )}

                  <span>
                    {formatDate(
                      blog.published_at ||
                        blog.created_at
                    )}
                  </span>

                  {blog.reading_time && (
                    <>
                      <span className="text-zinc-300">
                        •
                      </span>

                      <span>
                        {blog.reading_time} min read
                      </span>
                    </>
                  )}
                </div>

                {/* BUTTON */}

                <div className="mt-5">
                  <Link
                    href={`/blog/${blog.slug}`}
                    className="
                      group
                      inline-flex
                      h-10
                      items-center
                      rounded-lg
                      bg-zinc-950
                      px-4
                      text-sm
                      font-bold
                      text-white
                      transition-all
                      duration-200
                      hover:bg-zinc-800
                      hover:shadow-md
                      active:scale-[0.98]
                    "
                  >
                    Read article

                    <span
                      className="
                        ml-2
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                      "
                    >
                      →
                    </span>
                  </Link>
                </div>
              </div>

              {/* =================================================
                  IMAGE
              ================================================== */}

              <Link
                href={`/blog/${blog.slug}`}
                className="
                  group
                  relative
                  order-1
                  block
                  aspect-[16/10]
                  w-full
                  overflow-hidden
                  bg-zinc-100
                  lg:order-2
                  lg:aspect-auto
                  lg:min-h-[390px]
                "
              >
                {blog.cover_image ? (
                  <Image
                    src={blog.cover_image}
                    alt={
                      blog.cover_image_alt ||
                      blog.title
                    }
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1023px) 100vw, 52vw"
                    className="
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-[1.025]
                    "
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-sm font-bold text-zinc-400">
                    AnantaGo
                  </div>
                )}

                <div
                  className="
                    pointer-events-none
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/25
                    via-transparent
                    to-transparent
                  "
                />
              </Link>
            </article>
          ))}
        </div>

        {/* =====================================================
            PREVIOUS BUTTON
        ====================================================== */}

        {totalSlides > 1 && (
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous featured article"
            className="
              absolute
              left-3
              top-[38%]
              z-20
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-black/45
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-black/65
              active:scale-95
              sm:left-4
              sm:h-10
              sm:w-10
              lg:top-1/2
            "
          >
            <ChevronLeft
              className="h-4 w-4 sm:h-5 sm:w-5"
              strokeWidth={2.4}
            />
          </button>
        )}

        {/* =====================================================
            NEXT BUTTON
        ====================================================== */}

        {totalSlides > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next featured article"
            className="
              absolute
              right-3
              top-[38%]
              z-20
              flex
              h-9
              w-9
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-black/45
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-black/65
              active:scale-95
              sm:right-4
              sm:h-10
              sm:w-10
              lg:top-1/2
            "
          >
            <ChevronRight
              className="h-4 w-4 sm:h-5 sm:w-5"
              strokeWidth={2.4}
            />
          </button>
        )}
      </div>

      {/* =====================================================
          SLIDE INDICATORS
      ====================================================== */}

      {totalSlides > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {blogs.map((blog, index) => (
            <button
              key={blog.id}
              type="button"
              onClick={() => goToSlide(index)}
              aria-label={`Show featured article ${
                index + 1
              }`}
              aria-current={
                current === index
                  ? "true"
                  : undefined
              }
              className={`
                h-1.5
                rounded-full
                transition-all
                duration-300
                ${
                  current === index
                    ? "w-7 bg-zinc-950"
                    : "w-1.5 bg-zinc-300 hover:bg-zinc-500"
                }
              `}
            />
          ))}
        </div>
      )}

      {/* =====================================================
          MOBILE VIEW ALL
      ====================================================== */}

      <div className="mt-4 text-center sm:hidden">
        <Link
          href="/blog"
          className="
            text-xs
            font-bold
            text-zinc-500
            transition-colors
            hover:text-zinc-950
          "
        >
          View all articles →
        </Link>
      </div>
    </section>
  );
}
