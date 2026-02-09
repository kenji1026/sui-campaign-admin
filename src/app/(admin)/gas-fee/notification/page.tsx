"use client";

import React, { useState, useEffect } from "react";

function validateEmail(email: string): boolean {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate all emails in array
function validateEmails(emails: string[]): boolean {
  return emails.length > 0 && emails.every((e) => validateEmail(e));
}

// Parse comma-separated emails into array, trimming whitespace and removing empties
function parseEmails(input: string): string[] {
  return input
    .split(",")
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
}

function emailsToDisplayString(emails: string[]): string {
  return emails.join(", ");
}

function validateMinSui(minSui: string): boolean {
  const value = parseFloat(minSui);
  return !isNaN(value) && value > 0;
}

function validateMonitorPeriod(monitorPeriod: string): boolean {
  const value = parseInt(monitorPeriod, 10);
  return !isNaN(value) && value > 0;
}

export default function EmailNotificationPage() {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [minSui, setMinSui] = useState("100");
  const [monitorPeriod, setMonitorPeriod] = useState("1");
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch current stats on mount
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sponsor/notification/stats`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails }),
          }
        );
        if (!res.ok) throw new Error("Failed to fetch stats");
        const data = await res.json();
        setIsMonitoring(Boolean(data.stats));
        // If server returns emails, update input and emails state
        if (Array.isArray(data.emails)) {
          setEmails(data.emails);
          setEmailInput(emailsToDisplayString(data.emails));
        }

        setMinSui(
          data.minSUI !== undefined && data.minSUI !== null
            ? String(data.minSUI)
            : "100"
        );
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleStart = async () => {
    setError(null);
    setSuccess(null);

    const parsedEmails = parseEmails(emailInput);

    if (!validateEmails(parsedEmails)) {
      setError("Please enter valid email addresses, separated by commas.");
      return;
    }

    // Input validation
    if (!validateEmails(parsedEmails)) {
      setError("Please enter valid email addresses, separated by commas.");
      return;
    }
    if (!validateMinSui(minSui)) {
      setError("Please enter a valid minimum SUI greater than 0.");
      return;
    }
    if (!validateMonitorPeriod(monitorPeriod)) {
      setError("Please enter a valid monitor period (hours) greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sponsor/notification/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emails: parsedEmails,
            minSui: parseFloat(minSui),
            monitorPeriod: parseInt(monitorPeriod, 10),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to start notification");
      const data = await res.json();
      if (data.stats === true) {
        setIsMonitoring(true);
        setSuccess("Notification started successfully.");
      } else {
        setIsMonitoring(false);
        setError("Failed to start notification service.");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setError(null);
    setSuccess(null);

    const parsedEmails = parseEmails(emailInput);

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/sponsor/notification/stop`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: parsedEmails }),
        }
      );
      if (!res.ok) throw new Error("Failed to stop notification");
      const data = await res.json();
      if (data.stats === false) {
        setIsMonitoring(false);
        setSuccess("Notification stopped successfully.");
      } else {
        setIsMonitoring(true);
        setError("Failed to stop notification service.");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Email Notification</h1>
      <div className="mb-4">
        <label className="block font-medium mb-1">Email Address</label>
        <input
          type="email"
          className="w-full border px-3 py-2 rounded"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="email1@example.com, email2@example.com"
          disabled={isMonitoring}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Min SUI</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded"
          value={minSui}
          onChange={(e) => setMinSui(e.target.value)}
          placeholder="e.g. 100"
          min="0"
          step="any"
          disabled={isMonitoring}
        />
      </div>
      <div className="mb-4">
        <label className="block font-medium mb-1">Monitor Period (hours)</label>
        <input
          type="number"
          className="w-full border px-3 py-2 rounded"
          value={monitorPeriod}
          onChange={(e) => setMonitorPeriod(e.target.value)}
          placeholder="e.g. 24"
          min="1"
          step="1"
          disabled={isMonitoring}
        />
      </div>
      <div className="mb-4">
        <span className="block font-medium mb-1">Current Status:</span>
        {statsLoading ? (
          <span className="text-gray-500">Loading status...</span>
        ) : isMonitoring ? (
          <span className="text-green-600 font-semibold">
            Monitoring Active
          </span>
        ) : (
          <span className="text-red-600 font-semibold">
            Monitoring Inactive
          </span>
        )}
      </div>
      <div className="flex gap-4">
        {!isMonitoring ? (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            onClick={handleStart}
            disabled={loading}
          >
            {loading ? "Starting..." : "Start Notification"}
          </button>
        ) : (
          <button
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            onClick={handleStop}
            disabled={loading}
          >
            {loading ? "Stopping..." : "Stop Notification"}
          </button>
        )}
      </div>
      {error && <div className="text-red-600 mt-4">{error}</div>}
      {success && <div className="text-green-600 mt-4">{success}</div>}
    </div>
  );
}
