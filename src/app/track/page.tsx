"use client";
import OrderTracker from "../OrderTracker";

export default function TrackPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full bg-[#7ed957] text-white py-6 px-8 shadow">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide">Track Your Order</h1>
          <a 
            href="/" 
            className="px-4 py-2 bg-black text-[#7ed957] rounded-lg hover:bg-[#45523e] hover:text-white transition font-medium"
          >
            Back to Home
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4">
        <OrderTracker />
      </main>

      {/* Footer */}
      <footer className="bg-[#45523e] text-white py-8 px-4 mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-bold text-[#7ed957] mb-2">Need Help?</h3>
          <p className="text-gray-300 mb-4">
            If you have any questions about your order, don't hesitate to contact us.
          </p>
          <div className="flex justify-center gap-4">
            <a 
              href="tel:+2348012345678" 
              className="px-6 py-2 bg-[#7ed957] text-[#45523e] rounded-lg hover:bg-white transition font-medium"
            >
              Call Us
            </a>
            <a 
              href="https://wa.me/2348012345678" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}