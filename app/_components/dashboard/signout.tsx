/*"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { apiService } from "@/app/Backend/services/axios";

const Signout = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
      await signOut({ redirect: false });
      toast.success("Logged out successfully!");
      router.push("/signin");
      router.refresh();
    } catch (error: any) {
      console.error("Signout error:", error);
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSignout}
      disabled={isLoading}
      className="w-full text-left py-2 px-4 rounded-lg bg-black hover:bg-gray-800 transition-all duration-200 flex items-center gap-3 text-white"
    >
      <span className="text-gray-400 text-lg">🏃</span>
      <span className="text-white font-semibold">
        {isLoading ? "Signing Out..." : "Sign Out"}
      </span>
    </Button>
  );
};

export default Signout;*/