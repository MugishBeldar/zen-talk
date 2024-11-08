import { stateType } from "@/types/store";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { CameraIcon, LoaderCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useSettingController from "./setting.controller";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Setting = () => {
  const { form, onSubmit, profilePic, handleProfilePicChange, handleCancel } =
    useSettingController();
  const { userId } = useParams();
  const user = useSelector(
    (state: stateType) => state.loggedUserState.loggedUser
  );
  const isLoading = form.formState.isSubmitting;

  return (
    <div className="p-6">
      <p className="text-xl font-medium">Setting</p>
      {user?.id === userId && (
        <div className="max-w-md w-full p-6 rounded-lg ">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col items-center mb-6">
                {/* Profile Picture */}
                <div className="relative mb-2">
                  <Avatar className="w-20 h-20">
                    <AvatarImage
                      src={
                        profilePic
                          ? profilePic
                          : `https://ui-avatars.com/api/?name=${user?.name}&background=eff6fc&color=7c3aed`
                      }
                      alt="Profile"
                      className="rounded-full border-2 border-gray-300"
                    />
                    <AvatarFallback>{user?.name}</AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profilePicInput"
                    className="absolute bottom-0 right-0 p-2 bg-primary-violet text-primary-white rounded-full cursor-pointer hover:bg-primary-white hover:text-primary-violet transition"
                  >
                    <CameraIcon size={15} />
                  </label>
                  <Input
                    id="profilePicInput"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>
                {/* Name Input */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="w-full mb-2">
                      <FormLabel className="text-sm text-gray-700">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-indigo focus-visible:ring-none focus-visible:ring-offset-0"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Action Buttons */}
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  type="submit"
                  className="w-1/2 mr-2 bg-primary-violet text-primary-white hover:bg-violet-400/70 focus:ring-2 focus:ring-violet-400/70"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle
                      className="animate-spin text-primary-white"
                      style={{ width: "30px", height: "30px" }}
                    />
                  ) : (
                    "Update"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-1/2  bg-gray-200 hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};

export default Setting;
