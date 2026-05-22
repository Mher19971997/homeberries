import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          httpEquiv="Permissions-Policy"
          content="accelerometer=(), autoplay=*, clipboard-write=*, encrypted-media=*, gyroscope=(), picture-in-picture=*"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
