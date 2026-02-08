"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function RegisterPage() {
  return (
    <div className="card-body">
      <h2 className="card-title text-center text-2xl font-bold">Create an Account</h2>
      <p className="text-center text-base-content/70">Join us and manage your stripes seamlessly</p>

      <form className="form-control space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            label="First Name"
            type="text"
            id="firstName"
            placeholder="John"
          />
          <Input
            label="Last Name"
            type="text"
            id="lastName"
            placeholder="Doe"
          />
        </div>

        <Input
          label="Email"
          type="email"
          id="email"
          placeholder="you@example.com"
        />

        <Input
          label="Password"
          type="password"
          id="password"
          placeholder="••••••••"
        />

        <Input
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          placeholder="••••••••"
        />

        <div className="w-full">
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-base-content/70">
        Already a member?{" "}
        <Link href="/login" className="link link-hover text-primary">
          Sign In
        </Link>
      </p>
    </div>
  );
}