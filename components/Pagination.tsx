"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const createPageLink = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }

    const query = params.toString();

    return query ? `${pathname}?${query}` : pathname;
  };

  const pages = [];

  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, currentPage + 2);

  if (currentPage <= 3) {
    endPage = Math.min(5, totalPages);
  }

  if (currentPage >= totalPages - 2) {
    startPage = Math.max(1, totalPages - 4);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <Link
        href={createPageLink(Math.max(1, currentPage - 1))}
        className={`px-4 py-2 rounded-lg border transition ${
          currentPage === 1
            ? "pointer-events-none opacity-50"
            : "hover:bg-gray-100"
        }`}
      >
        ← Previous
      </Link>

      {startPage > 1 && (
        <>
          <Link
            href={createPageLink(1)}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            1
          </Link>

          {startPage > 2 && (
            <span className="px-2 text-gray-500">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={createPageLink(page)}
          className={`px-4 py-2 rounded-lg border transition ${
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "hover:bg-gray-100"
          }`}
        >
          {page}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">...</span>
          )}

          <Link
            href={createPageLink(totalPages)}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            {totalPages}
          </Link>
        </>
      )}

      <Link
        href={createPageLink(Math.min(totalPages, currentPage + 1))}
        className={`px-4 py-2 rounded-lg border transition ${
          currentPage === totalPages
            ? "pointer-events-none opacity-50"
            : "hover:bg-gray-100"
        }`}
      >
        Next →
      </Link>
    </div>
  );
}