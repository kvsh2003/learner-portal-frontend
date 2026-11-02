"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-black">
          Learner Portal
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/"
            className={pathname === "/" ? "font-semibold text-black" : "text-gray-600 hover:text-black"}
          >
            Courses
          </Link>

          {mounted && isAuthenticated && (
            <Link
              href="/my-learning"
              className={pathname === "/my-learning" ? "font-semibold text-black" : "text-gray-600 hover:text-black"}
            >
              My Learning
            </Link>
          )}

          <div className="flex items-center gap-3 pl-3 border-l border-gray-200 min-h-[30px]">
            {mounted ? (
              isAuthenticated ? (
                <>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={() => logout(true)}
                    className="px-3 py-1.5 border border-gray-300 text-xs rounded hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800"
                >
                  Login
                </Link>
              )
            ) : (
              <div className="w-12 h-6" />
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
