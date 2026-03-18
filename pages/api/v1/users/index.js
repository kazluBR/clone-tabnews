import { createRouter } from "next-connect"
import controller from "infra/controller"
import user from "models/user"
import activation from "models/activation"
import authorization from "models/authorization"

const router = createRouter()

router.use(controller.injectAnonymousOrUser)
router.post(controller.canRequest("create:user"), postHandler)

export default router.handler(controller.errorHandlers)

async function postHandler(request, response) {
  const userTryToPost = request.context.user
  const userInputValues = request.body
  const newUser = await user.create(userInputValues)

  const activationToken = await activation.create(newUser.id)
  await activation.sendEmailToUser(newUser, activationToken)

  const securityOutputValues = authorization.filterOutput(
    userTryToPost,
    "read:user",
    newUser,
  )

  return response.status(201).json(securityOutputValues)
}
