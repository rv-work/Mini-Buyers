/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { buyerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import {
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
} from "@prisma/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const rateLimitResult = rateLimit(`update-buyer-${user.id}`, 10, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { updatedAt: clientUpdatedAt, ...updateData } = body;
    const data = buyerSchema.parse(updateData);

    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: params.id },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (existingBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (
      clientUpdatedAt &&
      new Date(clientUpdatedAt).getTime() !== existingBuyer.updatedAt.getTime()
    ) {
      return NextResponse.json(
        {
          error:
            "Record has been updated by another user. Please refresh and try again.",
        },
        { status: 409 }
      );
    }

    const updatePayload = {
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone,
      city: data.city as City,
      propertyType: data.propertyType as PropertyType,
      bhk: data.bhk ? (data.bhk as BHK) : undefined,
      purpose: data.purpose as Purpose,
      budgetMin: data.budgetMin ?? undefined,
      budgetMax: data.budgetMax ?? undefined,
      timeline: data.timeline as Timeline,
      source: data.source as Source,
      status: data.status as Status,
      notes: data.notes ?? undefined,
      tags: data.tags,
    };

    const buyer = await prisma.buyer.update({
      where: { id: params.id },
      data: updatePayload,
    });

    const diff = Object.keys(data).reduce((acc: any, key) => {
      const oldValue = (existingBuyer as any)[key];
      const newValue = (data as any)[key];
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        acc[key] = { from: oldValue, to: newValue };
      }
      return acc;
    }, {});

    if (Object.keys(diff).length > 0) {
      await prisma.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedBy: user.id,
          diff: { action: "updated", changes: diff },
        },
      });
    }

    return NextResponse.json(buyer);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating buyer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const existingBuyer = await prisma.buyer.findUnique({
      where: { id: params.id },
    });

    if (!existingBuyer) {
      return NextResponse.json({ error: "Buyer not found" }, { status: 404 });
    }

    if (existingBuyer.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.buyer.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Buyer deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting buyer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
