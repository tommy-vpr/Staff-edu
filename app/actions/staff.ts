"use server";

import { StaffSchema, StaffFormValues } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getErrorMessage } from "@/lib/utils";

export const registerStaff = async (newStaff: StaffFormValues) => {
  try {
    const validateInput = StaffSchema.safeParse(newStaff);
    if (!validateInput.success) {
      const errorMessage = validateInput.error.issues
        .map((issue) => `${issue.path[0]}: ${issue.message}`)
        .join(". ");
      return { error: errorMessage };
    }

    const existingStaff = await prisma.staff.findUnique({
      where: { email: validateInput.data.email },
    });

    if (existingStaff) {
      return { error: "A staff member with this email already exists." };
    }

    const validateCode = await prisma.generatedCodes.findFirst({
      where: {
        code: validateInput.data.inviteCode,
        status: false,
      },
    });

    if (!validateCode) {
      console.error("Invalid or used invite code");
      return {
        error: "Invalid invite code or the code has already been used.",
      };
    }

    const hashedPassword = await bcrypt.hash(validateInput.data.inviteCode, 10);

    await prisma.staff.create({
      data: {
        ...validateInput.data,
        password: hashedPassword,
        inviteCode: {
          create: {
            code: validateInput.data.inviteCode,
          },
        },
        coupon: {
          create: {
            code: validateInput.data.inviteCode,
          },
        },
      },
    });

    await prisma.generatedCodes.update({
      where: { id: validateCode.id },
      data: {
        status: true,
        email: validateInput.data.email,
      },
    });

    // Step 2: Subscribe the user to Klaviyo
    const klaviyoApiKey = process.env.KLAVIYO_API_KEY;
    const klaviyoListId = process.env.KLAVIYO_LIST_ID;
    const url =
      "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";

    const options = {
      method: "POST",
      headers: {
        accept: "application/vnd.api+json",
        revision: "2024-10-15",
        "content-type": "application/vnd.api+json",
        Authorization: `Klaviyo-API-Key ${klaviyoApiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: {
              data: [
                {
                  type: "profile",
                  attributes: {
                    email: newStaff.email,
                    subscriptions: {
                      email: {
                        marketing: {
                          consent: "SUBSCRIBED",
                        },
                      },
                    },
                  },
                },
              ],
            },
            historical_import: false,
          },
          relationships: {
            list: {
              data: {
                type: "list",
                id: klaviyoListId,
              },
            },
          },
        },
      }),
    };

    const klaviyoResponse = await fetch(url, options);

    let responseJson;
    if (
      klaviyoResponse.ok &&
      klaviyoResponse.headers.get("content-type")?.includes("application/json")
    ) {
      responseJson = await klaviyoResponse.json();
    } else {
      // Log or handle non-JSON response
      const errorText = await klaviyoResponse.text();
      console.error("Klaviyo subscription response error:", errorText);
      return {
        success: true,
        message: "Staff added, but Klaviyo subscription encountered an error.",
      };
    }

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Unexpected error:", errorMessage); // Log unexpected errors
    return { error: errorMessage };
  }
};
