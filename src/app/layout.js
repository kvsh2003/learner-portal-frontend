import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Learner Portal",
  description: "Simple LMS Learner Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-black">
        <AuthProvider>
          <Suspense fallback={<div className="h-16 border-b border-gray-200" />}>
            <Navbar />
          </Suspense>

          <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
            <Suspense fallback={<div className="py-12 text-center text-sm text-gray-500">Loading...</div>}>
              {children}
            </Suspense>
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
