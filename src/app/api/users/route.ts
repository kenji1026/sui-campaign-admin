/// /src/app/api/users/route.ts
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  // NextAuth MongoDBAdapter creates 'users' collection by default
  const users = await db.collection("administrators").find({}).toArray();
  // Only expose necessary fields!
  return NextResponse.json(
    users.map(({ _id, name, email, image, emailVerified, role, active }) => ({
      id: _id,
      name,
      email,
      image,
      emailVerified,
      role: role ?? "user",
      active: active ?? true,
    }))
  );
}
