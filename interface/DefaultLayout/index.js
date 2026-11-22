import Head from "next/head"
import { PageLayout, Header, Text } from "@primer/react"
import styles from "./index.module.css"

const contentWidthClasses = {
  small: styles.smallContent,
}

export default function DefaultLayout({
  children,
  metadata = {},
  contentWidth,
}) {
  const extraContentWidthClass = contentWidthClasses[contentWidth]

  return (
    <>
      <Head>
        <title>
          {metadata.title
            ? `${metadata.title} · TabNews Clone`
            : "TabNews Clone"}
        </title>
        {metadata.description && (
          <meta name="description" content={metadata.description} />
        )}
      </Head>
      <PageLayout padding="none">
        <PageLayout.Header>
          <Header>
            <Header.Item full>
              <Header.Link href="/">TabNews Clone</Header.Link>
            </Header.Item>
            <Header.Item>
              <Header.Link href="/login">Login</Header.Link>
            </Header.Item>
            <Header.Item>
              <Header.Link href="/cadastro">Cadastrar</Header.Link>
            </Header.Item>
          </Header>
        </PageLayout.Header>
        <PageLayout.Content
          width={contentWidth}
          className={extraContentWidthClass}
        >
          {children}
        </PageLayout.Content>
        <PageLayout.Footer divider="line">
          <Text size="small">© {new Date().getFullYear()} TabNews Clone</Text>
        </PageLayout.Footer>
      </PageLayout>
    </>
  )
}
