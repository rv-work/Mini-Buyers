import { NextResponse } from "next/server";
import {
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
} from "@prisma/client";

export async function GET() {
  // Headers must match CSV import columns
  const headers = [
    "fullName",
    "email",
    "phone",
    "city",
    "propertyType",
    "bhk",
    "purpose",
    "budgetMin",
    "budgetMax",
    "timeline",
    "source",
    "status",
    "notes",
    "tags",
  ];

  // Dummy row with valid enum values
  const sample = [
    "John Doe", // fullName
    "john@example.com", // email
    "9876543210", // phone
    City.Chandigarh, // city
    PropertyType.Apartment, // propertyType
    BHK.Two, // bhk (use enum value "2")
    Purpose.Buy, // purpose
    "3000000", // budgetMin
    "5000000", // budgetMax
    Timeline.ZeroToThreeMonths, // timeline
    Source.Website, // source
    Status.New, // status
    "Looking for 2BHK near IT Park", // notes
    "hot,priority", // tags
  ];

  const csvContent = `${headers.join(",")}\n${sample.join(",")}`;

  return new NextResponse(csvContent, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=buyers-template.csv",
    },
  });
}
