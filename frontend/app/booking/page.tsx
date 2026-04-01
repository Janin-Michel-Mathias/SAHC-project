"use client"

import { useEffect, useState } from "react";
import Parking from "@/components/booking/parking";

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
      return;
    }
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return null;
  }

  return (
    <div className="grid min-h-svh place-items-center p-6">
      <Parking />
    </div>
  )
}
