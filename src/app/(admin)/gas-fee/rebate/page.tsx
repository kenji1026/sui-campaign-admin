"use client";

import React, { useState, useEffect } from "react";

// Utility to format numbers as currency
function formatCurrency(val: number) {
  val = val / 1_000_000_000;
  return (
    val.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 9,
    }) + " SUI"
  );
}

export default function GasFeeRebatePage() {
  const [stats, setStats] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [rebateTotalSui, setRebateTotalSui] = useState<number | null>(null);
  const [rebateWalletAddress, setRebateWalletAddress] = useState<string | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch rebate wallet address, balance and stats together on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Function to fetch stats
  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rebate/stats`
      );
      const data = await res.json();
      setStats(Boolean(data.stats));
      setRebateWalletAddress(data.address);
      setRebateTotalSui(Number(data.balance));
    } catch {
      // Optionally handle error
    } finally {
      setLoading(false);
    }
  };

  // Start rebate
  const handleStartRebate = async () => {
    setActionLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rebate/start`,
        { method: "POST" }
      );
      await fetchStatus();
    } catch {
      // Optionally handle error
    } finally {
      setActionLoading(false);
    }
  };

  // Stop rebate
  const handleStopRebate = async () => {
    setActionLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/rebate/stop`,
        { method: "POST" }
      );
      await fetchStatus();
    } catch {
      // Optionally handle error
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="w-full flex justify-center mb-8">
        <div className="bg-blue-50 rounded px-8 py-4 shadow text-center">
          <div className="text-3xl font-bold text-gray-600 mb-1">
            Rebate Wallet
          </div>
          <div className="text-x text-gray-500 mb-2 break-all">
            {rebateWalletAddress !== null ? rebateWalletAddress : "Unknown"}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="text-gray-600 text-sm font-medium">
              Total SUI Balance
            </div>
            <button
              className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              onClick={fetchStatus}
              title="Refresh balance"
            >
              Refresh
            </button>
          </div>
          <div className="text-2xl font-bold text-blue-800 font-mono">
            {rebateTotalSui !== null
              ? formatCurrency(rebateTotalSui)
              : "Loading..."}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">Gas Fee Rebate</h1>
        <div className="bg-white rounded p-6 shadow flex flex-col md:flex-row gap-4 items-center">
          <button
            className="px-4 py-2 bg-green-600 text-white rounded shadow hover:bg-green-700 disabled:opacity-50"
            onClick={handleStartRebate}
            disabled={stats || actionLoading}
          >
            Start Rebate
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 disabled:opacity-50"
            onClick={handleStopRebate}
            disabled={!stats || actionLoading}
          >
            Stop Rebate
          </button>
        </div>
      </div>

      {/* Status label at the bottom */}
      <div className="mt-8 flex justify-center">
        <span
          className={`px-4 py-2 rounded font-semibold ${
            stats
              ? "bg-green-100 text-green-700 border border-green-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {stats ? "Rebate is running" : "Rebate is stopped"}
        </span>
      </div>
    </div>
  );
}
