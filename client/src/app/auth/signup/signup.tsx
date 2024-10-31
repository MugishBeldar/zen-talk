import useSignUpController from "./signup.controller";

import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { useState } from "react";
import { FormError, FormSuccess } from "../../../components/form-response";
import { Eye, EyeOff } from "lucide-react";

export default function Signup() {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const {
    form,
    onSubmit,
    showPassword,
    confirmPasswordInputType,
    passwordinputType,
  } = useSignUpController({
    setError,
    setSuccess,
  });
  const isLoading = form.formState.isSubmitting;

  return (
    <div className="flex flex-1 h-full items-center justify-center">
      <div className="bg-secondary-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel className="">Email</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
                        placeholder="Enter your email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel className="">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={passwordinputType}
                          disabled={isLoading}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
                          placeholder="Enter your password"
                          {...field}
                        />
                        {passwordinputType === "password" ? (
                          <EyeOff
                            onClick={() => showPassword("password")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-gray cursor-pointer"
                          />
                        ) : (
                          <Eye
                            onClick={() => showPassword("password")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-indigo cursor-pointer"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="mb-2">
                    <FormLabel className="">Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={confirmPasswordInputType}
                          disabled={isLoading}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
                          placeholder="Enter your password"
                          {...field}
                        />
                        {confirmPasswordInputType === "password" ? (
                          <EyeOff
                            onClick={() => showPassword("confirmPassword")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-gray cursor-pointer"
                          />
                        ) : (
                          <Eye
                            onClick={() => showPassword("confirmPassword")}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-indigo cursor-pointer"
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormError message={error} />
            <FormSuccess message={success} />
            <Button
              size={"sm"}
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 mt-4 bg-primary-indigo text-primary-white text-lg rounded-lg hover:bg-secondary-indigo focus:ring-2 focus:ring-secondary-indigo"
            >
              Sign Up
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
