import { createRouter } from "next-connect"
import controller from "infra/controller"
import migrator from "models/migrator"
import authorization from "models/authorization"

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:migration"), getHandler)
  .post(controller.canRequest("create:migration"), postHandler)
  .handler(controller.errorHandlers)

async function getHandler(request, response) {
  const userTryToGet = request.context.user
  const pendingMigrations = await migrator.listPendingMigrations()

  const securityOutputValues = authorization.filterOutput(
    userTryToGet,
    "read:migration",
    pendingMigrations,
  )

  return response.status(200).json(securityOutputValues)
}

async function postHandler(request, response) {
  const userTryToPost = request.context.user
  const pendingMigrations = await migrator.runPendingMigrations()

  const securityOutputValues = authorization.filterOutput(
    userTryToPost,
    "read:migration",
    pendingMigrations,
  )

  if (pendingMigrations.length > 0) {
    return response.status(201).json(securityOutputValues)
  }

  return response.status(200).json(securityOutputValues)
}
