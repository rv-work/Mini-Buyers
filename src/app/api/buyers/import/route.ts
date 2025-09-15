/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { csvRowSchema } from "@/lib/validations";
import {
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
} from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { rows } = await request.json();

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No data provided" }, { status: 400 });
    }

    if (rows.length > 200) {
      return NextResponse.json(
        { error: "Maximum 200 rows allowed" },
        { status: 400 }
      );
    }

    const results = [];
    const validRows: {
      city: City;
      propertyType: PropertyType;
      bhk: BHK | undefined;
      purpose: Purpose;
      timeline: Timeline;
      source: Source;
      status: Status;
      ownerId: string;
      fullName: string;
      phone: string;
      budgetMin: number | undefined;
      budgetMax: number | undefined;
      tags: string[];
      email?: string | undefined;
      notes?: string | undefined;
    }[] = [];

    // Validate each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const validatedRow = csvRowSchema.parse(row);

        // Additional business logic validation
        const errors = [];

        // Check BHK requirement for Apartment/Villa
        if (
          ["Apartment", "Villa"].includes(validatedRow.propertyType) &&
          !validatedRow.bhk
        ) {
          errors.push("BHK is required for Apartment and Villa properties");
        }

        // Budget validation
        if (
          validatedRow.budgetMin &&
          validatedRow.budgetMax &&
          validatedRow.budgetMin > validatedRow.budgetMax
        ) {
          errors.push("Maximum budget must be greater than minimum budget");
        }

        if (errors.length > 0) {
          results.push({
            row: i + 1,
            data: row,
            errors,
            success: false,
          });
        } else {
          validRows.push({
            ...validatedRow,
            city: validatedRow.city as City,
            propertyType: validatedRow.propertyType as PropertyType,
            bhk: validatedRow.bhk as BHK | undefined,
            purpose: validatedRow.purpose as Purpose,
            timeline: validatedRow.timeline as Timeline,
            source: validatedRow.source as Source,
            status: validatedRow.status as Status,
            ownerId: user.id,
          });

          results.push({
            row: i + 1,
            data: row,
            success: true,
          });
        }
      } catch (error: any) {
        const errorMessages = error.errors?.map(
          (e: any) => `${e.path.join(".")}: ${e.message}`
        ) || [error.message];
        results.push({
          row: i + 1,
          data: row,
          errors: errorMessages,
          success: false,
        });
      }
    }

    // Insert valid rows in a transaction
    let insertedCount = 0;
    if (validRows.length > 0) {
      try {
        await prisma.$transaction(async (tx) => {
          for (const rowData of validRows) {
            const buyer = await tx.buyer.create({
              data: {
                ...rowData,
                email: rowData.email || null,
              },
            });

            // Create history entry
            await tx.buyerHistory.create({
              data: {
                buyerId: buyer.id,
                changedBy: user.id,
                diff: { action: "imported", data: rowData },
              },
            });

            insertedCount++;
          }
        });
      } catch (error) {
        console.error("Transaction failed:", error);
        return NextResponse.json(
          { error: "Failed to insert data. Transaction rolled back." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: rows.length,
        success: validRows.length,
        errors: rows.length - validRows.length,
        inserted: insertedCount,
      },
    });
  } catch (error) {
    console.error("Error importing buyers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
