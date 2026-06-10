import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  currentParams: Record<string, string | undefined>;
};

export function Pagination({ currentPage, totalPages, currentParams }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPages(currentPage, totalPages);
  const buildHref = (page: number) => {
    const nextParams = new URLSearchParams();
    if (currentParams.search) nextParams.set("search", currentParams.search);
    if (currentParams.department_id) nextParams.set("department_id", currentParams.department_id);
    if (currentParams.country) nextParams.set("country", currentParams.country);
    if (currentParams.employment_type) nextParams.set("employment_type", currentParams.employment_type);
    if (currentParams.currency) nextParams.set("currency", currentParams.currency);
    if (currentParams.sort_by) nextParams.set("sort_by", currentParams.sort_by);
    if (currentParams.sort_order) nextParams.set("sort_order", currentParams.sort_order);
    nextParams.set("page", String(page));
    return `/?${nextParams.toString()}`;
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <Link
        className={`pagination-button ${currentPage <= 1 ? "is-disabled" : ""}`}
        href={buildHref(Math.max(1, currentPage - 1))}
        scroll={false}
      >
        Prev
      </Link>

      <div className="pagination-pages">
        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              …
            </span>
          ) : (
              <Link
              key={page}
              className={`pagination-page ${page === currentPage ? "is-active" : ""}`}
              href={buildHref(page)}
              scroll={false}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </Link>
          ),
        )}
      </div>

      <Link
        className={`pagination-button ${currentPage >= totalPages ? "is-disabled" : ""}`}
        href={buildHref(Math.min(totalPages, currentPage + 1))}
        scroll={false}
      >
        Next
      </Link>
    </nav>
  );
}

function buildPages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const windowStart = Math.max(2, currentPage - 1);
  const windowEnd = Math.min(totalPages - 1, currentPage + 1);

  if (windowStart > 2) {
    pages.push("ellipsis");
  }

  for (let page = windowStart; page <= windowEnd; page += 1) {
    pages.push(page);
  }

  if (windowEnd < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}
