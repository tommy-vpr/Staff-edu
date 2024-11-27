"use server";

import { UserSchema, UserFormValues } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not defined`);
  }
  return value;
};

const SIGNIN_CODE = getEnvVariable("ADMIN_REGISTER_CODE");
const SHOPIFY_ADMIN_API_URL = getEnvVariable("SHOPIFY_ADMIN_API_URL");
const SHOPIFY_ACCESS_TOKEN = getEnvVariable("SHOPIFY_ACCESS_TOKEN");

export const registerUser = async (newUser: UserFormValues) => {
  const validateInput = UserSchema.safeParse(newUser);

  if (!validateInput.success) {
    const errorMessage = validateInput.error.issues
      .map((issue) => `${issue.path[0]}: ${issue.message}`)
      .join(". ");
    return { error: errorMessage };
  }

  try {
    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validateInput.data.email },
    });

    if (existingUser) {
      return {
        error: "A user with this email already exists",
      };
    }
    // Validate and update DB code
    if (SIGNIN_CODE !== validateInput.data.code) {
      return {
        error: "Invalid code",
      };
    }

    const hashedPassword = await bcrypt.hash(validateInput.data.password, 10);

    await prisma.user.create({
      data: {
        email: validateInput.data.email,
        firstName: validateInput.data.firstName,
        lastName: validateInput.data.lastName,
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error details:", error);
    return { error: "An error occurred while adding the user." };
  }
};

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
            title: "30% Off Discount",
            target_type: "line_item",
            target_selection: "all",
            allocation_method: "across",
            value_type: "percentage",
            value: "-30.0",
            customer_selection: "all",
            starts_at: new Date().toISOString(),
          },
        }),
      }
    );

    const responseBody = await createResponse.text();
    console.log(
      "Create price rule response:",
      createResponse.status,
      responseBody
    );

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
    console.log("Fetch price rules response:", response.status, responseBody);

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

      const randomCode = `DISCOUNT-${Math.random()
        .toString(36)
        .substr(2, 8)
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
