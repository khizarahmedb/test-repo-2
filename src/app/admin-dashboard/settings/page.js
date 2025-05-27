"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { Eye, EyeOff } from "lucide-react";
import { changePassword } from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { setRoute } = useNavigationStore();
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState("Personal");
  const [formData, setFormData] = useState({
    name: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/admin-dashboard/settings");
  }, [setRoute]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear API error when user starts typing
    if (apiError) {
      setApiError(null);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.current_password) {
      newErrors.current_password = "Current password is required";
    }

    if (!formData.new_password) {
      newErrors.new_password = "New password is required";
    } else if (formData.new_password.length < 6) {
      newErrors.new_password = "New password must be at least 6 characters";
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = "Please confirm your new password";
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }

    if (formData.current_password === formData.new_password) {
      newErrors.new_password =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous API errors
    setApiError(null);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Get token from user store
      const token = user?.token;

      // Prepare data for API (matching the request body structure from the screenshot)
      const apiData = {
        name: formData.name,
        current_password: formData.current_password,
        new_password: formData.new_password,
      };

      const response = await changePassword(apiData, token);
      console.log("Change password API response:", response);

      // Check for API errors using hasError property
      if (response?.hasError === true) {
        const errorMessage = response.message || "Failed to update password";
        setApiError(errorMessage);
        toast.error("Failed to update password", {
          description: errorMessage,
        });
        return;
      }

      // Success case
      toast.success("Password updated successfully", {
        description: "Your password has been changed successfully.",
      });

      // Clear password fields after successful update
      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
      setApiError(null);
    } catch (error) {
      console.error("Error updating password:", error);

      // Handle different types of errors
      let errorMessage = "An unexpected error occurred";

      // Check if the error response has hasError field
      if (error.response?.data?.hasError === true) {
        errorMessage =
          error.response.data.message || "Failed to update password";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setApiError(errorMessage);
      toast.error("Failed to update password", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset password fields
    setFormData((prev) => ({
      ...prev,
      current_password: "",
      new_password: "",
      confirm_password: "",
    }));
    setErrors({});
    setApiError(null);
  };

  const tabs = ["Personal", "Referrals", "Reseller"];

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Settings</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab
                ? "bg-white text-black"
                : "bg-transparent text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "Personal" && (
        <div className="bg-[#161616] rounded-lg border w-1/2 border-purple-600 p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            {/* API Error Display */}
            {apiError && (
              <div className="bg-red-900/20 border border-red-500 rounded-md p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">Error</h3>
                    <div className="mt-1 text-sm text-red-300">{apiError}</div>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      type="button"
                      onClick={() => setApiError(null)}
                      className="inline-flex rounded-md text-red-400 hover:text-red-300 focus:outline-none"
                    >
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* General Info Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                General Info
              </h3>
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Name"
                  className={`w-full bg-[#242424] border ${
                    errors.name ? "border-red-500" : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4 mt-5">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
                Security
              </h3>

              {/* Current Password */}
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="Current Password"
                  className={`w-full bg-[#242424] border ${
                    errors.current_password
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.current ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.current_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.current_password}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="New Password"
                  className={`w-full bg-[#242424] border ${
                    errors.new_password ? "border-red-500" : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.new_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.new_password}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Confirm New Password"
                  className={`w-full bg-[#242424] border ${
                    errors.confirm_password
                      ? "border-red-500"
                      : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400 pr-12`}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
                {errors.confirm_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirm_password}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="btn-gradient-paint cursor-pointer text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-gradient-gray text-white cursor-pointer  px-6 py-3 rounded-md font-medium transition-colors flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Placeholder content for other tabs */}
      {activeTab === "Referrals" && (
        <div className="bg-[#161616] rounded-lg border border-purple-600 p-6">
          <p className="text-gray-400">Referrals content coming soon...</p>
        </div>
      )}

      {activeTab === "Reseller" && (
        <div className="bg-[#161616] rounded-lg border border-purple-600 p-6">
          <p className="text-gray-400">Reseller content coming soon...</p>
        </div>
      )}
    </div>
  );
}
