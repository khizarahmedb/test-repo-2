"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";

export function EditEntryModal({ isOpen, onClose, onSave, selectedEntry }) {
  const { user } = useUserStore();
  const [formData, setFormData] = useState({
    entry: "",
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
    if (!formData.entry.trim()) newErrors.entry = "Entry text is required";

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
        entry: formData.entry,
      };

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving entry:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedEntry) {
      setFormData({
        entry: selectedEntry.value,
      });
    }
  }, [selectedEntry]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161616] rounded-xl w-full max-w-[742px] p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[2rem] font-bold text-white">Edit Entry</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="entry"
                value={formData.entry}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full bg-[#242424] border ${
                  errors.entry ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.entry && (
                <p className="text-red-500 text-xs mt-1">{errors.entry}</p>
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
