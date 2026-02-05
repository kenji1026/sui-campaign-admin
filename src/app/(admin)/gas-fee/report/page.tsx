"use client";

import React, { useEffect, useState } from "react";

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
function formatNum(val: number) {
  return val.toLocaleString();
}

function getTotalRequests(sponsorStats: ApiResponse | null) {
  const totalRequests =
    (sponsorStats?.txRegRequested || 0) +
    (sponsorStats?.txLoginRequested || 0) +
    (sponsorStats?.txReferRequested || 0) +
    (sponsorStats?.txCancelled || 0);

  return totalRequests;
}

function getExecutionRatio(sponsorStats: ApiResponse | null) {
  const totalRequests =
    (sponsorStats?.txRegRequested || 0) +
    (sponsorStats?.txLoginRequested || 0) +
    (sponsorStats?.txReferRequested || 0) +
    (sponsorStats?.txCancelled || 0);
  const totalRealExecutions = sponsorStats?.txExecuted || 0;
  const totalCancelled = sponsorStats?.txCancelled || 0;
  const totalRealRequests = totalRequests - totalCancelled;

  return totalRequests > 0
    ? ((totalRealExecutions / totalRealRequests) * 100).toFixed(2) + " %"
    : "N/A";
}

function getTotalFailed(sponsorStats: ApiResponse | null) {
  const totalFailed =
    (sponsorStats?.txRegFailed || 0) +
    (sponsorStats?.txReferFailed || 0) +
    (sponsorStats?.txLoginFailed || 0);

  return totalFailed;
}

type ApiResponse = {
  gasUsed: number;
  txExecuted: number;
  txCancelled: number;
  txLimited: number;
  txRegRequested: number;
  txLoginRequested: number;
  txReferRequested: number;
  txRegFailed: number;
  txLoginFailed: number;
  txReferFailed: number;
  walletActived: number;
  walletBoosted: number;
};

export default function GasFeeReportPage() {
  const [stats, setStats] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dailyDate, setDailyDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  });
  const [sponsorTotalSui, setSponsorTotalSui] = useState<number | null>(null);
  const [sponsorWalletAddress, setSponsorWalletAddress] = useState<
    string | null
  >(null);

  // Fetch sponsor wallet total SUI on mount
  const fetchBalance = async () => {
    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sponsor/wallet/sui`)
      .then((res) => res.json())
      .then((data) => {
        setSponsorTotalSui(Number(data.totalSUI));
        setSponsorWalletAddress(data.address);
      })
      .catch(() => setSponsorTotalSui(0))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    setLoading(true);
    // Fetch today, monthly, and total in one call
    fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sponsor/daily/${dailyDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .finally(() => setLoading(false));
  }, [dailyDate]);

  // if (loading && !stats)
  //   return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div>
      {/* --- Top Center Sponsor Wallet SUI Display --- */}
      <div className="w-full flex justify-center mb-8">
        <div className="bg-blue-50 rounded px-8 py-4 shadow text-center">
          <div className="text-3xl font-bold text-gray-600 mb-1">
            Sponsor Wallet
          </div>
          <div className="text-x text-gray-500 mb-2 break-all">
            {sponsorWalletAddress !== null ? sponsorWalletAddress : "Unknown"}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <div className="text-gray-600 text-sm font-medium">
              Total SUI Balance
            </div>
            <button
              className="ml-2 px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
              onClick={fetchBalance}
              title="Refresh balance"
            >
              Refresh
            </button>
          </div>
          <div className="text-2xl font-bold text-blue-800 font-mono">
            {sponsorTotalSui !== null
              ? formatCurrency(sponsorTotalSui)
              : "Loading..."}
          </div>
        </div>
      </div>

      <h1 className="text-2xl text-gray-600 font-bold mb-6">Gas Fee Report</h1>
      <div className="mb-6 flex flex-wrap gap-8 items-end">
        <div>
          <div className="text-sm text-gray-600">Select date (today):</div>
          <input
            type="date"
            className="border rounded p-2 text-gray-600"
            value={dailyDate}
            onChange={(e) => setDailyDate(e.target.value)}
          />
        </div>
        {/* ... (rest of your controls, unchanged) */}
      </div>
      <div className="bg-white rounded p-6 shadow grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div>
          <div className="text-gray-500">Gas Usage</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatCurrency(stats?.gasUsed ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(getTotalRequests(stats))}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Executions</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txExecuted ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Execution Ratio</div>
          <div className="text-2xl text-blue-700 font-mono">
            {getExecutionRatio(stats)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded p-6 shadow grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div>
          <div className="text-gray-500">Total Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(getTotalRequests(stats))}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Limited Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txLimited ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Registration Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txRegRequested ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Login Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txLoginRequested ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Referral Requests</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txReferRequested ?? 0)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded p-6 shadow grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div>
          <div className="text-gray-500">Total Executions</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum((stats?.txExecuted ?? 0) + getTotalFailed(stats))}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Successful Executions</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txExecuted ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Registration Failed</div>
          <div className="text-2xl text-blue-700 font-mono">
            {/* {formatNum(stats?.txRegFailed ?? 0)} */}0
          </div>
        </div>
        <div>
          <div className="text-gray-500">Login Failed</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txLoginFailed ?? 0)}
          </div>
        </div>
        <div>
          <div className="text-gray-500">Referral Failed</div>
          <div className="text-2xl text-blue-700 font-mono">
            {formatNum(stats?.txReferFailed ?? 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
