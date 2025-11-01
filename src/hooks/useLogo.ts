import { useState, useEffect } from "react";
import React from "react";

export const useLogo = () => {
  const [customLogo, setCustomLogo] = useState<string | null>(null);

  useEffect(() => {
    // Cargar logo personalizado desde localStorage
    const savedLogo = localStorage.getItem("mundero_custom_logo");
    if (savedLogo) {
      setCustomLogo(savedLogo);
    }
  }, []);

  const getLogoElement = (
    className: string = "text-2xl font-bold text-white",
  ) => {
    if (customLogo) {
      return React.createElement("img", {
        src: customLogo,
        alt: "MUNDERO Logo",
        className: "w-full h-full object-cover rounded-2xl",
      });
    }

    return React.createElement("span", { className }, "M");
  };

  const getLogoUrl = () => {
    return customLogo || null;
  };

  return {
    customLogo,
    getLogoElement,
    getLogoUrl,
    hasCustomLogo: !!customLogo,
  };
};
