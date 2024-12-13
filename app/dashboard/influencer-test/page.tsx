"use client";

import React, { useEffect, useState } from "react";
import QuizComponent from "@/components/my-components/QuizComponent";
import { useCustomSession } from "@/lib/SessionContext";
import { getSession } from "next-auth/react";

const Page = () => {
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { session } = useCustomSession();

  console.log(session?.user);

  useEffect(() => {
    const fetchCouponCode = async () => {
      if (!session?.user?.takenTest) {
        setLoading(false); // Skip if the test is not taken
        return;
      }

      try {
        const response = await fetch("/api/getCoupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ staffId: session.user.id }),
        });
        const result = await response.json();
        if (result.success) {
          setCouponCode(result.code);
        } else {
          setError(result.error);
        }
      } catch (err) {
        console.error("Error fetching coupon:", err);
        setError("Failed to fetch coupon");
      } finally {
        setLoading(false); // Always stop loading after the attempt
      }
    };

    if (session) {
      fetchCouponCode();
    }
  }, [session]);

  if (!session) {
    return <div>Loading...</div>; // Handle loading state
  }

  if (loading) {
    return <div>Loading your coupon...</div>;
  }

  if (session.user.takenTest) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <div className="flex flex-col items-center justify-center w-3/4 lg:w-1/3 p-6 border border-gray-400">
          <p className="text-4xl font-bold">Thank you!</p>
          <p>Here's a 30% off coupon code</p>
          {couponCode ? (
            <p className="p-4 bg-green-400 w-full text-center mt-2 text-black">
              <b>{couponCode}</b>
            </p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p>Fetching your coupon...</p>
          )}
        </div>
      </div>
    );
  }

  return <QuizComponent />;
};

export default Page;
