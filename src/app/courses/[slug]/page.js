"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug;

  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [progress, setProgress] = useState(null);
  const [enrolLoading, setEnrolLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchApi(`/courses/${slug}`)
      .then((res) => {
        if (isMounted) setCourse(res?.data || null);
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.status === 404 ? "Course not found or unpublished." : err.message);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!isAuthenticated || !token || !course) return;

    fetchApi("/me/enrolments", { token })
      .then((res) => {
        const enrolments = res?.data || [];
        const thisEnrolment = enrolments.find((e) => e.course?.id === course.id);
        if (thisEnrolment) {
          setIsEnrolled(true);
          setProgress(thisEnrolment.progress);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, token, course]);

  async function handleEnrol() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setEnrolLoading(true);

    try {
      await fetchApi(`/courses/${course.id}/enrol`, {
        method: "POST",
        token,
      });

      setIsEnrolled(true);

      const totalLessons = course.modules?.reduce(
        (acc, mod) => acc + (mod.lessons?.length || 0),
        0
      ) || 0;

      setProgress({
        completed_lessons: 0,
        total_lessons: totalLessons,
        percentage: 0,
      });
    } catch (err) {
      alert(err.message || "Failed to enrol");
    } finally {
      setEnrolLoading(false);
    }
  }

  async function handleMarkComplete(lessonId) {
    if (!isAuthenticated || !isEnrolled) return;

    try {
      const res = await fetchApi(`/lessons/${lessonId}/complete`, {
        method: "POST",
        token,
      });

      setCompletedLessonIds((prev) => new Set([...prev, lessonId]));

      if (res?.data?.progress) {
        setProgress(res.data.progress);
      }
    } catch (err) {
      alert(err.message || "Failed to complete lesson");
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-sm text-gray-500">Loading course details...</div>;
  }

  if (error || !course) {
    return (
      <div className="py-12 text-center border border-gray-200 rounded p-6">
        <h2 className="text-lg font-bold text-black">Unavailable</h2>
        <p className="text-xs text-gray-500 mt-1">{error || "Course could not be loaded."}</p>
        <Link href="/" className="inline-block mt-4 text-xs underline text-black">
          ← Back to catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/" className="text-xs text-gray-500 hover:text-black">
        ← Back to courses
      </Link>

      {/* Header Card */}
      <div className="border border-gray-200 rounded p-6 bg-gray-50 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row gap-5 flex-1">
          {course.thumbnail_url && (
            <div className="w-full sm:w-48 aspect-video bg-gray-100 rounded overflow-hidden shrink-0">
              <img
                src={course.thumbnail_url}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}
          <div className="space-y-2">
            <span className="capitalize border border-gray-300 px-2 py-0.5 rounded text-xs font-mono bg-white">
              {course.level || "General"}
            </span>
            <h1 className="text-2xl font-bold text-black">{course.title}</h1>
            <p className="text-sm text-gray-600 max-w-xl">{course.description}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded min-w-[200px] text-center shrink-0">
          {isEnrolled ? (
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-black">
                ✓ Enrolled
              </span>
              {progress && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-black h-full"
                      style={{ width: `${progress.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    {progress.completed_lessons} / {progress.total_lessons} completed
                  </span>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleEnrol}
              disabled={enrolLoading}
              className="w-full py-2 bg-black text-white text-xs font-medium rounded hover:bg-gray-800 disabled:opacity-50"
            >
              {enrolLoading ? "Enrolling..." : "Enrol in Course"}
            </button>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-black">Curriculum</h2>

        {course.modules?.map((mod, modIdx) => (
          <div key={mod.id} className="border border-gray-200 rounded overflow-hidden">
            <div className="bg-gray-100 px-4 py-2.5 text-xs font-semibold text-black">
              Module {mod.position ?? modIdx + 1}: {mod.title}
            </div>

            <div className="divide-y divide-gray-100 bg-white">
              {mod.lessons?.map((lesson, lessonIdx) => {
                const isCompleted = completedLessonIds.has(lesson.id);

                return (
                  <div
                    key={lesson.id}
                    className="p-3.5 flex items-center justify-between gap-4 text-sm"
                  >
                    <div>
                      <span className="text-xs text-gray-400 font-mono mr-2">
                        {lesson.position ?? lessonIdx + 1}.
                      </span>
                      <span className="font-medium text-black">{lesson.title}</span>
                      <span className="ml-2 text-xs text-gray-400 capitalize">
                        ({lesson.type || "reading"}, {lesson.duration_minutes || 5} min)
                      </span>
                    </div>

                    {isEnrolled && (
                      <div>
                        {isCompleted ? (
                          <span className="text-xs text-gray-500 font-medium">✓ Completed</span>
                        ) : (
                          <button
                            onClick={() => handleMarkComplete(lesson.id)}
                            className="px-2.5 py-1 border border-black text-xs rounded hover:bg-black hover:text-white"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
