"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="p-8 bg-white rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-600">
          Login
        </h1>
        <button
          className="w-full py-4 px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
          onClick={() => signIn("google", { callbackUrl: "/gas-fee/report" })}
        >
          <div className="flex items-center justify-center">
            <Image
              className=""
              src="/google.svg"
              alt="Google logo"
              width={24}
              height={24}
              priority
            />
            <span className="text-white px-6">Sign in with Google</span>
          </div>
        </button>
      </div>
    </div>
  );
}
