import {
  Body,
  Container,
  Column,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import littoLogo from "@/assets/images/litto-logo-blk.webp";

type QuestionnaireProps = {
  email: string;
  couponCode: string;
  // results: { question: string; answer: string }[];
  products: { url: string; image: string; title: string }[];
};

export const QuestionnaireEmailTemplate = ({
  couponCode,
  products,
}: QuestionnaireProps) => {
  return (
    <Html>
      <Head />
      <Preview>LITTO Questionnaire 🌟</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Img
              width={120}
              src="https://cdn.shopify.com/s/files/1/0586/7749/3954/files/litto-logo-transparent-background-bk_691d2fda-d9c7-4a19-b008-81c6fd80210c.png?v=1707683116"
              alt="Litto Logo"
            />
          </Section>

          {/* Greeting Section */}
          <Section style={content}>
            <Text style={title}>Thank you for taking the quiz! 🎉</Text>
            <Text style={paragraph}>
              Here’s your exclusive 20% off coupon code:
            </Text>
            <Text style={couponStyle}>{couponCode}</Text>

            {/* Recommended Products Section */}
            <Text style={listHeader}>Recommended Products for You:</Text>

            <Section>
              {products
                .reduce((rows, product, index) => {
                  if (index % 2 === 0) rows.push([]);
                  rows[rows.length - 1].push(product);
                  return rows;
                }, [] as { url: string; image: string; title: string }[][])
                .map((row, rowIndex) => (
                  <Row key={rowIndex} style={{ marginBottom: "20px" }}>
                    {row.map((product, colIndex) => (
                      <Column
                        key={colIndex}
                        style={{
                          width: "50%",
                          textAlign: "center",
                          padding: "10px",
                        }}
                      >
                        <Link
                          href={`https://itslitto.com/${product.url}`}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Img
                            src={`https:${product.image}`}
                            alt={product.title}
                            width={240}
                            style={productImage}
                          />
                        </Link>
                        <Text style={productTitle}>{product.title}</Text>
                        <Link
                          href={`https://itslitto.com/${product.url}`}
                          style={productLink}
                        >
                          View Product
                        </Link>
                      </Column>
                    ))}
                  </Row>
                ))}
            </Section>

            <Section style={shopStyle}>
              <Text style={footerText}>
                <Link
                  href="https://itslitto.com"
                  target="_blank"
                  style={{
                    backgroundColor: "#101010",
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "5px",
                    margin: "0 5px",
                    color: "#fff",
                  }}
                >
                  Visit Website
                </Link>
                <Link
                  href="https://itslitto.com/pages/store-locator"
                  target="_blank"
                  style={{
                    backgroundColor: "#101010",
                    display: "inline-block",
                    padding: "10px",
                    borderRadius: "5px",
                    margin: "0 5px",
                    color: "#fff",
                  }}
                >
                  Find a Store
                </Link>
              </Text>
            </Section>
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              <Link
                href="https://www.tiktok.com/@itslitto.cali"
                target="_blank"
                style={{
                  backgroundColor: "#101010",
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0 5px",
                }}
              >
                <Img
                  src="https://cdn.shopify.com/s/files/1/0586/7749/3954/files/tiktok-icon.png?v=1729289263"
                  alt="tiktok"
                  width={24}
                  height={24}
                />
              </Link>

              <Link
                href="https://x.com/itslittocrew"
                target="_blank"
                style={{
                  backgroundColor: "#101010",
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0 5px",
                }}
              >
                <Img
                  src="https://cdn.shopify.com/s/files/1/0586/7749/3954/files/x-logo.png?v=1728949605"
                  alt="Twitter"
                  width={24}
                  height={24}
                />
              </Link>

              <Link
                href="https://www.instagram.com/itslitto/"
                target="_blank"
                style={{
                  backgroundColor: "#101010",
                  display: "inline-block",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "0 5px",
                }}
              >
                <Img
                  src="https://cdn.shopify.com/s/files/1/0586/7749/3954/files/instagram-icon.png?v=1729290626"
                  alt="instagram"
                  width={24}
                  height={24}
                />
              </Link>
            </Text>

            <Text style={footerText}>
              © {new Date().getFullYear()} LITTO, All Rights Reserved
              <br />
              Los Angeles CA
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default QuestionnaireEmailTemplate;

const header: React.CSSProperties = {
  textAlign: "center",
  paddingBottom: "20px",
};

const main: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  fontFamily: "Arial, sans-serif",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "20px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const content: React.CSSProperties = {
  padding: "20px",
};

const title: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333333",
  marginBottom: "10px",
};

const paragraph: React.CSSProperties = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333333",
  marginBottom: "15px",
};

const listHeader: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#333333",
  marginBottom: "10px",
};

const list: React.CSSProperties = {
  fontSize: "16px",
  color: "#333333",
  margin: "10px 0",
  paddingLeft: "20px",
};

const cta: React.CSSProperties = {
  textAlign: "center",
  margin: "20px 0",
};

const button: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#101010",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  padding: "10px 20px",
  borderRadius: "4px",
};

const link: React.CSSProperties = {
  color: "#101010",
  textDecoration: "underline",
};

const footer: React.CSSProperties = {
  textAlign: "center",
  marginTop: "30px",
  paddingTop: "20px",
  borderTop: "1px solid #dddddd",
};

const footerText: React.CSSProperties = {
  fontSize: "14px",
  color: "#888888",
  lineHeight: "1.5",
};

const socialIcons: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginTop: "10px",
  background: "#101010",
};

const couponStyle: React.CSSProperties = {
  fontSize: "28px",
  fontWeight: "bold",
  color: "#72bf49",
  textAlign: "center",
  margin: "10px 0",
  padding: "30px",
  background: "#f5f5f5",
};

const shopStyle: React.CSSProperties = {
  marginTop: "20px",
  paddingTop: "20px",
};

const productRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  borderBottom: "1px solid #ddd",
  padding: "10px 0",
};

const productImage: React.CSSProperties = {
  display: "block",
  borderRadius: "5px",
  margin: "auto",
};

const productTitle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "bold",
  marginBottom: "15px",
  lineHeight: "1",
};

const productLink: React.CSSProperties = {
  fontSize: "14px",
  color: "#fff",
  background: "#72BF49",
  padding: "8px 16px",
  textDecoration: "none",
  borderRadius: "150px",
};
