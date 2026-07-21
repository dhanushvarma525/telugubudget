"use client";

import { useEffect } from "react";

export default function ViewTracker({
  productId,
}: {
  productId: number;
}) {
  useEffect(() => {
    fetch(`/api/products/${productId}/view`, {
      method: "POST",
    });
  }, [productId]);

  return null;
}