import React from 'react';
import {
  PackageCheck,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ExternalLink,
  ArrowLeft,
  Navigation,
} from 'lucide-react';

interface OrderStatusViewProps {
  orderId?: number;
  onBackToShop: () => void;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({
  orderId = 44322,
  onBackToShop,
}) => {
  return (
    <div className="bg-white dark:bg-urban-darker min-h-screen text-slate-900 dark:text-white transition-colors py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back navigation */}
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Store</span>
        </button>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight font-heading">
            Order Status
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time delivery fulfillment coordinates for Order #{orderId}
          </p>
        </div>

        {/* ========================================================================= */}
        {/* VISUAL ORDER STEPPER (Matching Image 7: Ordered -> Shipped -> Delivered) */}
        {/* ========================================================================= */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative flex items-center justify-between">
            {/* Connecting Bar */}
            <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
            <div className="absolute left-8 w-1/2 top-1/2 -translate-y-1/2 h-0.5 bg-brand-500 -z-0" />

            {/* Step 1: Ordered (Completed) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold mt-2">Ordered</span>
              <span className="text-[10px] text-slate-400 font-mono">9:30 AM, Today</span>
            </div>

            {/* Step 2: Shipped (In Progress) */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-brand-500 text-white flex items-center justify-center ring-4 ring-brand-500/20 shadow-md animate-pulse">
                <Truck className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold mt-2 text-brand-600 dark:text-brand-400">Shipped</span>
              <span className="text-[10px] text-brand-500 font-mono">In Transit</span>
            </div>

            {/* Step 3: Delivered (Pending) */}
            <div className="relative z-10 flex flex-col items-center opacity-40">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <PackageCheck className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-xs font-bold mt-2">Delivered</span>
              <span className="text-[10px] text-slate-400 font-mono">Est. Tomorrow</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CARD: Shipping Information + Map Graphic (Matching Image 7) */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Details */}
          <div className="md:col-span-5 p-6 sm:p-8 space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
              Shipping Information
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Recipient Name</span>
                <p className="font-bold text-slate-900 dark:text-white">Alex Rivera</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Destination Address</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  8080 Railroad St., Suite 400, New York, NY 10001
                </p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Phone Contact</span>
                <p className="font-mono font-bold text-slate-900 dark:text-white">+1 (555) 234-5678</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Logistics Courier</span>
                <p className="font-bold text-slate-900 dark:text-white">DHL Express Priority / RSKL</p>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">Tracking Number</span>
                <a
                  href="#track"
                  onClick={(e) => e.preventDefault()}
                  className="font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1.5"
                >
                  <span>TRK-982187-USV</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Stylized Map View (Matching Image 7) */}
          <div className="md:col-span-7 bg-slate-100 dark:bg-slate-950 relative min-h-[320px] flex items-center justify-center overflow-hidden border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800">
            {/* SVG Vector Map Rendering */}
            <svg
              className="w-full h-full object-cover opacity-80"
              viewBox="0 0 600 350"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Water background */}
              <rect width="600" height="350" fill="#E0F2FE" />
              {/* Landmass */}
              <path
                d="M 120 0 L 600 0 L 600 350 L 220 350 Q 200 280 180 200 Q 150 120 120 0 Z"
                fill="#F1F5F9"
              />
              {/* Roads / Highways */}
              <path d="M 150 50 Q 300 120 500 100" stroke="#CBD5E1" strokeWidth="6" fill="none" />
              <path d="M 220 350 Q 320 200 450 50" stroke="#CBD5E1" strokeWidth="5" fill="none" />
              <path d="M 180 220 L 550 250" stroke="#CBD5E1" strokeWidth="4" fill="none" />
              <path d="M 350 0 L 380 350" stroke="#CBD5E1" strokeWidth="3" fill="none" />
              {/* Route line */}
              <path
                d="M 280 160 Q 340 180 430 190"
                stroke="#E6007E"
                strokeWidth="4"
                strokeDasharray="6 4"
                fill="none"
              />
            </svg>

            {/* Map Top Switchers */}
            <div className="absolute top-4 left-4 flex rounded-lg bg-white/90 dark:bg-slate-900/90 p-0.5 border border-slate-200 dark:border-slate-700 shadow-sm text-[11px] font-semibold">
              <span className="px-2.5 py-1 rounded bg-black text-white">Map</span>
              <span className="px-2.5 py-1 text-slate-600 dark:text-slate-400">Satellite</span>
            </div>

            {/* Location Landmarks on Map */}
            <div className="absolute top-1/2 left-1/3 -translate-y-6 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md text-[10px] font-bold">
              <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              <span>Courier Hub #4</span>
            </div>

            <div className="absolute top-1/2 right-1/4 translate-y-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-white shadow-lg text-[10px] font-bold">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Delivery Destination</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
