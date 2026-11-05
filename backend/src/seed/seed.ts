import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { eq } from 'drizzle-orm';
import * as schema from '../database/schema';

dotenv.config();

async function runSeed() {
  const connectionString =
    process.env.DATABASE_URL || 'postgresql://moa_user:moa_password@localhost:5432/moa_sms_db';
  console.log(`Connecting to database: ${connectionString}...`);

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    console.log('Seeding initial data (Single user: finance with all privileges)...');

    // 1. Delete legacy 'admin' user if present
    await db.delete(schema.users).where(eq(schema.users.username, 'admin' as any));

    // 2. Seed single 'finance' user with all privileges
    const financePassword = await bcrypt.hash('finance123', 10);

    const existingFinance = await db.query.users.findFirst({
      where: (u: any, { eq }: any) => eq(u.username, 'finance'),
    });

    if (!existingFinance) {
      await db.insert(schema.users).values({
        username: 'finance',
        passwordHash: financePassword,
        fullName: 'Ministry Finance Officer',
        role: 'FINANCE',
        phone: '+251912000000',
        isActive: true,
      } as any);
      console.log('✓ Created single user: finance (finance123) with all privileges');
    } else {
      // Update existing to ensure active and correct role
      await db
        .update(schema.users)
        .set({
          fullName: 'Ministry Finance Officer',
          role: 'FINANCE',
          passwordHash: financePassword,
          isActive: true,
        } as any)
        .where(eq(schema.users.username, 'finance' as any));
      console.log('✓ Updated single user: finance with full privileges');
    }

    // 3. Seed Default Settings (Threshold = 20,000,000 ETB)
    const existingSettings = await db.query.systemSettings.findFirst();
    if (!existingSettings) {
      await db.insert(schema.systemSettings).values({
        thresholdAmount: '20000000.00',
        isAlertEnabled: true,
        smsProvider: 'mock',
        smsGatewayUrl: 'http://10.10.20.50:8080/api/sms/send',
        smsSenderId: 'MOA-FINANCE',
      } as any);
      console.log('✓ Initialized system settings: threshold = 20,000,000 ETB');
    } else {
      console.log('ℹ Settings already initialized');
    }

    // 4. Seed Default Alert Recipients
    const recipients = await db.query.alertRecipients.findMany();
    if (recipients.length === 0) {
      await db.insert(schema.alertRecipients).values([
        {
          name: 'H.E. State Minister',
          title: 'State Minister of Agriculture',
          phoneNumber: '+251911223344',
          isActive: true,
        },
        {
          name: 'Finance & Accounts Director',
          title: 'Director of Finance',
          phoneNumber: '+251911556677',
          isActive: true,
        },
        {
          name: 'Internal Audit Director',
          title: 'Chief Auditor',
          phoneNumber: '+251911889900',
          isActive: true,
        },
      ] as any);
      console.log('✓ Added 3 default alert recipients');
    } else {
      console.log('ℹ Alert recipients already present');
    }

    console.log('Single user setup and seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await client.end();
  }
}

runSeed();
