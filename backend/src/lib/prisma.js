const { PrismaClient } = require("@prisma/client");

// Create a single shared PrismaClient instance to avoid connection pool exhaustion
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});

module.exports = prisma;
