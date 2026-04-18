const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial printing options...');

  const materials = [
    { name: 'PLA (Standard)', costPerKg: 20.0 },
    { name: 'PETG (Durable)', costPerKg: 25.0 },
    { name: 'ABS (Heat Resistant)', costPerKg: 22.0 },
    { name: 'TPU (Flexible)', costPerKg: 35.0 },
  ];

  const qualities = [
    { name: 'Draft (0.28mm)' },
    { name: 'Standard (0.20mm)' },
    { name: 'High Quality (0.12mm)' },
  ];

  const infills = [
    { value: 15 },
    { value: 50 },
    { value: 100 },
  ];

  const colors = [
    { name: 'Black' },
    { name: 'White' },
    { name: 'Gray' },
    { name: 'Red' },
    { name: 'Blue' },
  ];

  for (const m of materials) {
    await prisma.material.upsert({ where: { name: m.name }, update: {}, create: m });
  }
  for (const q of qualities) {
    await prisma.quality.upsert({ where: { name: q.name }, update: {}, create: q });
  }
  for (const i of infills) {
    await prisma.infillOption.upsert({ where: { value: i.value }, update: {}, create: i });
  }
  for (const c of colors) {
    await prisma.color.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
