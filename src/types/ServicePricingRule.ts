export interface ServicePricingRule {
  id: string;
  provider: string; // Udbyder
  type: "service" | "service+repair";
  minKm: number;
  maxKm: number;
  minHk: number;
  maxHk: number;
  monthlyPrice: number;
  factoryWarrantyDiscount?: number; // Kun relevant for service+repair
  createdAt: string;
  updatedAt: string;
}
