"use client";

import { fetchPriceRules } from "@/app/actions/shopify";
import { useState } from "react";

export default function PriceRuleFetcher() {
  const [priceRules, setPriceRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchPriceRules = async () => {
    setLoading(true);
    setError(null);

    try {
      const rules = await fetchPriceRules();
      setPriceRules(rules);
    } catch (err: any) {
      setError(err.message || "Failed to fetch price rules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Shopify Price Rules</h1>

      {/* Fetch Button */}
      <button
        onClick={handleFetchPriceRules}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0070f3",
          color: "#fff",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Price Rules"}
      </button>

      {/* Display Results */}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {priceRules.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Fetched Price Rules:</h3>
          <ul>
            {priceRules.map((rule) => (
              <li key={rule.id}>
                <strong>{rule.title}</strong>: {rule.value_type} {rule.value}
              </li>
            ))}
          </ul>
        </div>
      )}

      {priceRules.length === 0 && !loading && !error && (
        <p>No price rules found.</p>
      )}
    </div>
  );
}
