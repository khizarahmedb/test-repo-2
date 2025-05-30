"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import {
  changePassword,
  changeUsername,
  getReferralSettings,
  setReferralSettings,
  getResellerProfit,
  setResellerProfit,
} from "@/lib/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { setRoute } = useNavigationStore();
  const { user, setUser } = useUserStore();
  const [activeTab, setActiveTab] = useState("Personal");

  // Personal tab state
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

  // Username change state
  const [isUsernameSubmitting, setIsUsernameSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState(null);
  const [originalName, setOriginalName] = useState("");

  // Referrals tab state
  const [referralData, setReferralData] = useState({
    type: "Wallet",
    amount: "",
    percent: "",
  });
  const [referralErrors, setReferralErrors] = useState({});
  const [isReferralSubmitting, setIsReferralSubmitting] = useState(false);
  const [referralApiError, setReferralApiError] = useState(null);
  const [isReferralLoading, setIsReferralLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Reseller tab state
  const [resellerData, setResellerData] = useState({
    percent: "",
  });
  const [resellerErrors, setResellerErrors] = useState({});
  const [isResellerSubmitting, setIsResellerSubmitting] = useState(false);
  const [resellerApiError, setResellerApiError] = useState(null);
  const [isResellerLoading, setIsResellerLoading] = useState(false);

  const rewardTypes = ["Wallet", "Cart"];

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/admin-dashboard/settings");
  }, [setRoute]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      const userName = user.name || "";
      setFormData((prev) => ({
        ...prev,
        name: userName,
      }));
      setOriginalName(userName);
    }
  }, [user]);

  // Load referral settings when Referrals tab is active
  useEffect(() => {
    if (activeTab === "Referrals" && user?.token) {
      loadReferralSettings();
    }
  }, [activeTab, user?.token]);

  // Load reseller settings when Reseller tab is active
  useEffect(() => {
    if (activeTab === "Reseller" && user?.token) {
      loadResellerSettings();
    }
  }, [activeTab, user?.token]);

  const loadReferralSettings = async () => {
    setIsReferralLoading(true);
    setReferralApiError(null);
    try {
      const response = await getReferralSettings(user?.token);
      console.log("Referral settings response:", response);

      if (response?.hasError === true) {
        const errorMessage =
          response.message || "Failed to load referral settings";
        setReferralApiError(errorMessage);
        return;
      }

      // Update referral data with response
      if (response && response.body) {
        setReferralData({
          type: response.body.type || "Wallet",
          amount: response.body.amount || "",
          percent: response.body.percent || "",
        });
      }
    } catch (error) {
      console.error("Error loading referral settings:", error);
      let errorMessage = "Failed to load referral settings";

      if (error.response?.data?.hasError === true) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setReferralApiError(errorMessage);
    } finally {
      setIsReferralLoading(false);
    }
  };

  const loadResellerSettings = async () => {
    setIsResellerLoading(true);
    setResellerApiError(null);
    try {
      const response = await getResellerProfit(user?.token);
      console.log("Reseller profit response:", response);

      if (response?.hasError === true) {
        const errorMessage =
          response.message || "Failed to load reseller settings";
        setResellerApiError(errorMessage);
        return;
      }

      // Update reseller data with response
      if (response && response.body) {
        setResellerData({
          percent: response.body.percent || "",
        });
      }
    } catch (error) {
      console.error("Error loading reseller settings:", error);
      let errorMessage = "Failed to load reseller settings";

      if (error.response?.data?.hasError === true) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResellerApiError(errorMessage);
    } finally {
      setIsResellerLoading(false);
    }
  };

  // Personal tab handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (apiError) {
      setApiError(null);
    }

    if (usernameError) {
      setUsernameError(null);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Username change handlers
  const handleUsernameChange = async () => {
    if (!formData.name.trim()) {
      setUsernameError("Name is required");
      return;
    }

    if (formData.name === originalName) {
      setUsernameError("New name must be different from current name");
      return;
    }

    setIsUsernameSubmitting(true);
    setUsernameError(null);

    try {
      const token = user?.token;
      const nameData = {
        name: formData.name,
      };

      const response = await changeUsername(nameData, token);
      console.log("Change username API response:", response);

      if (response?.hasError === true) {
        const errorMessage = response.message || "Failed to update username";
        setUsernameError(errorMessage);
        toast.error("Failed to update username", {
          description: errorMessage,
        });
        return;
      }

      // Update user in store with new name
      setUser({
        ...user,
        name: formData.name,
      });

      setOriginalName(formData.name);
      toast.success("Username updated successfully", {
        description: "Your username has been changed successfully.",
      });
    } catch (error) {
      console.error("Error updating username:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.response?.data?.hasError === true) {
        errorMessage =
          error.response.data.message || "Failed to update username";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setUsernameError(errorMessage);
      toast.error("Failed to update username", {
        description: errorMessage,
      });
    } finally {
      setIsUsernameSubmitting(false);
    }
  };

  const handleUsernameCancel = () => {
    setFormData((prev) => ({
      ...prev,
      name: originalName,
    }));
    setUsernameError(null);
  };

  const validateForm = () => {
    const newErrors = {};

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
    setApiError(null);

    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = user?.token;
      const apiData = {
        name: formData.name,
        current_password: formData.current_password,
        new_password: formData.new_password,
      };

      const response = await changePassword(apiData, token);
      console.log("Change password API response:", response);

      if (response?.hasError === true) {
        const errorMessage = response.message || "Failed to update password";
        setApiError(errorMessage);
        toast.error("Failed to update password", {
          description: errorMessage,
        });
        return;
      }

      toast.success("Password updated successfully", {
        description: "Your password has been changed successfully.",
      });

      setFormData((prev) => ({
        ...prev,
        current_password: "",
        new_password: "",
        confirm_password: "",
      }));
      setApiError(null);
    } catch (error) {
      console.error("Error updating password:", error);
      let errorMessage = "An unexpected error occurred";

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
    setFormData((prev) => ({
      ...prev,
      current_password: "",
      new_password: "",
      confirm_password: "",
    }));
    setErrors({});
    setApiError(null);
  };

  // Referrals tab handlers
  const handleReferralChange = (e) => {
    const { name, value } = e.target;
    setReferralData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (referralErrors[name]) {
      setReferralErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (referralApiError) {
      setReferralApiError(null);
    }
  };

  const handleTypeSelect = (type) => {
    setReferralData((prev) => ({
      ...prev,
      type,
    }));
    setShowDropdown(false);
  };

  const validateReferralForm = () => {
    const newErrors = {};

    if (
      !referralData.amount ||
      isNaN(Number(referralData.amount)) ||
      Number(referralData.amount) <= 0
    ) {
      newErrors.amount = "Valid top-up amount is required";
    }

    if (
      !referralData.percent ||
      isNaN(Number(referralData.percent)) ||
      Number(referralData.percent) <= 0 ||
      Number(referralData.percent) > 100
    ) {
      newErrors.percent = "Valid cashback reward (1-100%) is required";
    }

    setReferralErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReferralSubmit = async (e) => {
    e.preventDefault();
    setReferralApiError(null);

    if (!validateReferralForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsReferralSubmitting(true);
    try {
      const token = user?.token;
      const apiData = {
        type: referralData.type,
        amount: Number(referralData.amount),
        percent: Number(referralData.percent),
      };

      const response = await setReferralSettings(apiData, token);
      console.log("Set referral settings API response:", response);

      if (response?.hasError === true) {
        const errorMessage =
          response.message || "Failed to update referral settings";
        setReferralApiError(errorMessage);
        toast.error("Failed to update referral settings", {
          description: errorMessage,
        });
        return;
      }

      toast.success("Referral settings updated successfully", {
        description: "Your referral settings have been saved.",
      });
    } catch (error) {
      console.error("Error updating referral settings:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.response?.data?.hasError === true) {
        errorMessage =
          error.response.data.message || "Failed to update referral settings";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setReferralApiError(errorMessage);
      toast.error("Failed to update referral settings", {
        description: errorMessage,
      });
    } finally {
      setIsReferralSubmitting(false);
    }
  };

  const handleReferralCancel = () => {
    loadReferralSettings(); // Reload original settings
    setReferralErrors({});
    setReferralApiError(null);
  };

  // Reseller tab handlers
  const handleResellerChange = (e) => {
    const { name, value } = e.target;
    setResellerData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (resellerErrors[name]) {
      setResellerErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    if (resellerApiError) {
      setResellerApiError(null);
    }
  };

  const validateResellerForm = () => {
    const newErrors = {};

    if (
      !resellerData.percent ||
      isNaN(Number(resellerData.percent)) ||
      Number(resellerData.percent) <= 0 ||
      Number(resellerData.percent) > 100
    ) {
      newErrors.percent = "Valid percentage (1-100%) is required";
    }

    setResellerErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResellerSubmit = async (e) => {
    e.preventDefault();
    setResellerApiError(null);

    if (!validateResellerForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsResellerSubmitting(true);
    try {
      const token = user?.token;
      const apiData = {
        percent: Number(resellerData.percent),
      };

      const response = await setResellerProfit(apiData, token);
      console.log("Set reseller profit API response:", response);

      if (response?.hasError === true) {
        const errorMessage =
          response.message || "Failed to update reseller settings";
        setResellerApiError(errorMessage);
        toast.error("Failed to update reseller settings", {
          description: errorMessage,
        });
        return;
      }

      toast.success("Reseller settings updated successfully", {
        description: "Your reseller profit settings have been saved.",
      });
    } catch (error) {
      console.error("Error updating reseller settings:", error);
      let errorMessage = "An unexpected error occurred";

      if (error.response?.data?.hasError === true) {
        errorMessage =
          error.response.data.message || "Failed to update reseller settings";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setResellerApiError(errorMessage);
      toast.error("Failed to update reseller settings", {
        description: errorMessage,
      });
    } finally {
      setIsResellerSubmitting(false);
    }
  };

  const handleResellerCancel = () => {
    loadResellerSettings(); // Reload original settings
    setResellerErrors({});
    setResellerApiError(null);
  };

  const tabs = ["Personal", "Referrals", "Reseller"];

  const ErrorBanner = ({ error, onClose }) => {
    if (!error) return null;

    return (
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
            <div className="mt-1 text-sm text-red-300">{error}</div>
          </div>
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md text-red-400 hover:text-red-300 focus:outline-none"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
    );
  };

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

      {/* Personal Tab Content */}
      {activeTab === "Personal" && (
        <div className="bg-[#161616] rounded-lg w-2/3 border border-purple-600 p-6 space-y-6">
          <form onSubmit={handleSubmit}>
            <ErrorBanner error={apiError} onClose={() => setApiError(null)} />

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
                    usernameError ? "border-red-500" : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400`}
                />
                {usernameError && (
                  <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                )}
              </div>

              {/* Username Change Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleUsernameChange}
                  className="btn-gradient-paint text-white px-6 py-2 rounded-md font-medium transition-colors"
                  disabled={
                    isUsernameSubmitting || formData.name === originalName
                  }
                >
                  {isUsernameSubmitting ? "Updating..." : "Change Username"}
                </button>
                <button
                  type="button"
                  onClick={handleUsernameCancel}
                  className="btn-gradient-gray text-white px-6 py-2 rounded-md font-medium transition-colors"
                  disabled={isUsernameSubmitting}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Security Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium mt-5 text-gray-400 uppercase tracking-wider">
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
                className="btn-gradient-paint text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-gradient-gray text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Referrals Tab Content */}
      {activeTab === "Referrals" && (
        <div className="bg-[#161616] rounded-lg w-2/3 border border-purple-600 p-6 space-y-6">
          {isReferralLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-white">Loading referral settings...</p>
            </div>
          ) : (
            <form onSubmit={handleReferralSubmit}>
              <ErrorBanner
                error={referralApiError}
                onClose={() => setReferralApiError(null)}
              />

              <div className="space-y-6">
                {/* Reward Type Dropdown */}
                <div className="space-y-2">
                  <label className="text-white text-sm font-medium mb-5">
                    Where should the user get the referral reward?
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="w-full bg-[#242424] border border-gray-700 rounded-md p-3 text-white text-left flex items-center justify-between hover:border-gray-600 transition-colors"
                    >
                      <span>{referralData.type}</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          showDropdown ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-[#242424] border border-gray-700 rounded-md shadow-lg z-10">
                        {rewardTypes.map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => handleTypeSelect(type)}
                            className="w-full px-3 py-2 text-left text-white hover:bg-gray-700 transition-colors first:rounded-t-md last:rounded-b-md"
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Amount and Percent Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">
                      Top-up Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        $
                      </span>
                      <input
                        type="number"
                        name="amount"
                        value={referralData.amount}
                        onChange={handleReferralChange}
                        placeholder="100"
                        className={`w-full bg-[#242424] border ${
                          referralErrors.amount
                            ? "border-red-500"
                            : "border-gray-700"
                        } rounded-md p-3 pl-8 text-white placeholder-gray-400`}
                      />
                    </div>
                    {referralErrors.amount && (
                      <p className="text-red-500 text-xs mt-1">
                        {referralErrors.amount}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium">
                      Cashback Reward
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="percent"
                        value={referralData.percent}
                        onChange={handleReferralChange}
                        placeholder="10"
                        className={`w-full bg-[#242424] border ${
                          referralErrors.percent
                            ? "border-red-500"
                            : "border-gray-700"
                        } rounded-md p-3 pr-8 text-white placeholder-gray-400`}
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        %
                      </span>
                    </div>
                    {referralErrors.percent && (
                      <p className="text-red-500 text-xs mt-1">
                        {referralErrors.percent}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn-gradient-paint text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                    disabled={isReferralSubmitting}
                  >
                    {isReferralSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={handleReferralCancel}
                    className="btn-gradient-gray text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                    disabled={isReferralSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reseller Tab Content */}
      {activeTab === "Reseller" && (
        <div className="bg-[#161616] rounded-lg border w-2/3 border-purple-600 p-6 space-y-6">
          {isResellerLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-white">Loading reseller settings...</p>
            </div>
          ) : (
            <form onSubmit={handleResellerSubmit}>
              <ErrorBanner
                error={resellerApiError}
                onClose={() => setResellerApiError(null)}
              />
              <div className="space-y-6">
                {/* Reseller Percentage */}
                <div className="space-y-2">
                  <label className="text-white pb-5 text-sm font-medium">
                    How much should the reseller get from their earnings?
                  </label>
                  <div className="relative ">
                    <input
                      type="number"
                      name="percent"
                      value={resellerData.percent}
                      onChange={handleResellerChange}
                      placeholder="%"
                      className={`w-full bg-[#242424] border ${
                        resellerErrors.percent
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-md p-3 pr-12 text-white placeholder-gray-400`}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-gray-600 rounded-md px-2 py-1">
                      <span className="text-white text-sm">%</span>
                    </div>
                  </div>
                  {resellerErrors.percent && (
                    <p className="text-red-500 text-xs mt-1">
                      {resellerErrors.percent}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="btn-gradient-paint text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                    disabled={isResellerSubmitting}
                  >
                    {isResellerSubmitting ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={handleResellerCancel}
                    className="btn-gradient-gray text-white px-6 py-3 rounded-md font-medium transition-colors flex-1"
                    disabled={isResellerSubmitting}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
