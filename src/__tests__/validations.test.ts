import { buyerSchema, csvRowSchema } from "../src/lib/validations";
import {
  City,
  PropertyType,
  Purpose,
  Timeline,
  Source,
  Status,
} from "@prisma/client";

describe("Buyer Validation", () => {
  it("should validate a complete buyer object", () => {
    const validBuyer = {
      fullName: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      city: City.Chandigarh,
      propertyType: PropertyType.Apartment,
      bhk: "Two" as any,
      purpose: Purpose.Buy,
      budgetMin: 5000000,
      budgetMax: 7000000,
      timeline: Timeline.ZeroToThreeMonths,
      source: Source.Website,
      status: Status.New,
      notes: "Looking for a 2BHK apartment",
      tags: ["urgent", "investor"],
    };

    const result = buyerSchema.parse(validBuyer);
    expect(result).toEqual(validBuyer);
  });

  it("should require BHK for Apartment and Villa", () => {
    const invalidBuyer = {
      fullName: "John Doe",
      phone: "1234567890",
      city: City.Chandigarh,
      propertyType: PropertyType.Apartment,
      // Missing BHK
      purpose: Purpose.Buy,
      timeline: Timeline.ZeroToThreeMonths,
      source: Source.Website,
    };

    expect(() => buyerSchema.parse(invalidBuyer)).toThrow();
  });

  it("should validate budget range correctly", () => {
    const invalidBuyer = {
      fullName: "John Doe",
      phone: "1234567890",
      city: City.Chandigarh,
      propertyType: PropertyType.Plot,
      purpose: Purpose.Buy,
      budgetMin: 7000000,
      budgetMax: 5000000, // Max < Min
      timeline: Timeline.ZeroToThreeMonths,
      source: Source.Website,
    };

    expect(() => buyerSchema.parse(invalidBuyer)).toThrow();
  });
});
