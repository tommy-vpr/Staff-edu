"use server";

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

interface GenerateDiscountCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

// ✅ Fetch Shopify credentials from environment variables
const SHOPIFY_ADMIN_API_URL = getEnvVariable("SHOPIFY_ADMIN_API_URL");
const SHOPIFY_ACCESS_TOKEN = getEnvVariable("SHOPIFY_ACCESS_TOKEN");

// ✅ Price Rule Title (Ensure it's consistent for reusability)
const PRICE_RULE_TITLE = "Questionnaire 20% Discount";

// ✅ Check for Existing Price Rule Before Creating a New One
const findExistingPriceRule = async (): Promise<string | null> => {
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

    // ✅ Find a price rule with the same title
    const existingRule = data.price_rules.find(
      (rule: any) => rule.title === PRICE_RULE_TITLE
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

// ✅ Create a New Price Rule (Only if Not Exists)
const createPriceRule = async (): Promise<string> => {
  // ✅ Check if a price rule already exists
  const existingPriceRule = await findExistingPriceRule();
  if (existingPriceRule) return existingPriceRule;

  try {
    console.log("📌 Creating a new price rule...");

    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        price_rule: {
          title: PRICE_RULE_TITLE, // Ensure the title is consistent
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "percentage",
          value: "-20.0", // 20% discount
          customer_selection: "all",
          usage_limit: 1, // One-time use
          starts_at: new Date().toISOString(),
        },
      }),
    });

    const responseBody = await response.text();
    if (!response.ok) {
      console.error("🚨 Failed to create price rule:", responseBody);
      throw new Error("❌ Shopify API Error - Failed to create price rule.");
    }

    const data = JSON.parse(responseBody);
    console.log("✅ New Price Rule Created:", data.price_rule.id);
    return data.price_rule.id;
  } catch (error) {
    console.error("❌ Error creating price rule:", error);
    throw new Error("❌ Error creating price rule");
  }
};

// ✅ Get or Create the Price Rule
export const getPriceRule = async (): Promise<string> => {
  return await createPriceRule(); // Ensure we always have a valid price rule
};

// ✅ Generate Discount Code Under the Same Price Rule
export const generateDiscountCode = async (
  customCode?: string
): Promise<GenerateDiscountCodeResponse> => {
  try {
    console.log("📌 Fetching or creating price rule...");

    const priceRuleId = await getPriceRule(); // ✅ Get or create the price rule
    if (!priceRuleId) throw new Error("❌ No valid price rule ID found");

    // ✅ Use a custom code if provided, otherwise generate one
    const discountCode = customCode
      ? customCode.toUpperCase()
      : `LT-QTN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    console.log("🔹 Generated Discount Code:", discountCode);

    const response = await fetch(
      `${SHOPIFY_ADMIN_API_URL}/price_rules/${priceRuleId}/discount_codes.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        },
        body: JSON.stringify({ discount_code: { code: discountCode } }),
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
