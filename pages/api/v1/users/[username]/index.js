import { createRouter } from "next-connect"
import controller from "infra/controller"
import user from "models/user"
import authorization from "models/authorization"
import { ForbiddenError } from "infra/errors"

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(getHandler)
  .patch(controller.canRequest("update:user"), patchHandler)
  .handler(controller.errorHandlers)

async function getHandler(request, response) {
  const userTryToGet = request.context.user
  const username = request.query.username
  const userFound = await user.findOneByUsername(username)

  const securityOutputValues = authorization.filterOutput(
    userTryToGet,
    "read:user",
    userFound,
  )

  return response.status(200).json(securityOutputValues)
}

async function patchHandler(request, response) {
  const username = request.query.username
  const userInputValues = request.body

  const userTryToPatch = request.context.user
  const targetUser = await user.findOneByUsername(username)
  if (!authorization.can(userTryToPatch, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessária para atualizar outro usuário.",
    })
  }

  const updatedUser = await user.update(username, userInputValues)

  const securityOutputValues = authorization.filterOutput(
    userTryToPatch,
    "read:user",
    updatedUser,
  )

  return response.status(200).json(securityOutputValues)
}
