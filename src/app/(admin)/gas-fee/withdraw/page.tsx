"use client";

import React, { useEffect, useState } from "react";

export default function SponsorWalletPage() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  const [destWallet, setDestWallet] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch sponsor wallet balance on mount
  useEffect(() => {
    setLoadingBalance(true);
    fetch("/api/sponsor-wallet/total-sui")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.totalSui === "number") {
          setBalance(data.totalSui / 1_000_000_000); // Assuming SUI base units
        } else {
          setBalance(0);
        }
      })
      .catch(() => setBalance(0))
      .finally(() => setLoadingBalance(false));
  }, []);

  // Withdraw handler
  const handleWithdraw = async () => {
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!destWallet.trim()) {
      setError("Destination wallet address is required.");
      return;
    }
    if (
      !withdrawAmount ||
      isNaN(Number(withdrawAmount)) ||
      Number(withdrawAmount) <= 0
    ) {
      setError("Please enter a valid withdraw amount.");
      return;
    }
    if (balance !== null && Number(withdrawAmount) > balance) {
      setError("Withdraw amount exceeds current balance.");
      return;
    }

    setWithdrawing(true);
    try {
      const res = await fetch("/api/sponsor-wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destWallet,
          amount: Number(withdrawAmount), // Assuming amount in SUI
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Withdraw failed. Please try again.");
      } else {
        setSuccess("Withdraw successful!");
        setDestWallet("");
        setWithdrawAmount("");
        // Optionally, refresh balance
        setLoadingBalance(true);
        fetch("/api/sponsor-wallet/total-sui")
          .then((res) => res.json())
          .then((data) => {
            if (typeof data.totalSui === "number") {
              setBalance(data.totalSui / 1_000_000_000);
            }
          })
          .finally(() => setLoadingBalance(false));
      }
    } catch (e) {
      console.log(e);
      setError("Withdraw failed. Please try again.");
    }
    setWithdrawing(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sponsor Wallet Management</h1>
      <div className="bg-white p-6 rounded shadow mb-8 max-w-md mx-auto">
        <div className="mb-2">Current Sponsor Wallet Balance:</div>
        <div className="text-2xl font-mono mb-4 text-green-700">
          {loadingBalance ? (
            <span className="text-gray-400">Loading...</span>
          ) : balance !== null ? (
            `${balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 9,
            })} SUI`
          ) : (
            "$0.00"
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Destination Wallet Address
          </label>
          <input
            type="text"
            className="border rounded p-2 w-full"
            value={destWallet}
            onChange={(e) => setDestWallet(e.target.value)}
            disabled={withdrawing}
            placeholder="Enter destination wallet address"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Withdraw Amount (SUI)
          </label>
          <input
            type="number"
            className="border rounded p-2 w-full"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            disabled={withdrawing}
            min="0"
            step="0.01"
            placeholder="Enter amount to withdraw"
          />
        </div>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        {success && <div className="mb-2 text-green-600">{success}</div>}
        <button
          className={`px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 ${
            withdrawing ? "opacity-60 cursor-not-allowed" : ""
          }`}
          onClick={handleWithdraw}
          disabled={withdrawing}
        >
          {withdrawing ? "Withdrawing..." : "Withdraw (Admin Only)"}
        </button>
      </div>
    </div>
  );
}
