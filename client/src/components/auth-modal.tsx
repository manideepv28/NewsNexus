import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { insertUserSchema, loginUserSchema } from "@shared/schema";
import type { InsertUser, LoginUser } from "@shared/schema";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginUserSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
    },
  });

  const handleLogin = async (data: LoginUser) => {
    try {
      await login(data);
      toast({
        title: "Welcome back!",
        description: "You have been successfully signed in.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (data: InsertUser) => {
    try {
      await register(data);
      toast({
        title: "Account created!",
        description: "Welcome to NewsHub. You have been automatically signed in.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different details.",
        variant: "destructive",
      });
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    loginForm.reset();
    registerForm.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md animate-fade-in">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isSignUp ? "Create Account" : "Sign In"}
          </DialogTitle>
        </DialogHeader>

        {!isSignUp ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" />
                  <label htmlFor="remember" className="text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>
                <Button variant="link" className="text-sm p-0">
                  Forgot password?
                </Button>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...registerForm}>
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Choose a username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={registerForm.formState.isSubmitting}
              >
                {registerForm.formState.isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}
            <Button variant="link" onClick={switchMode} className="ml-1 p-0">
              {isSignUp ? "Sign in" : "Sign up"}
            </Button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
