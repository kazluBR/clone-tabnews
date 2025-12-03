import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Amazon.com - Lava e Seca Samsung 11kg</title>
        <meta
          property="og:title"
          content="🔥 Lava e Seca Samsung 11kg – 50% OFF na Amazon!"
        />
        <meta
          property="og:description"
          content="Oferta relâmpago! Lava e Seca Samsung 11kg com 50% de desconto apenas hoje. Aproveite antes que acabe!"
        />
        <meta
          property="og:image"
          content="https://m.media-amazon.com/images/I/51KPNZgowTL._AC_SL1000_.jpg"
        />
        <meta
          property="og:url"
          content="https://www.amazon.com.br/Samsung-Lavadora-Digital-Inverter-WW11T/dp/B0DBMMH3JY/"
        />
        <meta property="og:type" content="product" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "2rem",
            maxWidth: "700px",
            lineHeight: "1.4",
            background: "white",
            padding: "30px 40px",
            borderRadius: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            color: "#333",
            border: "2px solid #ffe0e6",
          }}
        >
          Não tem promoção de lava e seca,
          <br /> mas sempre teremos motivos para comemorar 😚❤️
        </h1>
      </div>
    </>
  );
}
