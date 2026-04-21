import { faker } from '@faker-js/faker';
import { Customer, Ticket, Insight, PlanTier, TicketSeverity, TicketStatus, ChurnRisk } from '../types';
import { db } from '../lib/firebase';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';

const PLAN_TIERS: PlanTier[] = ['Basic', 'Standard', 'Premium', 'Enterprise'];
const REGIONS = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East'];
const TICKET_SEVERITIES: TicketSeverity[] = ['Low', 'Medium', 'High', 'Critical'];
const TICKET_STATUSES: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed'];
const CHURN_RISKS: ChurnRisk[] = ['Low', 'Medium', 'High'];

export const generateSyntheticData = () => {
  const customers: Customer[] = [];
  const tickets: Ticket[] = [];
  const insights: Insight[] = [];

  for (let i = 0; i < 200; i++) {
    const customerId = `cust_${i}`;
    const planTier = faker.helpers.arrayElement(PLAN_TIERS);
    
    const customer: Customer = {
      id: customerId,
      name: faker.company.name(),
      region: faker.helpers.arrayElement(REGIONS),
      planTier,
      contractStartDate: faker.date.past({ years: 2 }).toISOString(),
      contractEndDate: faker.date.future({ years: 1 }).toISOString(),
      deviceInventoryCount: faker.number.int({ min: 10, max: 5000 }),
      avgMonthlyUsage: faker.number.float({ min: 100, max: 10000, fractionDigits: 2 }),
      npsScore: faker.number.int({ min: 0, max: 10 }),
      lastUpdated: serverTimestamp()
    };
    customers.push(customer);

    // Tickets
    const ticketCount = faker.number.int({ min: 0, max: 5 });
    for (let j = 0; j < ticketCount; j++) {
      tickets.push({
        customerId,
        severity: faker.helpers.arrayElement(TICKET_SEVERITIES),
        status: faker.helpers.arrayElement(TICKET_STATUSES),
        category: faker.helpers.arrayElement(['Hardware', 'Firmware', 'Connectivity', 'Billing']),
        description: faker.lorem.sentence(),
        createdAt: serverTimestamp()
      });
    }

    // Insights (Health/Churn)
    const healthScore = faker.number.int({ min: 30, max: 100 });
    let churnRisk: ChurnRisk = 'Low';
    if (healthScore < 50) churnRisk = 'High';
    else if (healthScore < 75) churnRisk = 'Medium';

    insights.push({
      customerId,
      healthScore,
      churnRisk,
      churnProbability: faker.number.float({ min: 0, max: 1, fractionDigits: 2 }),
      topRiskFactors: faker.helpers.arrayElements([
        'Frequent support tickets',
        'Decreasing usage',
        'Low NPS score',
        'Contract expiration approaching',
        'High severe ticket volume'
      ], { min: 1, max: 3 }),
      lastCalculated: serverTimestamp()
    });
  }

  return { customers, tickets, insights };
};

export const seedDatabase = async () => {
  const { customers, tickets, insights } = generateSyntheticData();
  const batch = writeBatch(db);

  // Firestore batches have a limit of 500 operations.
  // We have 200 customers + stats + tickets. We might need multiple batches.
  // For simplicity, we'll just batch customers first.
  
  for (const c of customers) {
    const ref = doc(db, 'customers', c.id!);
    batch.set(ref, { ...c, lastUpdated: serverTimestamp() });
  }
  
  for (const ins of insights) {
    const ref = doc(db, 'insights', ins.customerId);
    batch.set(ref, { ...ins, lastCalculated: serverTimestamp() });
  }

  // Tickets might exceed the limit, so we'll just do a few for now
  for (const t of tickets.slice(0, 50)) {
    const ref = doc(collection(db, 'tickets'));
    batch.set(ref, t);
  }

  await batch.commit();
  console.log('Database seeded successfully');
};
