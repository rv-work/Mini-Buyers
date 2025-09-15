import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buyerSchema, searchFiltersSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

const PAGE_SIZE = 10;

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl;

    const searchParams = url.searchParams;

    console.log("url : ", url);
    console.log("searchParams : ", searchParams);

    const filters = searchFiltersSchema.parse({
      search: searchParams.get("search") || undefined,
      city: searchParams.get("city") || undefined,
      propertyType: searchParams.get("propertyType") || undefined,
      status: searchParams.get("status") || undefined,
      timeline: searchParams.get("timeline") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
    });

    console.log("filters : ", filters);
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

    const [buyers, total] = await Promise.all([
      prisma.buyer.findMany({
        where,
        include: {
          owner: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip: (filters.page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.buyer.count({ where }),
    ]);

    console.log("buyers : ", buyers);
    console.log("buyers : ", total);

    return NextResponse.json({
      buyers,
      total,
      page: filters.page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    const rateLimitResult = rateLimit(`create-buyer-${user.id}`, 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const data = buyerSchema.parse(body);

    const buyer = await prisma.buyer.create({
      data: {
        ...data,
        email: data.email || null,
        ownerId: user.id,
      },
    });

    // Create history entry
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedBy: user.id,
        diff: { action: "created", data },
      },
    });

    return NextResponse.json(buyer, { status: 201 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating buyer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
