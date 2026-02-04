"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";

const initialState = {
  startDate: "",
  endDate: "",
  minDailyLimit: "",
  maxDailyLimit: "",
  percentVariance: "",
};

export default function TransactionLimitsPage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch current limits on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/limits/config`)
      .then((res) => {
        if (res.data) {
          const config = res.data.config;
          setForm({
            startDate: config?.startDate || "",
            endDate: config?.endDate || "",
            minDailyLimit: config?.minDailyLimit || "",
            maxDailyLimit: config?.maxDailyLimit || "",
            percentVariance: config?.percentVariance || "",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch limits configuration.");
        setLoading(false);
      });
  }, []);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form before submit
  const validate = () => {
    if (
      !form.startDate ||
      !form.endDate ||
      //   !form.minDailyLimit ||
      //   !form.maxDailyLimit ||
      !form.percentVariance
    ) {
      setError("All fields are required.");
      return false;
    }
    if (
      //   isNaN(Number(form.minDailyLimit)) ||
      //   isNaN(Number(form.maxDailyLimit)) ||
      isNaN(Number(form.percentVariance))
    ) {
      setError("Limits must be numbers.");
      return false;
    }
    // if (Number(form.minDailyLimit) > Number(form.maxDailyLimit)) {
    //   setError("Min daily limit cannot be greater than max daily limit.");
    //   return false;
    // }
    setError("");
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    if (!validate()) return;

    setSaving(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/users/limits/config`,
        {
          startDate: form.startDate,
          endDate: form.endDate,
          minDailyLimit: 10, // Number(form.minDailyLimit),
          maxDailyLimit: 100, // Number(form.maxDailyLimit),
          percentVariance: Number(form.percentVariance),
        }
      );
      setSuccess("Limits updated successfully.");
    } catch {
      setError("Failed to update limits.");
    }
    setSaving(false);
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-gray-50 py-10">
      <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Transaction Limits Configuration
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <span className="text-gray-500">Loading current limits...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                The date when the transaction limit becomes
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Limit End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                The date when the transaction limit expires
              </p>
            </div>
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Daily Limit
              </label>
              <input
                type="number"
                name="minDailyLimit"
                value={form.minDailyLimit}
                onChange={handleChange}
                required
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Daily Limit
              </label>
              <input
                type="number"
                name="maxDailyLimit"
                value={form.maxDailyLimit}
                onChange={handleChange}
                required
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Daily Limit (%)
              </label>
              <input
                type="number"
                name="percentVariance"
                value={form.percentVariance}
                onChange={handleChange}
                required
                min={1}
                max={100}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Percentage of daily transaction limit
              </p>
            </div>
            {error && (
              <div className="text-red-600 text-sm font-medium">{error}</div>
            )}
            {success && (
              <div className="text-green-600 text-sm font-medium">
                {success}
              </div>
            )}
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className={`w-full py-2 px-4 rounded-md text-white font-semibold transition ${
                  saving
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Saving..." : "Save Limits"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
