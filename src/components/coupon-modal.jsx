"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

export function CouponModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  coupon = null,
  title = "Add Coupon",
}) {
  const [formData, setFormData] = useState({
    coupon_name: "",
    coupon_code: "",
    discount_percent: "",
    max_limit: "",
    expiry_date: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with coupon data if editing
  useEffect(() => {
    if (coupon) {
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDate = "";
      if (coupon.expiry_date) {
        const date = new Date(coupon.expiry_date);
        formattedDate = date.toISOString().split("T")[0];
      }

      setFormData({
        coupon_name: coupon.coupon_name || "",
        coupon_code: coupon.coupon_code || "",
        discount_percent: coupon.discount_percent || "",
        max_limit: coupon.max_limit || coupon.usage_limit || "",
        expiry_date: formattedDate,
      });
    } else {
      // Reset form for new coupon
      setFormData({
        coupon_name: "",
        coupon_code: "",
        discount_percent: "",
        max_limit: "",
        expiry_date: "",
      });
    }
    setErrors({});
  }, [coupon, isOpen]);

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
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.coupon_name.trim())
      newErrors.coupon_name = "Coupon name is required";
    if (!formData.coupon_code.trim())
      newErrors.coupon_code = "Coupon code is required";
    if (!formData.discount_percent)
      newErrors.discount_percent = "Discount is required";
    if (
      isNaN(Number(formData.discount_percent)) ||
      Number(formData.discount_percent) <= 0 ||
      Number(formData.discount_percent) > 100
    )
      newErrors.discount_percent = "Discount must be between 1 and 100";
    if (!formData.max_limit) newErrors.max_limit = "Usage limit is required";
    if (isNaN(Number(formData.max_limit)) || Number(formData.max_limit) <= 0)
      newErrors.max_limit = "Usage limit must be a positive number";
    if (!coupon && !formData.expiry_date)
      newErrors.expiry_date = "Expiry date is required";

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
        coupon_name: formData.coupon_name,
        coupon_code: formData.coupon_code,
        discount_percent: Number(formData.discount_percent),
        max_limit: Number(formData.max_limit),
      };

      // Only include expiry_date if it's provided
      if (formData.expiry_date) {
        apiData.expiry_date = formData.expiry_date;
      }

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving coupon:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!coupon || !coupon.id) return;

    // Use toast confirmation instead of browser confirm
    toast.custom((t) => (
      <div className="bg-black border custom-thin-purple-scrollbar border-purple-600 rounded-lg p-4 shadow-lg">
        <h3 className="text-white font-medium mb-2">Confirm Deletion</h3>
        <p className="text-gray-300 mb-4">
          Are you sure you want to delete this coupon?
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 bg-gray-700 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setIsSubmitting(true);
              try {
                await onDelete(coupon.id);
                onClose();
              } catch (error) {
                console.error("Error deleting coupon:", error);
                // Error is handled by the parent component
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161616] rounded-xl w-full max-w-xl p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {coupon ? "Edit Coupon" : "Add Coupon"}
          </h2>
          {coupon && (
            <button
              onClick={handleDelete}
              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
              disabled={isSubmitting}
            >
              Delete Coupon
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Coupon Name */}
            <div>
              <input
                type="text"
                name="coupon_name"
                value={formData.coupon_name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full bg-[#242424] border ${
                  errors.coupon_name ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.coupon_name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.coupon_name}
                </p>
              )}
            </div>

            {/* Coupon Code */}
            <div>
              <input
                type="text"
                name="coupon_code"
                value={formData.coupon_code}
                onChange={handleChange}
                placeholder="Code"
                className={`w-full bg-[#242424] border ${
                  errors.coupon_code ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.coupon_code && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.coupon_code}
                </p>
              )}
            </div>

            {/* Discount */}
            <div className="relative">
              <input
                type="number"
                name="discount_percent"
                value={formData.discount_percent}
                onChange={handleChange}
                placeholder="Discount"
                className={`w-full bg-[#242424] border ${
                  errors.discount_percent ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                %
              </div>
              {errors.discount_percent && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.discount_percent}
                </p>
              )}
            </div>

            {/* Expiry Date and Usage Limit */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  placeholder="Expiry Date"
                  className={`w-full bg-[#242424] border ${
                    errors.expiry_date ? "border-red-500" : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400`}
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                {errors.expiry_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.expiry_date}
                  </p>
                )}
              </div>

              <div>
                <input
                  type="number"
                  name="max_limit"
                  value={formData.max_limit}
                  onChange={handleChange}
                  placeholder="Usage Limit"
                  className={`w-full bg-[#242424] border ${
                    errors.max_limit ? "border-red-500" : "border-gray-700"
                  } rounded-md p-3 text-white placeholder-gray-400`}
                />
                {errors.max_limit && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.max_limit}
                  </p>
                )}
              </div>
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
