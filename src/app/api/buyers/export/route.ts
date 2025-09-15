import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchFiltersSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const filters = searchFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      status: searchParams.get("status") || undefined,
      timeline: searchParams.get("timeline") || undefined,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters.city) where.city = filters.city;
    if (filters.propertyType) where.propertyType = filters.propertyType;
    if (filters.status) where.status = filters.status;
    if (filters.timeline) where.timeline = filters.timeline;

    const buyers = await prisma.buyer.findMany({
      where,
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Convert to CSV format
    const csvHeader =
      "fullName,email,phone,city,propertyType,bhk,purpose,budgetMin,budgetMax,timeline,source,notes,tags,status\n";
    const csvData = buyers
      .map((buyer) => {
        const row = [
          `"${buyer.fullName}"`,
          `"${buyer.email || ""}"`,
          `"${buyer.phone}"`,
          `"${buyer.city}"`,
          `"${buyer.propertyType}"`,
          `"${buyer.bhk || ""}"`,
          `"${buyer.purpose}"`,
          `"${buyer.budgetMin || ""}"`,
          `"${buyer.budgetMax || ""}"`,
          `"${buyer.timeline}"`,
          `"${buyer.source}"`,
          `"${buyer.notes || ""}"`,
          `"${buyer.tags.join(",")}"`,
          `"${buyer.status}"`,
        ];
        return row.join(",");
      })
      .join("\n");

    const csv = csvHeader + csvData;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="buyers-export-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting buyers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
