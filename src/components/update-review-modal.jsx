"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import { getRoles } from "@/lib/api";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export function UpdateReviewModal({ isOpen, onClose, onSave, selectedReview }) {
  const { user } = useUserStore();
  const [stars, setStars] = useState([
    {
      value: 1,
      checked: false,
    },
    {
      value: 2,
      checked: false,
    },
    {
      value: 3,
      checked: false,
    },
    {
      value: 4,
      checked: false,
    },
    {
      value: 5,
      checked: false,
    },
  ]);
  const [formData, setFormData] = useState({
    stars: "",
    review_text: "",
    status: "",
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
    if (!formData.review_text.trim())
      newErrors.review_text = "Review text is required";
    if (!formData.status) newErrors.status = "Status is required";

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
        stars: formData.stars,
        review_text: formData.review_text,
        is_approved: formData.status === "approved",
      };

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving reviews:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const onStarClick = (value) => {
    const newStarsState = stars.map((item) => {
      if (item.value <= value) {
        return { ...item, checked: true };
      }
      return { ...item, checked: false };
    });
    setStars(newStarsState);
  };

  useEffect(() => {
    if (selectedReview) {
      setFormData({
        review_text: selectedReview.review_text,
        stars: selectedReview.stars,
        status: selectedReview.is_approved ? "approved" : "pending",
      });
      onStarClick(selectedReview.stars);
    } else {
      setFormData({
        review_text: "",
        stars: 0,
        status: "",
      });
    }
    setErrors({});
  }, [selectedReview, isOpen]);

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
      <div className="bg-[#161616] rounded-xl w-full max-w-[742px] p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[2rem] font-bold text-white">Update Review</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2.5">
              {stars.map((item) => {
                return (
                  <button
                    key={item.value}
                    className={cn(
                      "cursor-pointer hover:bg-[#FFFFFF26] transition-all rounded-[.75rem] bg-[#FFFFFF0D] h-[52px] flex justify-center items-center",
                      item.checked ? "bg-[#FFFFFF26]" : "bg-[#FFFFFF0D]"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      onStarClick(item.value);
                      setFormData((prev) => {
                        return {
                          ...prev,
                          stars: item.value,
                        };
                      });
                    }}
                  >
                    <Image
                      src="/star.png"
                      width={20}
                      height={20}
                      alt="Star Logo"
                    />
                  </button>
                );
              })}
            </div>

            <div>
              <textarea
                className={`w-full bg-[#242424] border ${
                  errors.review_text ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
                name="review_text"
                value={formData.review_text}
                onChange={handleChange}
                placeholder="Enter a Review"
              ></textarea>
              {errors.review_text && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.review_text}
                </p>
              )}
            </div>

            {/* Status */}

            <div>
              <Select
                name="status"
                value={formData.status}
                onValueChange={(e) => handleChange(e, "status")}
              >
                <SelectTrigger
                  className={`w-full bg-[#242424] text-base cursor-pointer border ${
                    errors.status ? "border-red-500" : "border-gray-700"
                  } rounded-md p-6 text-white placeholder-gray-400`}
                >
                  <SelectValue placeholder="Select a Status" />
                </SelectTrigger>
                <SelectContent className={"text-white"}>
                  <SelectItem value="pending" className={"p-4 text-base"}>
                    Pending
                  </SelectItem>
                  <SelectItem value="approved" className={"p-4 text-base"}>
                    Approved
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
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
