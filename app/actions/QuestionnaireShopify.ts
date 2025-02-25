"use server";

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const SHOPIFY_ADMIN_API_URL = getEnvVariable("SHOPIFY_ADMIN_API_URL");
const SHOPIFY_ACCESS_TOKEN = getEnvVariable("SHOPIFY_ACCESS_TOKEN");

const createPriceRule = async (): Promise<string> => {
  try {
    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        price_rule: {
          title: "Questionnaire 20% Discount",
          target_type: "line_item",
          target_selection: "all",
          allocation_method: "across",
          value_type: "percentage",
          value: "-20.0",
          customer_selection: "all",
          usage_limit: 1,
          starts_at: new Date().toISOString(),
        },
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        JSON.stringify(data.errors || "Failed to create price rule")
      );
    }

    return data.price_rule.id;
  } catch (error) {
    console.error("Error creating price rule:", error);
    throw new Error("Error creating price rule");
  }
};

// Get or Create Price Rule
export const getPriceRule = async (): Promise<string> => {
  try {
    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        JSON.stringify(data.errors || "Failed to fetch price rules")
      );
    }

    // Check if a price rule already exists
    const existingRule = data.price_rules.find((rule: any) =>
      rule.title.includes("Questionnaire 20% Discount")
    );

    return existingRule ? existingRule.id : await createPriceRule();
  } catch (error) {
    console.error("Error retrieving price rules:", error);
    throw new Error("Error retrieving or creating price rule");
  }
};

interface GenerateDiscountCodeResponse {
  success: boolean;
  code?: string;
  error?: string;
}

// Generate Discount Code
export const generateDiscountCode = async (
  customCode?: string
): Promise<GenerateDiscountCodeResponse> => {
  try {
    const priceRuleId = await getPriceRule();

    // Use a custom code if provided, otherwise generate one
    const discountCode = customCode
      ? customCode.toUpperCase()
      : `SKW-QTN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

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

    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        JSON.stringify(result.errors || "Failed to create discount code")
      );
    }

    return { success: true, code: result.discount_code.code };
  } catch (error) {
    console.error("Error generating discount code:", error);
    return { success: false, error: (error as Error).message };
  }
};
