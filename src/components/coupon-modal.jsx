"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUser } from "@/context/userContext";
import { addCoupon, editCoupon, deleteCoupon } from "@/utils/axiosInstance"; // Adjust import path as needed

export function CouponModal({ isOpen, onClose, mode, coupon }) {
  const { user, coupons, setCoupons, fetchData } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    coupon_name: "",
    coupon_code: "",
    discount_percent: 0,
    max_limit: 0,
    expiry_date: "",
  });

  // Initialize form data when modal opens or changes mode
  useEffect(() => {
    if (mode === "edit" && coupon) {
      // Format the date for the input field (YYYY-MM-DD)
      let formattedDate = "";
      if (coupon.expiry_date) {
        const date = new Date(coupon.expiry_date);
        formattedDate = date.toISOString().split("T")[0];
      }

      setFormData({
        coupon_name: coupon.coupon_name || "",
        coupon_code: coupon.coupon_code || "",
        discount_percent: coupon.discount_percent || 0,
        max_limit: coupon.max_limit || 0,
        expiry_date: formattedDate,
      });
    } else {
      // Reset form for add mode
      setFormData({
        coupon_name: "",
        coupon_code: "",
        discount_percent: 0,
        max_limit: 0,
        expiry_date: "",
      });
    }
    setIsSubmitting(false);
  }, [mode, coupon, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Format the data for API
      const apiData = {
        ...formData,
        // Ensure expiry_date is in the correct format for the API
        expiry_date: formData.expiry_date
          ? new Date(formData.expiry_date).toISOString()
          : null,
      };

      if (mode === "add") {
        // Add new coupon
        const response = await addCoupon(user.token, apiData);
        console.log("Coupon added successfully", response);

        // Option 1: Update the coupons state directly with the new coupon
        if (response && response.body) {
          setCoupons([...coupons, response.body]);
        } else {
          // Option 2: Refetch all data if the response doesn't include the new coupon
          await fetchData();
        }
      } else {
        // Edit existing coupon
        const response = await editCoupon(user.token, coupon.id, apiData);
        console.log("Coupon updated successfully", response);

        // Option 1: Update the specific coupon in the state
        if (response && response.body) {
          setCoupons(
            coupons.map((c) => (c.id === coupon.id ? response.body : c))
          );
        } else {
          // Option 2: Update the coupon in state with local data
          const updatedCoupon = {
            ...coupon,
            ...apiData,
            // Keep other fields that might not be in the form
            id: coupon.id,
            created_at: coupon.created_at,
            created_by: coupon.created_by,
            usage_limit: coupon.usage_limit,
          };
          setCoupons(
            coupons.map((c) => (c.id === coupon.id ? updatedCoupon : c))
          );
        }
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error saving coupon:", error);
      // Option 3: Always refetch on error to ensure data consistency
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!coupon || !coupon.id) return;

    try {
      setIsSubmitting(true);
      await deleteCoupon(user.token, coupon.id);
      console.log("Coupon deleted successfully");

      // Option 1: Remove the deleted coupon from state
      setCoupons(coupons.filter((c) => c.id !== coupon.id));

      onClose();
    } catch (error) {
      console.error("Error deleting coupon:", error);
      // Refetch on error to ensure data consistency
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const CloseButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-4 top-4 text-gray-400 hover:text-white"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="no-scrollbar bg-black text-white border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {mode === "add" ? "Add Coupon" : "Edit Coupon"}
          </DialogTitle>
          <CloseButton />
        </DialogHeader>

        {/* Delete button only shown in edit mode */}
        {mode === "edit" && (
          <Button
            variant="destructive"
            className="absolute right-4 top-4 bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete Coupon
          </Button>
        )}

        <div className="grid gap-4 py-4">
          {/* Coupon Name */}
          <Input
            name="coupon_name"
            placeholder="Name"
            value={formData.coupon_name}
            onChange={handleInputChange}
            className="bg-gray-900 border-gray-700"
            disabled={isSubmitting}
          />

          {/* Coupon Code */}
          <Input
            name="coupon_code"
            placeholder="Code"
            value={formData.coupon_code}
            onChange={handleInputChange}
            className="bg-gray-900 border-gray-700"
            disabled={isSubmitting}
          />

          {/* Discount Percentage */}
          <div className="relative">
            <Input
              name="discount_percent"
              type="number"
              placeholder="Discount"
              value={formData.discount_percent || ""}
              onChange={handleNumberInputChange}
              className="bg-gray-900 border-gray-700 pr-10"
              min="0"
              max="100"
              disabled={isSubmitting}
            />
            <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          {/* Expiry Date and Usage Limit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <Input
                name="expiry_date"
                type="date"
                placeholder="Expiry Date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="bg-gray-900 border-gray-700"
                disabled={isSubmitting}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Input
              name="max_limit"
              type="number"
              placeholder="Usage Limit"
              value={formData.max_limit || ""}
              onChange={handleNumberInputChange}
              className="bg-gray-900 border-gray-700"
              min="0"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
