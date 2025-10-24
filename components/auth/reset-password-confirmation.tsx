import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

export function ResetPasswordConfirmation({ ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card {...props}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>
          We've sent you a password reset link. Please check your email and
          click the link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild className="w-full">
          <a href="/login">Return to Login</a>
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{" "}
          <a href="/reset-password" className="underline">
            try again
          </a>
          {" "}|{" "}
          <a href="/reset-password/new-password" className="underline">
            simulate email link
          </a>
        </p>
      </CardContent>
    </Card>
  )
}