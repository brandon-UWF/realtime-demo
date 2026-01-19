'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/client"

// 1. Define the validation schema
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

// Extract the type from the schema
type SignupValues = z.infer<typeof signupSchema>

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const supabase = createClient()

  // 2. Initialize the form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    }
  })

  // 3. Define the submission logic
  const onSubmit = async (values: SignupValues) => {
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.name },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    })

    if (error) {
      alert(error.message)
    }
  }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Enter your information below to create your account</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Pass the RHF handleSubmit to the form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* Full Name */}
            <Field>
              <FieldLabel htmlFor="name">Full Name</FieldLabel>
              <Input 
                id="name" 
                placeholder="John Doe" 
                {...register("name")} // Connect to RHF
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </Field>

            {/* Email */}
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
              />
              <FieldDescription>We&apos;ll use this to contact you.</FieldDescription>
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input 
                id="password" 
                type="password" 
                {...register("password")} 
              />
              <FieldDescription>At least 8 characters long.</FieldDescription>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </Field>

            {/* Confirm Password */}
            <Field>
              <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
              <Input 
                id="confirm-password" 
                type="password" 
                {...register("confirmPassword")} 
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </Field>

            <FieldGroup>
              <Field>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                </Button>
                <FieldDescription className="px-6 text-center mt-4">
                  Already have an account? <a href="#" className="underline">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}