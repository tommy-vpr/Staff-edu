"use server";

import prisma from "@/lib/prisma";

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

// ✅ Response Type for Discount Code Generation
interface GenerateDiscountCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

// ✅ Fetch Shopify credentials from environment variables
const SHOPIFY_ADMIN_API_URL = getEnvVariable("SHOPIFY_ADMIN_API_URL");
const SHOPIFY_ACCESS_TOKEN = getEnvVariable("SHOPIFY_ACCESS_TOKEN");

const findExistingPriceRule = async (title: string): Promise<string | null> => {
  try {
    console.log("📌 Checking for existing price rule...");

    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    });

    const responseBody = await response.text();
    if (!response.ok) {
      console.error("🚨 Failed to fetch price rules:", responseBody);
      throw new Error("❌ Shopify API Error - Failed to fetch price rules.");
    }

    const data = JSON.parse(responseBody);
    const existingRule = data.price_rules.find(
      (rule: any) => rule.title === title
    );

    if (existingRule) {
      console.log("✅ Existing Price Rule Found:", existingRule.id);
      return existingRule.id;
    }

    return null;
  } catch (error) {
    console.error("❌ Error finding price rule:", error);
    return null;
  }
};

const createPriceRule = async (): Promise<string> => {
  const priceRuleTitle = "$80 Off One-Time Use"; // Keep consistent title

  // ✅ Check if a price rule already exists
  const existingPriceRule = await findExistingPriceRule(priceRuleTitle);
  if (existingPriceRule) return existingPriceRule;

  try {
    console.log("📌 Creating a new price rule...");

    const now = new Date().toISOString();
    const createResponse = await fetch(
      `${SHOPIFY_ADMIN_API_URL}/price_rules.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({
          price_rule: {
            title: priceRuleTitle, // Keep consistent title
            target_type: "line_item",
            target_selection: "all",
            allocation_method: "across",
            value_type: "fixed_amount",
            value: "-80.0",
            customer_selection: "all",
            usage_limit: 1,
            starts_at: now,
          },
        }),
      }
    );

    const responseBody = await createResponse.text();
    if (!createResponse.ok) {
      console.error("🚨 Failed to create price rule:", responseBody);
      throw new Error("❌ Shopify API Error - Failed to create price rule.");
    }

    const createData = JSON.parse(responseBody);
    console.log("✅ New Price Rule Created:", createData.price_rule.id);
    return createData.price_rule.id;
  } catch (error) {
    console.error("❌ Error creating price rule:", error);
    throw new Error("❌ Error creating price rule");
  }
};

export const generateDiscountCode =
  async (): Promise<GenerateDiscountCodeResponse> => {
    try {
      console.log("📌 Fetching or creating price rule...");

      const priceRuleId = await createPriceRule(); // ✅ Get or create the price rule
      if (!priceRuleId) throw new Error("❌ No valid price rule ID found");

      const randomCode = `EDU-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      console.log("🔹 Generated Random Code:", randomCode);

      const response = await fetch(
        `${SHOPIFY_ADMIN_API_URL}/price_rules/${priceRuleId}/discount_codes.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            discount_code: {
              code: randomCode,
              usage_limit: 1,
              customer_selection: "all",
            },
          }),
        }
      );

      const responseBody = await response.text();
      console.log("🔍 Shopify Response:", responseBody);

      if (!response.ok) {
        console.error("🚨 Shopify API Error:", responseBody);
        throw new Error(`Failed to create discount code: ${responseBody}`);
      }

      const result = JSON.parse(responseBody);
      console.log("✅ Discount Code Created:", result.discount_code.code);

      return { success: true, code: result.discount_code.code };
    } catch (error) {
      console.error("❌ Error generating discount code:", error);
      return { success: false, error: (error as Error).message };
    }
  };

// ✅ Update Staff Record After Quiz Completion
export const updateStaffTestsTaken = async (email: string, test: string) => {
  try {
    console.log(`📌 Updating Staff Record for: ${email}`);

    const updatedStaff = await prisma.staff.update({
      where: { email },
      data: {
        takenTest: true,
        testsTaken: {
          push: test, // Append test name to the `testsTaken` array
        },
        updatedAt: new Date(), // Update `updatedAt` field
      },
    });

    console.log("✅ Staff record updated successfully!");
    return { success: true, staff: updatedStaff };
  } catch (error) {
    console.error("❌ Error updating Staff model:", error);
    return { success: false, error: "Failed to update Staff model." };
  }
};
