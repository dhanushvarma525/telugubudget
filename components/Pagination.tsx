"use client";

import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

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
    <div className="flex flex-wrap items-center justify-center gap-2">

      {/* Previous */}

      <Link
        href={`/?page=${Math.max(1, currentPage - 1)}`}
        className={`
          px-4
          py-2
          rounded-lg
          border
          transition
          ${
            currentPage === 1
              ? "pointer-events-none opacity-50"
              : "hover:bg-gray-100"
          }
        `}
      >
        ← Previous
      </Link>

      {/* First Page */}

      {startPage > 1 && (
        <>
          <Link
            href="/?page=1"
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            1
          </Link>

          {startPage > 2 && (
            <span className="px-2 text-gray-500">
              ...
            </span>
          )}
        </>
      )}

      {/* Page Numbers */}

      {pages.map((page) => (
        <Link
          key={page}
          href={`/?page=${page}`}
          className={`
            px-4
            py-2
            rounded-lg
            border
            transition
            ${
              page === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "hover:bg-gray-100"
            }
          `}
        >
          {page}
        </Link>
      ))}

      {/* Last Page */}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-gray-500">
              ...
            </span>
          )}

          <Link
            href={`/?page=${totalPages}`}
            className="px-4 py-2 rounded-lg border hover:bg-gray-100 transition"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next */}

      <Link
        href={`/?page=${Math.min(totalPages, currentPage + 1)}`}
        className={`
          px-4
          py-2
          rounded-lg
          border
          transition
          ${
            currentPage === totalPages
              ? "pointer-events-none opacity-50"
              : "hover:bg-gray-100"
          }
        `}
      >
        Next →
      </Link>
    </div>
  );
}