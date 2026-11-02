"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

export default function MyLearningPage() {
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [enrolments, setEnrolments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated || !token) {
      router.push("/login");
      return;
    }

    let isMounted = true;
    setLoading(true);

    fetchApi("/me/enrolments", { token })
      .then((res) => {
        if (isMounted) setEnrolments(res?.data || []);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Failed to load enrolments");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, token, router]);

  if (authLoading || (isAuthenticated && loading)) {
    return <div className="py-16 text-center text-sm text-gray-500">Loading your learning...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">My Learning</h1>
          <p className="text-gray-600 text-sm mt-0.5">
            Learner: <span className="font-semibold text-black">{user?.name || user?.email}</span>
          </p>
        </div>

        <Link
          href="/"
          className="text-xs px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-100"
        >
          Catalogue →
        </Link>
      </div>

      {error && (
        <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded">
          {error}
        </div>
      )}

      {enrolments.length === 0 ? (
        <div className="py-12 text-center border border-gray-200 rounded p-6">
          <p className="text-sm text-gray-500">You are not enrolled in any courses yet.</p>
          <Link
            href="/"
            className="inline-block mt-3 px-4 py-2 bg-black text-white text-xs rounded hover:bg-gray-800"
          >
            Explore Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrolments.map((enrolment) => {
            const course = enrolment.course;
            const progress = enrolment.progress || {
              completed_lessons: 0,
              total_lessons: 0,
              percentage: 0,
            };

            return (
              <div
                key={enrolment.id}
                className="border border-gray-200 rounded p-5 bg-white flex flex-col justify-between hover:border-black transition"
              >
                <div className="space-y-3">
                  {course?.thumbnail_url && (
                    <div className="aspect-video w-full bg-gray-100 rounded overflow-hidden mb-2">
                      <img
                        src={course.thumbnail_url}
                        alt={course?.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex justify-between text-xs text-gray-500">
                    <span className="capitalize border border-gray-300 px-2 py-0.5 rounded font-mono">
                      {course?.level || "Course"}
                    </span>
                    <span>
                      {progress.completed_lessons} / {progress.total_lessons} done
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-black">{course?.title}</h2>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {course?.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span>{progress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-black h-full"
                        style={{ width: `${progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <Link
                    href={`/courses/${course?.slug}`}
                    className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
