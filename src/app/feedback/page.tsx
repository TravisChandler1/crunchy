"use client";
import Link from "next/link";
import FeedbackSystem from "../FeedbackSystem";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full bg-[#7ed957] text-white py-6 px-8 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Customer Feedback</h1>
          <Link 
            href="/" 
            className="px-4 py-2 bg-black text-[#7ed957] rounded-lg hover:bg-[#45523e] hover:text-white transition font-medium"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <FeedbackSystem />
      </main>

      {/* Footer */}
      <footer className="bg-[#45523e] text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-bold text-[#7ed957] mb-2">Thank You!</h3>
          <p className="text-gray-300">
            Your feedback helps us improve our products and service. We appreciate you taking the time to share your experience with Crunchy Cruise Snacks!
          </p>
        </div>
      </footer>
    </div>
  );
}