import { z } from "zod";
import {
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
} from "@prisma/client";

const createEnumArray = <T extends Record<string, string>>(
  enumObject: T
): [string, ...string[]] => {
  const values = Object.values(enumObject);
  if (values.length === 0) {
    throw new Error("Enum must have at least one value");
  }
  return values as [string, ...string[]];
};

export const buyerSchema = z.object({
  fullName: z.string().min(2).max(80),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().regex(/^\d{10,15}$/),
  city: z.nativeEnum(City),
  propertyType: z.nativeEnum(PropertyType),
  bhk: z.nativeEnum(BHK).optional(),
  purpose: z.nativeEnum(Purpose),
  budgetMin: z.number().int().positive().optional(),
  budgetMax: z.number().int().positive().optional(),
  timeline: z.nativeEnum(Timeline),
  source: z.nativeEnum(Source),
  status: z.nativeEnum(Status).default(Status.New),
  notes: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
});

export const searchFiltersSchema = z.object({
  search: z.string().optional(),
  city: z.enum(createEnumArray(City)).optional(),
  propertyType: z.enum(createEnumArray(PropertyType)).optional(),
  status: z.enum(createEnumArray(Status)).optional(),
  timeline: z.enum(createEnumArray(Timeline)).optional(),
  page: z.number().int().positive().default(1),
});
