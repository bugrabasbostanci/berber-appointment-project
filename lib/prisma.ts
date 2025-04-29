import { PrismaClient } from '@prisma/client'

// PrismaClient örneğinin global olarak saklanması
// Bunu yapmak hot-reloading sırasında çoklu bağlantı oluşmasını önler
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma