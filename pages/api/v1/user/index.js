import { createRouter } from "next-connect"
import controller from "infra/controller"
import user from "models/user"
import session from "models/session"
import authorization from "models/authorization"

export default createRouter()
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:session"), getHandler)
  .handler(controller.errorHandlers)

async function getHandler(request, response) {
  const userTryToGet = request.context.user
  const sessionToken = request.cookies.session_id

  const sessionObject = await session.findOneValidByToken(sessionToken)
  const renewedSessionObject = await session.renew(sessionObject.id)
  controller.setSessionCookie(renewedSessionObject.token, response)

  const userObject = await user.findOneById(sessionObject.user_id)

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  )

  const securityOutputValues = authorization.filterOutput(
    userTryToGet,
    "read:user:self",
    userObject,
  )

  return response.status(200).json(securityOutputValues)
}
