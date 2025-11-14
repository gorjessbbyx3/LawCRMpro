import { db } from './db';
import { users, clients, cases, timeEntries, invoices, calendarEvents, complianceDeadlines } from '../shared/schema';
import { hashPassword } from './auth';
import { sql } from 'drizzle-orm';

const DEMO_ATTORNEY_ID = '550e8400-e29b-41d4-a716-446655440000';

async function seed() {
  console.log('Starting database seed...');

  try {
    console.log('Clearing existing data...');
    await db.delete(complianceDeadlines);
    await db.delete(calendarEvents);
    await db.delete(invoices);
    await db.delete(timeEntries);
    await db.delete(cases);
    await db.delete(clients);
    await db.delete(users);

    console.log('Creating demo attorney account...');
    const hashedPassword = await hashPassword('demo123');
    
    await db.insert(users).values({
      id: DEMO_ATTORNEY_ID,
      username: 'attorney',
      email: 'attorney@hawaiilegal.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Kawamoto',
      role: 'attorney',
      barNumber: 'HI-12345',
      phone: '(808) 555-0100',
      isActive: true
    });

    console.log('Creating sample clients...');
    const [client1, client2, client3] = await db.insert(clients).values([
      {
        firstName: 'Maria',
        lastName: 'Santos',
        email: 'maria.santos@email.com',
        phone: '(808) 555-0101',
        address: '123 Ala Moana Blvd',
        city: 'Honolulu',
        state: 'HI',
        zipCode: '96814',
        status: 'active'
      },
      {
        firstName: 'David',
        lastName: 'Kim',
        email: 'david.kim@email.com',
        phone: '(808) 555-0102',
        address: '456 Kamehameha Hwy',
        city: 'Kailua',
        state: 'HI',
        zipCode: '96734',
        status: 'active'
      },
      {
        firstName: 'Sarah',
        lastName: 'Takahashi',
        email: 'sarah.takahashi@email.com',
        phone: '(808) 555-0103',
        address: '789 King Street',
        city: 'Honolulu',
        state: 'HI',
        zipCode: '96813',
        status: 'active'
      }
    ]).returning();

    console.log('Creating sample cases...');
    const [case1, case2] = await db.insert(cases).values([
      {
        caseNumber: 'HI-2024-001',
        title: 'Santos v. ABC Corporation',
        description: 'Personal injury case involving workplace accident',
        caseType: 'personal_injury',
        status: 'active',
        priority: 'high',
        clientId: client1.id,
        assignedAttorneyId: DEMO_ATTORNEY_ID,
        courtLocation: 'First Circuit Court, Honolulu',
        opposingParty: 'ABC Corporation',
        opposingCounsel: 'Smith & Associates',
        progress: 35
      },
      {
        caseNumber: 'HI-2024-002',
        title: 'Kim Estate Planning',
        description: 'Comprehensive estate planning and trust formation',
        caseType: 'estate_planning',
        status: 'active',
        priority: 'medium',
        clientId: client2.id,
        assignedAttorneyId: DEMO_ATTORNEY_ID,
        progress: 60
      }
    ]).returning();

    console.log('Creating sample time entries...');
    await db.insert(timeEntries).values([
      {
        caseId: case1.id,
        attorneyId: DEMO_ATTORNEY_ID,
        activity: 'Client Consultation',
        description: 'Initial consultation regarding workplace injury',
        startTime: new Date('2024-01-15T09:00:00'),
        endTime: new Date('2024-01-15T10:30:00'),
        duration: 90,
        hourlyRate: '350.00',
        isBillable: true,
        isInvoiced: false
      },
      {
        caseId: case1.id,
        attorneyId: DEMO_ATTORNEY_ID,
        activity: 'Legal Research',
        description: 'Research on Hawaii workplace safety regulations',
        startTime: new Date('2024-01-16T14:00:00'),
        endTime: new Date('2024-01-16T17:00:00'),
        duration: 180,
        hourlyRate: '350.00',
        isBillable: true,
        isInvoiced: false
      },
      {
        caseId: case2.id,
        attorneyId: DEMO_ATTORNEY_ID,
        activity: 'Document Drafting',
        description: 'Drafting revocable living trust',
        startTime: new Date('2024-01-17T10:00:00'),
        endTime: new Date('2024-01-17T12:00:00'),
        duration: 120,
        hourlyRate: '350.00',
        isBillable: true,
        isInvoiced: false
      }
    ]);

    console.log('Creating sample calendar events...');
    await db.insert(calendarEvents).values([
      {
        title: 'Court Hearing - Santos Case',
        description: 'Motion hearing at First Circuit Court',
        startTime: new Date('2024-02-01T09:00:00'),
        endTime: new Date('2024-02-01T10:00:00'),
        eventType: 'court_date',
        caseId: case1.id,
        clientId: client1.id,
        location: 'First Circuit Court, Courtroom 5A',
        reminderMinutes: 60
      },
      {
        title: 'Client Meeting - Kim Trust Review',
        description: 'Review final trust documents with client',
        startTime: new Date('2024-02-05T14:00:00'),
        endTime: new Date('2024-02-05T15:00:00'),
        eventType: 'meeting',
        caseId: case2.id,
        clientId: client2.id,
        location: 'Office',
        reminderMinutes: 30
      }
    ]);

    console.log('Creating compliance deadlines...');
    await db.insert(complianceDeadlines).values([
      {
        title: 'CLE Credits Due',
        description: 'Hawaii State Bar CLE requirement for 2024',
        dueDate: new Date('2024-12-31'),
        deadlineType: 'continuing_education',
        status: 'pending'
      },
      {
        title: 'Bar Membership Renewal',
        description: 'Annual Hawaii State Bar membership renewal',
        dueDate: new Date('2024-06-30'),
        deadlineType: 'bar_requirement',
        status: 'pending'
      }
    ]);

    console.log('Seed completed successfully!');
    console.log('\nDemo Account Credentials:');
    console.log('Username: attorney');
    console.log('Password: demo123');
    
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

seed()
  .then(() => {
    console.log('Database seeded successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
