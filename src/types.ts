export type PlanTier = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type TicketSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type ChurnRisk = 'Low' | 'Medium' | 'High';

export interface Customer {
  id?: string;
  name: string;
  region: string;
  planTier: PlanTier;
  contractStartDate: string;
  contractEndDate: string;
  deviceInventoryCount: number;
  avgMonthlyUsage: number;
  npsScore: number;
  lastUpdated: any; // Firestore Timestamp handled by converter
}

export interface Ticket {
  id?: string;
  customerId: string;
  severity: TicketSeverity;
  status: TicketStatus;
  category: string;
  description: string;
  createdAt: any;
}

export interface Insight {
  id?: string;
  customerId: string;
  healthScore: number;
  churnRisk: ChurnRisk;
  churnProbability: number;
  topRiskFactors: string[];
  lastCalculated: any;
}
