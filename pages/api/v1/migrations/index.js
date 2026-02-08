export const runtime = "nodejs"

import { createRouter } from "next-connect"
import { join } from "node:path"
import database from "infra/database"
import controller from "infra/controller"

const router = createRouter()

router.get(getHandler)
router.post(postHandler)

export default router.handler(controller.errorHandlers)

let migrationRunner

async function getMigrationRunner() {
  if (!migrationRunner) {
    const mod = await import("node-pg-migrate")
    migrationRunner = mod.runner
  }
  return migrationRunner
}

const defaultMigrationOptions = {
  dryRun: true,
  dir: join("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
}

async function getHandler(request, response) {
  let dbClient
  try {
    const migrationRunner = await getMigrationRunner()

    dbClient = await database.getNewClient()

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
    })
    return response.status(200).json(pendingMigrations)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await dbClient.end()
  }
}

async function postHandler(request, response) {
  let dbClient
  try {
    const migrationRunner = await getMigrationRunner()

    dbClient = await database.getNewClient()

    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient,
      dryRun: false,
    })

    if (pendingMigrations.length > 0) {
      return response.status(201).json(pendingMigrations)
    }

    return response.status(200).json(pendingMigrations)
  } catch (error) {
    console.error(error)
    throw error
  } finally {
    await dbClient.end()
  }
}
