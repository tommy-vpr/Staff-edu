import Head from "next/head";

export const metadata = {
  title: "Staff EDU", // Global title
  description: "Hitting new highs", // Global description
  favicon: "/favicon.ico", // Global favicon
};

export const DynamicHead = () => {
  return (
    <Head>
      <title>{metadata.title}</title>
      <meta name="description" content={metadata.description} />
      <link rel="icon" href={metadata.favicon} />
    </Head>
  );
};
