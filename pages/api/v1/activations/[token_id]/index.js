import { createRouter } from "next-connect"
import controller from "infra/controller"
import activation from "models/activation"
import authorization from "models/authorization"

const router = createRouter()

router.use(controller.injectAnonymousOrUser)
router.patch(controller.canRequest("read:activation_token"), patchHandler)

export default router.handler(controller.errorHandlers)

async function patchHandler(request, response) {
  const userTryToPatch = request.context.user
  const activationTokenId = request.query.token_id

  const validActivationToken =
    await activation.findOneValidById(activationTokenId)

  await activation.activeUserByUserId(validActivationToken.user_id)

  const usedActivationToken =
    await activation.markTokenAsUsed(activationTokenId)

  const securityOutputValues = authorization.filterOutput(
    userTryToPatch,
    "read:activation_token",
    usedActivationToken,
  )

  return response.status(200).json(securityOutputValues)
}
