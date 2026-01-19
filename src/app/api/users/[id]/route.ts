/// /src/app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const client = await clientPromise;
  const db = client.db();
  const body = await request.json();
  const { role, active } = body;
  await db.collection("administrators").updateOne(
    { _id: new ObjectId(userId) },
    {
      $set: {
        ...(role && { role }),
        ...(typeof active === "boolean" && { active }),
      },
    }
  );
  return NextResponse.json({ success: true });
}
