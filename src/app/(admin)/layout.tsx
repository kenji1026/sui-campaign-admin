"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // State to control which menu is open
  const [openMenu, setOpenMenu] = useState<string | null>("sponsor");

  // Helper to toggle open menu
  const handleToggle = (menu: string) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-600">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col py-8 px-4">
        <div className="text-2xl font-bold mb-8 text-blue-600">Admin Panel</div>
        <nav className="flex flex-col gap-2">
          {/* Users Menu */}
          {/* <div>
            <button
              type="button"
              className="w-full flex items-center justify-between py-2 px-4 rounded hover:bg-gray-100 transition font-medium"
              onClick={() => handleToggle("users")}
              aria-expanded={openMenu === "users"}
              aria-controls="users-submenu"
            >
              <span>Users</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  openMenu === "users" ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {openMenu === "users" && (
              <div id="users-submenu" className="ml-4 flex flex-col gap-1">
                <Link
                  href="/user-management"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  User Management
                </Link>
              </div>
            )}
          </div> */}
          {/* Wallets Menu */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-between py-2 px-4 rounded hover:bg-gray-100 transition font-medium"
              onClick={() => handleToggle("wallets")}
              aria-expanded={openMenu === "wallets"}
              aria-controls="wallets-submenu"
            >
              <span>Wallets</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  openMenu === "wallets" ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {openMenu === "wallets" && (
              <div id="wallets-submenu" className="ml-4 flex flex-col gap-1">
                <Link
                  href="/custodial/wallets"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Today Wallets
                </Link>
                <Link
                  href="/custodial/boosted"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Boosted Wallets
                </Link>
                <Link
                  href="/custodial/limited"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Limit Wallets
                </Link>
              </div>
            )}
          </div>
          {/* Sponsor Menu */}
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-between py-2 px-4 rounded hover:bg-gray-100 transition font-medium"
              onClick={() => handleToggle("sponsor")}
              aria-expanded={openMenu === "sponsor"}
              aria-controls="sponsor-submenu"
            >
              <span>Gas Station</span>
              <svg
                className={`w-4 h-4 ml-2 transition-transform ${
                  openMenu === "sponsor" ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            {openMenu === "sponsor" && (
              <div id="sponsor-submenu" className="ml-4 flex flex-col gap-1">
                <Link
                  href="/gas-fee/notification"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Email Notification
                </Link>
                <Link
                  href="/gas-fee/rebate"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Gas Fee Rebate
                </Link>
                <Link
                  href="/gas-fee/report"
                  className="py-2 px-4 rounded hover:bg-gray-100 transition text-sm"
                >
                  Gas Fee Report
                </Link>
              </div>
            )}
          </div>
        </nav>
        <div className="flex-1" />
        <Link
          href="/api/auth/signout"
          className="mt-5 py-2 px-4 text-center bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Logout
        </Link>
      </aside>
      {/* Main content */}
      <main className="flex-1 p-10 overflow-auto">{children}</main>
    </div>
  );
}
