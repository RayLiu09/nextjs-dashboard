import { prisma } from "./prisma";

async function main() {
  const users = await prisma.customers.findMany();
  console.log(users);
}

main()
.then(async () => {
    console.log("Test script completed successfully.");
    await prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });