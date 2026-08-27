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

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function FeaturedSlider({
  blogs,
}: Props) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  /*
   * ==========================================================
   * AUTO SLIDE
   * ==========================================================
   *
   * Changes article every 3 seconds.
   */

  useEffect(() => {
    if (blogs.length <= 1 || paused) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrent((previous) => {
        if (previous >= blogs.length - 1) {
          return 0;
        }

        return previous + 1;
      });
    }, 3000);

    return () => {
      window.clearInterval(timer);
    };
  }, [blogs.length, paused]);

  /*
   * ==========================================================
   * SAFETY
   * ==========================================================
   */

  useEffect(() => {
    if (blogs.length === 0) {
      setCurrent(0);
      return;
    }

    if (current >= blogs.length) {
      setCurrent(0);
    }
  }, [blogs.length, current]);

  if (!blogs.length) {
    return null;
  }

  /*
   * ==========================================================
   * NAVIGATION
   * ==========================================================
   */

  function previousSlide() {
    setCurrent((previous) => {
      if (previous === 0) {
        return blogs.length - 1;
      }

      return previous - 1;
    });
  }

  function nextSlide() {
    setCurrent((previous) => {
      if (previous === blogs.length - 1) {
        return 0;
      }

      return previous + 1;
    });
  }

  const activeBlog = blogs[current];

  return (
    <section
      className="
        mx-auto
        w-full
        max-w-[1180px]
        px-4
        py-8
        sm:px-6
        sm:py-10
        lg:px-8
        lg:py-12
      "
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-5 flex items-end justify-between sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-950" />

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500 sm:text-[11px]">
              Featured
            </span>
          </div>

          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">
            Latest from AnantaGo
          </h2>
        </div>

        <Link
          href="/blog"
          className="
            hidden
            text-sm
            font-semibold
            text-zinc-500
            transition-colors
            duration-200
            hover:text-zinc-950
            sm:block
          "
        >
          View all →
        </Link>
      </div>

      {/* =====================================================
          SINGLE ARTICLE SLIDE
      ====================================================== */}

      <div
        className="
          relative
          w-full
          overflow-hidden
          rounded-2xl
          border
          border-zinc-200
          bg-white
          shadow-[0_6px_24px_rgba(0,0,0,0.05)]
        "
      >
        <article
          key={activeBlog.id}
          className="
            grid
            w-full
            lg:grid-cols-[1.05fr_0.95fr]
          "
        >
          {/* =================================================
              IMAGE
          ================================================== */}

          <Link
            href={`/blog/${activeBlog.slug}`}
            className="
              group
              relative
              order-1
              block
              aspect-[16/9]
              w-full
              overflow-hidden
              bg-zinc-100
              lg:order-2
              lg:aspect-auto
              lg:h-[370px]
            "
          >
            {activeBlog.cover_image ? (
              <Image
                src={activeBlog.cover_image}
                alt={
                  activeBlog.cover_image_alt ||
                  activeBlog.title
                }
                fill
                priority={current === 0}
                sizes="
                  (max-width: 1023px) 100vw,
                  50vw
                "
                className="
                  object-cover
                  transition-transform
                  duration-500
                  ease-out
                  group-hover:scale-[1.025]
                "
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-zinc-400">
                AnantaGo
              </div>
            )}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/20
                via-transparent
                to-transparent
              "
            />
          </Link>

          {/* =================================================
              CONTENT
          ================================================== */}

          <div
            className="
              order-2
              flex
              min-h-[250px]
              flex-col
              justify-center
              px-5
              py-6
              sm:min-h-[275px]
              sm:px-8
              sm:py-8
              lg:order-1
              lg:min-h-0
              lg:px-10
              lg:py-8
              xl:px-12
            "
          >
            {/* CATEGORY */}

            {activeBlog.category && (
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
                {activeBlog.category}
              </span>
            )}

            {/* TITLE */}

            <h3
              className="
                mt-3
                line-clamp-3
                max-w-[650px]
                text-[23px]
                font-black
                leading-[1.13]
                tracking-[-0.03em]
                text-zinc-950
                sm:mt-4
                sm:text-3xl
                lg:text-[34px]
                xl:text-[38px]
              "
            >
              {activeBlog.title}
            </h3>

            {/* EXCERPT */}

            {activeBlog.excerpt && (
              <p
                className="
                  mt-3
                  line-clamp-2
                  max-w-[560px]
                  text-sm
                  leading-6
                  text-zinc-600
                  sm:text-base
                  sm:leading-7
                "
              >
                {activeBlog.excerpt}
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
                text-[11px]
                text-zinc-500
                sm:text-xs
              "
            >
              {activeBlog.author && (
                <>
                  <span>{activeBlog.author}</span>

                  <span className="text-zinc-300">
                    •
                  </span>
                </>
              )}

              <span>
                {formatDate(
                  activeBlog.published_at ||
                    activeBlog.created_at
                )}
              </span>

              {activeBlog.reading_time && (
                <>
                  <span className="text-zinc-300">
                    •
                  </span>

                  <span>
                    {activeBlog.reading_time} min read
                  </span>
                </>
              )}
            </div>

            {/* BUTTON */}

            <div className="mt-5">
              <Link
                href={`/blog/${activeBlog.slug}`}
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
        </article>

        {/* =====================================================
            PREVIOUS
        ====================================================== */}

        {blogs.length > 1 && (
          <button
            type="button"
            onClick={previousSlide}
            aria-label="Previous featured article"
            className="
              absolute
              left-3
              top-[25%]
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-black/40
              text-white
              shadow-md
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-black/60
              active:scale-95
              sm:h-10
              sm:w-10
              lg:left-4
              lg:top-1/2
              lg:-translate-y-1/2
            "
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* =====================================================
            NEXT
        ====================================================== */}

        {blogs.length > 1 && (
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next featured article"
            className="
              absolute
              right-3
              top-[25%]
              z-20
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-white/60
              bg-black/40
              text-white
              shadow-md
              backdrop-blur-md
              transition-all
              duration-200
              hover:bg-black/60
              active:scale-95
              sm:h-10
              sm:w-10
              lg:right-4
              lg:top-1/2
              lg:-translate-y-1/2
            "
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* =====================================================
          DOTS
      ====================================================== */}

      {blogs.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {blogs.map((blog, index) => (
            <button
              key={blog.id}
              type="button"
              onClick={() => setCurrent(index)}
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
            font-semibold
            text-zinc-500
            transition-colors
            duration-200
            hover:text-zinc-950
          "
        >
          View all articles →
        </Link>
      </div>
    </section>
  );
}