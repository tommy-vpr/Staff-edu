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

export const WelcomeEmailTemplate = ({ firstName }: { firstName: string }) => {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the Litto Family! 🌟 Discover what’s next.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Img
              width={120}
              src="https://cdn.shopify.com/s/files/1/0586/7749/3954/files/litto-logo-transparent-background-bk_691d2fda-d9c7-4a19-b008-81c6fd80210c.png?v=1707683116"
              alt="Litto Logo - Welcome to the Family"
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          {/* Greeting Section */}
          <Section style={content}>
            <Text style={title}>
              Hi {firstName.charAt(0).toUpperCase() + firstName.slice(1)},
              Welcome to Litto!
            </Text>
            <Text style={paragraph}>
              We’re beyond excited to have you as part of the Litto family! 🎉
              Our community is all about creating memorable moments and hitting
              new highs.
            </Text>
            <Text style={paragraph}>
              Stay tuned for exclusive updates, special offers, and all the
              latest Litto news. Let’s make this journey together unforgettable!
            </Text>

            {/* Closing Section */}
            <Text style={paragraph}>
              Cheers,
              <br />
              <strong>Team LITTO</strong>
            </Text>
          </Section>

          {/* Footer Section */}
          <Section style={footer}>
            <Text style={footerText}>
              Follow us for updates and fun moments:
            </Text>
            <Row
              style={{
                marginTop: "10px",
                width: "100%",
              }}
            >
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
                  alt="Follow Litto on TikTok"
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
                  alt="Follow Litto on X (Twitter)"
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
                  alt="Follow Litto on Instagram"
                  width={24}
                  height={24}
                />
              </Link>
            </Row>

            <Text style={footerText}>
              © {new Date().getFullYear()} Litto, All Rights Reserved
              <br />
              Los Angeles, CA
            </Text>
            <Text style={footerText}>
              <Link
                href="https://cedu.itslitto.com/unsubscribe"
                target="_blank"
                style={link}
              >
                Unsubscribe
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default WelcomeEmailTemplate;

// Styling
const main: React.CSSProperties = {
  backgroundColor: "#f8f9fa",
  fontFamily: "Arial, sans-serif",
  margin: "0",
  padding: "0",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "20px auto",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  padding: "20px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
};

const header: React.CSSProperties = {
  textAlign: "center",
  paddingBottom: "20px",
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
  color: "#555555",
  marginBottom: "15px",
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
  gap: "10px",
  marginTop: "10px",
  width: "100%",
};

const link: React.CSSProperties = {
  color: "#101010",
  textDecoration: "underline",
};
