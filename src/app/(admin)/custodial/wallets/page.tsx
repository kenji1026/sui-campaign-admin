"use client";

import React, { useEffect, useState } from "react";

// Types for wallet data and API response
type Address = {
  address: string;
  tx_count: number;
  created_at: string;
};

type WalletsApiResponse = {
  address: Address[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  date: string;
};

// Helper to get today's date in YYYY-MM-DD format
function getTodayDateString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CustodialWalletsPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [date] = useState(getTodayDateString());

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Replace with your actual API endpoint
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/custodial/${date}/${page}/${limit}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch wallets");
        const json: WalletsApiResponse = await res.json();
        if (isMounted) {
          setAddresses(json.address);
          setTotalPages(json.totalPages);
          setTotal(json.total);
        }
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
  }, [page, limit, date]);

  const handlePrev = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] w-full">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">
        Today's Custodial Wallets
      </h1>
      <div className="mb-2 text-gray-500">
        Date: <span className="font-mono">{date}</span>
      </div>
      {loading && <div className="text-gray-500 mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {!loading && !error && (
        <div className="w-full max-w-3xl">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <span>Total: {total}</span>
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
                {addresses.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-4 text-center text-gray-400">
                      No wallets found for today.
                    </td>
                  </tr>
                ) : (
                  addresses.map((wallet) => (
                    <tr key={wallet.address}>
                      <td className="px-4 py-2 border-b break-all font-mono">
                        {wallet.address}
                      </td>
                      <td className="px-4 py-2 border-b text-center">
                        {wallet.tx_count}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={handlePrev}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Prev
            </button>
            <button
              onClick={handleNext}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 
import React from "react";

export default function NotImplementedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh]">
      <h1 className="text-3xl font-bold text-gray-700 mb-4">Not Implemented</h1>
      <p className="text-gray-500 text-lg mb-8">
        This page is under construction and will be available soon.
      </p>
      <div className="text-6xl mb-4">🚧</div>
    </div>
  );
}
  
 */
