import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function getPeriod(date: Date, period: "day" | "month") {
  if (period === "day") {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  } else {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}

export async function GET(request: NextRequest) {
  const client = await clientPromise;
  const db = client.db();
  const now = new Date();

  // Parse date param for daily report
  const { searchParams } = new URL(request.url);
  const dateString = searchParams.get("date");
  let dateParam = new Date(dateString!);

  // Check if the date is valid
  if (isNaN(dateParam.getTime())) {
    dateParam = now;
  }

  // Pipeline for total stats
  const totalStats = await db
    .collection("sponsortransaction")
    .aggregate([
      {
        $group: {
          _id: null,
          totalGas: { $sum: "$gasReal" },
          totalTxs: { $sum: 1 },
        },
      },
    ])
    .toArray();

  // Pipeline for day stats
  // Create start and end date for the specified day
  const startDate = new Date(dateParam);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(dateParam);
  endDate.setHours(23, 59, 59, 999);
  const dayStats = await db
    .collection("sponsortransaction")
    .aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalGas: { $sum: "$gasReal" },
          totalTxs: { $sum: 1 },
        },
      },
    ])
    .toArray();

  const yearParam = dateParam.getFullYear();
  const monthParam = dateParam.getMonth() + 1;

  // Pipeline for day stats
  let monthStats = { totalGas: 0, totalTxs: 0 };
  if (
    !isNaN(yearParam) &&
    !isNaN(monthParam) &&
    monthParam >= 1 &&
    monthParam <= 12
  ) {
    const monthStart = new Date(yearParam, monthParam - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(yearParam, monthParam, 1, 0, 0, 0, 0);

    const result = await db
      .collection("sponsortransaction")
      .aggregate([
        {
          $match: {
            timestamp: { $gte: monthStart, $lt: monthEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalGas: { $sum: "$gasReal" },
            totalTxs: { $sum: 1 },
          },
        },
      ])
      .toArray();

    monthStats = {
      totalGas: result[0]?.totalGas || 0,
      totalTxs: result[0]?.totalTxs || 0,
    };
  }

  // Pipeline for day stats
  let yearStats = { totalGas: 0, totalTxs: 0 };
  if (!isNaN(yearParam)) {
    const yearStart = new Date(yearParam, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(yearParam + 1, 0, 1, 0, 0, 0, 0);

    const result = await db
      .collection("sponsortransaction")
      .aggregate([
        {
          $match: {
            timestamp: { $gte: yearStart, $lt: yearEnd },
          },
        },
        {
          $group: {
            _id: null,
            totalGas: { $sum: "$gasReal" },
            totalTxs: { $sum: 1 },
          },
        },
      ])
      .toArray();

    yearStats = {
      totalGas: result[0]?.totalGas || 0,
      totalTxs: result[0]?.totalTxs || 0,
    };
  }

  return NextResponse.json({
    totalStats: {
      totalGas: totalStats[0]?.totalGas || 0,
      totalTxs: totalStats[0]?.totalTxs || 0,
    },
    dayStats: {
      totalGas: dayStats[0]?.totalGas || 0,
      totalTxs: dayStats[0]?.totalTxs || 0,
    },
    monthStats,
    yearStats,
  });
}
