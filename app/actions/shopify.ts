"use server";

import prisma from "@/lib/prisma";

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
  const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL!;
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN!;

  try {
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
            title: "$80 Off One-Time Use",
            target_type: "line_item", // Applies to individual line items
            target_selection: "all", // Applies to all products
            allocation_method: "across", // Splits the discount across all applicable items
            value_type: "fixed_amount", // Fixed amount discount
            value: "-80.0", // $80 discount
            customer_selection: "all", // Available to all customers
            usage_limit: 1, // One-time use per customer
            starts_at: new Date().toISOString(), // Start immediately
          },
        }),
      }
    );

    const responseBody = await createResponse.text();

    if (!createResponse.ok) {
      throw new Error("Failed to create price rule");
    }

    const createData = JSON.parse(responseBody);
    return createData.price_rule.id;
  } catch (error) {
    console.error("Error creating price rule:", error);
    throw new Error("Error creating price rule");
  }
};

// Get or Create Price Rule
export const getPriceRule = async (): Promise<string> => {
  const SHOPIFY_ADMIN_API_URL = process.env.SHOPIFY_ADMIN_API_URL!;
  const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN!;

  try {
    // Check if an existing price rule exists
    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    });

    const responseBody = await response.text();
    if (!response.ok) {
      throw new Error("Failed to fetch price rules");
    }

    const data = JSON.parse(responseBody);

    if (data.price_rules?.length > 0) {
      return data.price_rules[0].id;
    }

    // If no price rule exists, create one
    return await createPriceRule();
  } catch (error) {
    console.error("Error retrieving price rules:", error);
    throw new Error("Error retrieving or creating price rule");
  }
};

interface GenerateDiscountCodeResponse {
  success: boolean; // Indicates whether the operation succeeded
  code?: string; // The generated discount code (optional)
  error?: string; // The error message if something went wrong (optional)
}

// Generate Discount Code
export const generateDiscountCode =
  async (): Promise<GenerateDiscountCodeResponse> => {
    try {
      const priceRuleId = await getPriceRule();

      const randomCode = `EDU-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const response = await fetch(
        `${SHOPIFY_ADMIN_API_URL}/price_rules/${priceRuleId}/discount_codes.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
          },
          body: JSON.stringify({
            discount_code: { code: randomCode },
          }),
        }
      );

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(
          errorResponse.errors || "Failed to create discount code"
        );
      }

      const result = await response.json();
      return { success: true, code: result.discount_code.code };
    } catch (error) {
      console.error("Error generating discount code:", error);
      return { success: false, error: (error as Error).message };
    }
  };

export const updateStaffTestsTaken = async (email: string, test: string) => {
  try {
    const updatedStaff = await prisma.staff.update({
      where: { email },
      data: {
        takenTest: true,
        testsTaken: {
          push: test, // Append the test to the `testsTaken` array
        },
        updatedAt: new Date(), // Update the `updatedAt` field
      },
    });

    return { success: true, staff: updatedStaff };
  } catch (error) {
    console.error("Error updating Staff model:", error);
    return { success: false, error: "Failed to update Staff model." };
  }
};

export const fetchPriceRules = async (): Promise<any[]> => {
  const SHOPIFY_ADMIN_API_URL = process.env.NEXT_PUBLIC_SHOPIFY_ADMIN_API_URL!;
  const SHOPIFY_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_ACCESS_TOKEN!;

  try {
    const response = await fetch(`${SHOPIFY_ADMIN_API_URL}/price_rules.json`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch price rules");
    }

    const data = await response.json();
    return data.price_rules || [];
  } catch (error) {
    console.error("Error fetching price rules:", error);
    return [];
  }
};
