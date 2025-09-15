import {
  Buyer,
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
  User,
  BuyerHistory,
} from "@prisma/client";

export type {
  Buyer,
  City,
  PropertyType,
  BHK,
  Purpose,
  Timeline,
  Source,
  Status,
  User,
  BuyerHistory,
};

export interface BuyerWithHistory extends Buyer {
  history: (BuyerHistory & { user: User })[];
}

export interface BuyerFormData {
  fullName: string;
  email?: string;
  phone: string;
  city: City;
  propertyType: PropertyType;
  bhk?: BHK;
  purpose: Purpose;
  budgetMin?: number;
  budgetMax?: number;
  timeline: Timeline;
  source: Source;
  notes?: string;
  tags?: string[];
  status?: Status;
}

export interface SearchFilters {
  search?: string;
  city?: City;
  propertyType?: PropertyType;
  status?: Status;
  timeline?: Timeline;
  page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
