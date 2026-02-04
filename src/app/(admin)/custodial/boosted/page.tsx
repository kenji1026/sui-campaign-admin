"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type BoostedAddress = {
  address: string;
  tx_count: number;
};

type BoostedAddressesResponse = {
  date: string;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  boosted_address: BoostedAddress[];
};

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BoostedPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [data, setData] = useState<BoostedAddressesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Add date param to API request
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/boosted/${selectedDate}/${page}/${limit}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch boosted addresses");
        const json = await res.json();
        if (isMounted) setData(json);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Unknown error");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, limit, selectedDate]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (data && page < data.totalPages) setPage(page + 1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setPage(1); // Reset to first page when date changes
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">Boosted Wallets</h1>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="date" className="text-gray-700 font-medium">
          Select Date:
        </label>
        <input
          id="date"
          type="date"
          value={selectedDate}
          max={getTodayDateString()}
          onChange={handleDateChange}
          className="border rounded px-2 py-1"
        />
        <Link
          href={`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/boosted-csv/${selectedDate}`}
          target="_blank"
          rel="noopener noreferrer"
          type="button"
          className={`ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50`}
          download
        >
          Download CSV
        </Link>
      </div>
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && data && (
        <>
          <div className="w-full max-w-3xl mb-6">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Date: {data.date}</span>
              <span>
                Page {data.page} of {data.totalPages}
              </span>
              <span>Total: {data.total}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded shadow">
                <thead>
                  <tr>
                    <th className="px-4 py-2 border-b text-left">Address</th>
                    <th className="px-4 py-2 border-b text-left">Tx Count</th>
                  </tr>
                </thead>
                <tbody>
                  {data.boosted_address.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="p-4 text-center text-gray-400">
                        No boosted addresses found.
                      </td>
                    </tr>
                  ) : (
                    data.boosted_address.map((item) => (
                      <tr key={item.address}>
                        <td className="px-4 py-2 border-b break-all font-mono">
                          {item.address}
                        </td>
                        <td className="px-4 py-2 border-b text-center">
                          {item.tx_count > 0 ? item.tx_count : 1}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50`}
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={data.page >= data.totalPages}
              className={`px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
