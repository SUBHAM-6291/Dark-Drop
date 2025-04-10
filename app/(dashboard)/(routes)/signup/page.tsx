
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/app/Backend/services/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { USER_ZOD, UserZodType } from "@/app/Backend/zod/UserModel.zod";
import { signIn } from "next-auth/react";

const SignupPage = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UserZodType>({
    resolver: zodResolver(USER_ZOD),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: UserZodType) => {
    try {
      const { username, email, password } = data;
      const signupData = { username, email, password };
      await api.signup(signupData);
      router.push("/dashboard");
      reset();
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        console.error("Google sign-in error:", result.error);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-black border border-gray-800 rounded-xl p-8 shadow-xl shadow-gray-900/60">
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-black rounded-md flex items-center justify-center border border-gray-700">
              <span className="text-white text-xl font-bold">D</span>
            </div>
            <Link
              href="/"
              className="text-white text-2xl font-semibold hover:text-gray-300 transition-colors duration-300"
            >
              Darkdrop
            </Link>
          </div>
          <p className="text-sm text-gray-300 mt-2">
            Welcome to the World’s Fastest File-Saving App
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-white mb-6 text-center">
          Create an Account
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white text-sm font-medium">
              Username
            </Label>
            <Input
              type="text"
              id="username"
              {...register("username")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white text-sm font-medium">
              Email
            </Label>
            <Input
              type="email"
              id="email"
              {...register("email")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white text-sm font-medium">
              Password
            </Label>
            <Input
              type="password"
              id="password"
              {...register("password")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Enter password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="confirmPassword"
              className="text-white text-sm font-medium"
            >
              Confirm Password
            </Label>
            <Input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-400 focus:border-white/70 focus:ring-2 focus:ring-white/30 rounded-md transition-all duration-300"
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-semibold rounded-md hover:bg-gray-100 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-300">Or continue with</span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-white/50 hover:scale-105 rounded-md transition-all duration-300 ease-in-out"
          >
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.22 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-300">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-white hover:text-gray-200 hover:underline transition-colors duration-200"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
