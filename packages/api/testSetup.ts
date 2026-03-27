import { beforeAll, afterAll, afterEach } from 'vitest'
import { execSync } from 'child_process'
import { PrismaClient } from '@prisma/client'

// Point Prisma at the test database before the client is instantiated
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL

const db = new PrismaClient()

beforeAll(async () => {
  execSync('prisma migrate deploy', { stdio: 'inherit' })
})

afterEach(async () => {
  // Delete in FK-safe order: dependents before parents
  await db.$transaction([
    db.worker.deleteMany(),
    db.user.deleteMany(),
    db.category.deleteMany(),
    db.location.deleteMany(),
  ])
})

afterAll(async () => {
  await db.$disconnect()
})

export { db }
