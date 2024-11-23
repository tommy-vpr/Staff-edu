"use server";

import { StaffSchema, StaffFormValues } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const registerInfluencer = async (newStaff: StaffFormValues) => {
  const validateInput = StaffSchema.safeParse(newStaff);

  // console.log(validateInput.data?.codes?.at(0)?.code);

  if (!validateInput.success) {
    const errorMessage = validateInput.error.issues
      .map((issue) => `${issue.path[0]}: ${issue.message}`)
      .join(". ");
    return { error: errorMessage };
  }

  try {
    // Check if email exists
    const existingInfluencer = await prisma.influencer.findUnique({
      where: { email: validateInput.data.email },
    });

    if (existingInfluencer) {
      return {
        error: "An influencer with this email already exists",
      };
    }
    // Validate and update DB code
    const validateCode = await prisma.generatedCodes.findUnique({
      where: {
        code: validateInput.data.inviteCode,
        status: false,
      },
    });

    if (!validateCode) {
      return {
        error: "Invalid code or code has been used",
      };
    }

    await prisma.generatedCodes.update({
      where: { code: validateCode.code },
      data: {
        status: true,
        email: validateInput.data.email,
      },
    });

    if (validateInput.data.inviteCode) {
      const hashedPassword = await bcrypt.hash(
        validateInput.data.inviteCode,
        10
      );

      await prisma.influencer.create({
        data: {
          ...validateInput.data,
          password: hashedPassword,
          inviteCode: {
            create: {
              inviteCode: validateInput.data.inviteCode, // Access code from `validateInput.data`
              email: validateInput.data.email,
            },
          },
        },
      });
    }

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
        message:
          "Influencer added, but Klaviyo subscription encountered an error.",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Error details:", error);
    return { error: "An error occurred while adding the influencer." };
  }
};
