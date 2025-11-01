import React from "react";
import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { funnelsService } from "../services/funnelsService";
import { Funnel } from "../modules/funnels/types";
import { FunnelLivePreview } from "../modules/funnels/components/FunnelLivePreview";
import LoadingSpinner from "../components/LoadingSpinner";

interface FunnelPageProps {}

interface FunnelPageParams extends Record<string, string | undefined> {
  orgSlug: string;
  funnelSlug: string;
}
export const FunnelPage: React.FC<FunnelPageProps> = () => {
  const { orgSlug, funnelSlug } = useParams<FunnelPageParams>();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFunnel = async () => {
      if (!orgSlug || !funnelSlug) {
        setError("Missing organization or funnel slug");
        setLoading(false);
        return;
      }

      try {
        // Load funnel by organization and funnel slug
        const funnelData = await funnelsService.getFunnelBySlug(
          orgSlug,
          funnelSlug,
        );

        if (!funnelData) {
          setError("Funnel not found");
          setLoading(false);
          return;
        }

        // Check if funnel is published
        if (!funnelData.isPublished) {
          setError("This funnel is not published");
          setLoading(false);
          return;
        }

        setFunnel(funnelData);
      } catch (err) {
        console.error("Error loading funnel:", err);
        setError("Failed to load funnel");
      } finally {
        setLoading(false);
      }
    };

    loadFunnel();
  }, [orgSlug, funnelSlug]);

  // Track funnel visit
  useEffect(() => {
    if (funnel) {
      funnelsService
        .registerFunnelEvent(funnel.id, "direct", "awareness")
        .catch(console.error);
    }
  }, [funnel]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
          <p className="text-gray-600 mb-6">
            The funnel you're looking for might have been moved or doesn't
            exist.
          </p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen">
      <FunnelLivePreview funnel={funnel} onBack={() => window.history.back()} />
    </div>
  );
};

// Helper function to extract UTM parameters from URL
function extractUtmParams(): Record<string, string> {
  const urlParams = new URLSearchParams(window.location.search);
  const utmParams: Record<string, string> = {};

  const utmKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
  ];

  utmKeys.forEach((key) => {
    const value = urlParams.get(key);
    if (value) {
      utmParams[key] = value;
    }
  });

  return utmParams;
}
