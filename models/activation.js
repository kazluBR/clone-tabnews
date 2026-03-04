import email from "infra/email"

async function sendEmailToUser(user) {
  await email.send({
    from: "KazluNews <contato@kazlunews.com.br>",
    to: user.email,
    subject: "Ative seu cadastro no KazluNews",
    text: [
      `${user.username}, clique no link abaixo para ativar seu cadastro no KazluNews:\n`,
      "https://...\n",
      "Atenciosamente",
      "Equipe KazluNews",
    ].join("\n"),
  })
}

const activation = {
  sendEmailToUser,
}

export default activation
