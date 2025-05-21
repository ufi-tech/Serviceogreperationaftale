import { ServicePricingRule } from '../types/ServicePricingRule';

// Dummy in-memory store (kan senere udskiftes med rigtig backend)
let rules: ServicePricingRule[] = [];

export async function getServicePricingRules(): Promise<ServicePricingRule[]> {
  return rules;
}

export async function getServicePricingRule(id: string): Promise<ServicePricingRule | undefined> {
  return rules.find(r => r.id === id);
}

export async function createServicePricingRule(rule: ServicePricingRule): Promise<void> {
  rules.push(rule);
}

export async function updateServicePricingRule(id: string, update: Partial<ServicePricingRule>): Promise<void> {
  rules = rules.map(r => r.id === id ? { ...r, ...update, updatedAt: new Date().toISOString() } : r);
}

export async function deleteServicePricingRule(id: string): Promise<void> {
  rules = rules.filter(r => r.id !== id);
}
