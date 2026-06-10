"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterSchema,
} from "@/server/validations/auth.validation";
import { registerAction } from "@/actions/auth.actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SubmitButton from "@/features/auth/components/SubmitButton";
import Link from "next/link";

export default function RegisterPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(data: RegisterSchema) {
    setServerError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", data.name);
      fd.set("email", data.email);
      fd.set("password", data.password);
      const res = await registerAction(fd);
      if (res && !res.success) setServerError(res.message);
    });
  }

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Create account</h1>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input {...register("name")} />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label>Email</Label>
          <Input {...register("email")} />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" {...register("password")} />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        {serverError && <p className="text-sm text-red-500">{serverError}</p>}
        <div>
          <SubmitButton pending={isPending}>Create account</SubmitButton>
        </div>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="text-primary">
          Sign in
        </Link>
      </p>
    </div>
  );
}
