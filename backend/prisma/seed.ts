import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@fleetflow.com' },
    update: {},
    create: {
      email: 'admin@fleetflow.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Created admin user:', admin.email);

  // Create a manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@fleetflow.com' },
    update: {},
    create: {
      email: 'manager@fleetflow.com',
      name: 'Manager User',
      password: managerPassword,
      role: 'MANAGER',
    },
  });
  console.log('Created manager user:', manager.email);

  // Create a driver user
  const driverPassword = await bcrypt.hash('driver123', 10);
  const driverUser = await prisma.user.upsert({
    where: { email: 'driver@fleetflow.com' },
    update: {},
    create: {
      email: 'driver@fleetflow.com',
      name: 'John Driver',
      password: driverPassword,
      role: 'DRIVER',
    },
  });
  console.log('Created driver user:', driverUser.email);

  // Create driver profile
  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNumber: 'DL-2024-001',
      licenseExpiry: new Date('2027-12-31'),
      status: 'ACTIVE',
      rating: 4.8,
    },
  });
  console.log('Created driver profile:', driver.licenseNumber);

  // Create sample vehicles
  const vehicle1 = await prisma.vehicle.upsert({
    where: { plateNumber: 'FL-001' },
    update: {},
    create: {
      plateNumber: 'FL-001',
      vin: 'VIN001ABC123456789',
      make: 'Ford',
      model: 'Transit',
      year: 2023,
      color: 'White',
      type: 'Van',
      capacity: 1500,
      fuelLevel: 85,
      mileage: 12500,
      status: 'ACTIVE',
      nextServiceDate: new Date('2026-06-15'),
    },
  });

  const vehicle2 = await prisma.vehicle.upsert({
    where: { plateNumber: 'FL-002' },
    update: {},
    create: {
      plateNumber: 'FL-002',
      vin: 'VIN002DEF987654321',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2024,
      color: 'Silver',
      type: 'Van',
      capacity: 2000,
      fuelLevel: 92,
      mileage: 5000,
      status: 'ACTIVE',
      nextServiceDate: new Date('2026-09-01'),
    },
  });
  console.log('Created sample vehicles:', vehicle1.plateNumber, vehicle2.plateNumber);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
