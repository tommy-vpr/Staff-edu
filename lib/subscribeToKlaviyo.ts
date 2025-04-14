// lib/subscribeToKlaviyo.ts
export async function subscribeToKlaviyo(email: string) {
  const klaviyoApiKey = process.env.KLAVIYO_API_KEY!;
  const klaviyoListId = process.env.KLAVIYO_LIST_ID!;
  const url = "https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs";

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
                  email,
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

  const res = await fetch(url, options);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Klaviyo subscription failed: ${errorText}`);
  }

  return await res.json();
}
