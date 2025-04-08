"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SIGIN_WIRING } from "@/app/Backend/Axios/wiring";

const signInSchema = z.object({
  usernameOrEmail: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const response = await SIGIN_WIRING.login(data.usernameOrEmail, data.password);
      console.log("Signin response:", response);
      
      if (response.success) {
        router.push("/dashboard");
      } else {
        alert(response.message || "Invalid credentials");
      }
    } catch (error: any) {
      console.error("Signin error:", error);
      alert(error.message || "Sign-in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black border border-gray-800 rounded-xl p-8">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-md flex items-center justify-center border border-gray-700">
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <Link href="/" className="text-white text-2xl font-semibold">
              Darkdrop
            </Link>
          </div>
          <h2 className="text-2xl font-semibold text-white mt-4">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="usernameOrEmail" className="text-white">
              Username or Email
            </Label>
            <Input
              type="text"
              id="usernameOrEmail"
              {...register("usernameOrEmail")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
              placeholder="Enter username or email"
            />
            {errors.usernameOrEmail && (
              <p className="text-red-500 text-sm">{errors.usernameOrEmail.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              {...register("password")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black"
          >
            {isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage;