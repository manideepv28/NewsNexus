import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "wouter";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/header";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { updateUserSchema } from "@shared/schema";
import type { UpdateUser } from "@shared/schema";

const newsCategories = [
  { id: "technology", label: "Technology" },
  { id: "politics", label: "Politics" },
  { id: "sports", label: "Sports" },
  { id: "business", label: "Business" },
  { id: "health", label: "Health" },
  { id: "entertainment", label: "Entertainment" },
];

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();

  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      preferences: user?.preferences || [],
    },
  });

  const handleSubmit = async (data: UpdateUser) => {
    try {
      await updateProfile(data);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header onSearch={() => {}} />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Please sign in to access your profile.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={() => {}} />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to News
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile & Preferences</CardTitle>
            <CardDescription>
              Manage your personal information and customize your news feed
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
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
                      control={form.control}
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
                  </div>
                </div>

                {/* News Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">News Preferences</h3>
                  <p className="text-sm text-muted-foreground">
                    Select your interests to personalize your news feed
                  </p>
                  
                  <FormField
                    control={form.control}
                    name="preferences"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {newsCategories.map((category) => (
                            <FormItem
                              key={category.id}
                              className="flex flex-row items-start space-x-2 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    const currentPreferences = field.value || [];
                                    if (checked) {
                                      field.onChange([...currentPreferences, category.id]);
                                    } else {
                                      field.onChange(
                                        currentPreferences.filter((pref) => pref !== category.id)
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm cursor-pointer">
                                {category.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
