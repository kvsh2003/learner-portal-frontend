"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

export default function CataloguePage() {
  const [courses, setCourses] = useState([]);
  const [meta, setMeta] = useState(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (page > 1) params.set("page", page.toString());

    const endpoint = `/courses${params.toString() ? `?${params.toString()}` : ""}`;

    fetchApi(endpoint)
      .then((res) => {
        if (isMounted) {
          setCourses(res?.data || []);
          setMeta(res?.meta || null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Failed to load courses");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query, page]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    setPage(1);
    setQuery(search);
  }

  function handleClearSearch() {
    setSearch("");
    setQuery("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Title & Search */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-2xl font-bold text-black">Courses</h1>
        <p className="text-gray-600 text-sm mt-1">
          Browse through our courses and start learning today.
        </p>

        <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-black"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="px-3 py-2 border border-gray-300 rounded text-xs hover:bg-gray-100"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800"
          >
            Search
          </button>
        </form>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-500">Loading courses...</div>
      ) : error ? (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-sm rounded text-center">
          {error}
        </div>
      ) : courses.length === 0 ? (
        <div className="py-12 text-center border border-gray-200 rounded text-sm text-gray-500">
          No courses found.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="border border-gray-200 rounded p-5 bg-white flex flex-col justify-between hover:border-black transition"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="capitalize border border-gray-300 px-2 py-0.5 rounded font-mono">
                      {course.level || "General"}
                    </span>
                    <span>
                      {course.modules_count ?? 0} modules · {course.lessons_count ?? 0} lessons
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold text-black mt-2">
                    <Link href={`/courses/${course.slug}`} className="hover:underline">
                      {course.title}
                    </Link>
                  </h2>

                  <p className="text-gray-600 text-xs mt-2 line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-gray-100">
                  <Link
                    href={`/courses/${course.slug}`}
                    className="block text-center py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-xs text-gray-500">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs disabled:opacity-40 hover:bg-gray-100"
                >
                  Previous
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-xs disabled:opacity-40 hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
