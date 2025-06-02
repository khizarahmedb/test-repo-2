"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { getRoles } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

export function UserUpdateModal({
  isOpen,
  onClose,
  onSave,
  selectedUser,
  onDelete,
}) {
  const { user } = useUserStore();
  const [rolesData, setRolesData] = useState([]);
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e, opName) => {
    if (opName) {
      setFormData({ ...formData, [opName]: e });
    } else {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: typeof e !== "object" ? e : value,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.user_name.trim()) newErrors.user_name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password && selectedUser === null)
      newErrors.password = "Password is required";

    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form", {
        description: "Some required fields are missing or invalid.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data for API
      const apiData = {
        name: formData.user_name,
        email: formData.email,
        password: formData.password,
        role_id: +formData.role,
      };

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving user:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      const fetchRoles = async () => {
        try {
          // Get token from user store
          const token = user?.token;

          // Call the API service function with pagination parameters
          const response = await getRoles(token);
          console.log("Roles API Response:", response);

          // Check for API errors using hasError property
          if (response?.hasError) {
            const errorMessage =
              response.message || "Failed to load roles. Please try again.";
            setRolesData([]);
            toast.error("Failed to load roles", {
              description: errorMessage,
            });
            return;
          }

          // Update state with the actual API data
          if (response && response.body) {
            // set roles data to state
            setRolesData(response.body);
          } else {
            // set roles data to empty array
            setRolesData([]);
          }
        } catch (error) {
          console.error("Error fetching roles:", error);
          const errorMessage =
            error.response?.data?.message ||
            "Failed to load roles. Please try again.";
          setRolesData([]);
          toast.error("Failed to load roles", {
            description: errorMessage,
          });
        }
      };
      fetchRoles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      setFormData({
        user_name: selectedUser.name,
        email: selectedUser.email,
        role: String(selectedUser.role_id),
      });
    } else {
      setFormData({
        user_name: "",
        email: "",
        password: "",
        role: "",
      });
    }
    setErrors({});
  }, [selectedUser, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161616] rounded-xl w-full max-w-xl p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add User</h2>
          {selectedUser && (
            <Button className={"bg-[#FF0000]"} onClick={onDelete}>
              Delete User
            </Button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* User Name */}
            <div>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full bg-[#242424] border ${
                  errors.user_name ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.user_name && (
                <p className="text-red-500 text-xs mt-1">{errors.user_name}</p>
              )}
            </div>

            {/* Email Code */}
            <div>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full bg-[#242424] border ${
                  errors.email ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {selectedUser === null && (
              <>
                {/* Passowrd */}
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`w-full bg-[#242424] border ${
                      errors.password ? "border-red-500" : "border-gray-700"
                    } rounded-md p-3 text-white placeholder-gray-400`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Role */}

            <div>
              <Select
                name="role"
                value={formData.role}
                onValueChange={(e) => handleChange(e, "role")}
              >
                <SelectTrigger
                  className={`w-full bg-[#242424] text-base cursor-pointer border ${
                    errors.role ? "border-red-500" : "border-gray-700"
                  } rounded-md p-6 text-white placeholder-gray-400`}
                >
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent className={"text-white"}>
                  {rolesData.length > 0 &&
                    rolesData.map((role) => {
                      return (
                        <SelectItem
                          value={String(role.id)}
                          key={role.id}
                          className={"p-4 text-base"}
                        >
                          {role.name}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-red-500 text-xs mt-1">{errors.role}</p>
              )}
            </div>

            {/* Form Error */}
            {errors.form && (
              <p className="text-red-500 text-sm">{errors.form}</p>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn-gradient-gray text-white py-3 rounded-md hover:bg-gray-600 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-gradient-paint text-white py-3 rounded-md transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
