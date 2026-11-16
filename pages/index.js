import DefaultLayout from "interface/DefaultLayout"
import { Heading } from "@primer/react"

function Home() {
  return (
    <DefaultLayout
      metadata={{
        description:
          "Conteúdos com valor concreto para quem trabalha com tecnologia.",
      }}
    >
      <Heading as="h1">
        Conteúdos com valor concreto para quem trabalha com tecnologia.
      </Heading>
    </DefaultLayout>
  )
}

export default Home
