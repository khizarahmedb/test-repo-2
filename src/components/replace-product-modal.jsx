"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUserStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { getProducts } from "@/lib/api";
import { InputSelect } from "./input-select";

export function ReplaceProductModal({
  isOpen,
  onClose,
  onSave,
  selectedTicket,
}) {
  const { user } = useUserStore();
  const [productsData, setProductsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    orderId: "",
    customerEmail: "",
    originalProduct: null,
    originalProductVariant: null,
    productToBeReplaced: null,
    replacedProductVariant: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);

  const goToFirstPage = () => setCurrentPage(0);

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset to first page when changing items per page
  };

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

    if (!formData.orderId.trim()) newErrors.orderId = "Order ID is required";
    if (!formData.customerEmail.trim())
      newErrors.customerEmail = "Customer email is required";
    if (!formData.originalProduct)
      newErrors.originalProduct = "Original product is required";
    if (!formData.productToBeReplaced)
      newErrors.productToBeReplaced = "Product to be replaced is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  console.log(formData);

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
        order_id: +formData.orderId,
        customer_email: formData.customerEmail,
        original_product_id: formData.originalProduct.id,
        replacement_product_id: formData.productToBeReplaced.id,
        original_variant_id: formData.originalProductVariant.id,
        replacement_variant_id: formData.replacedProductVariant.id,
      };
      console.log(apiData);

      await onSave(apiData);
      onClose();
    } catch (error) {
      console.error("Error saving ticket:", error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      setFormData({
        orderId: String(selectedTicket.order_id),
        customerEmail: selectedTicket.customer_email,
        originalProduct: {
          id: selectedTicket.product_id,
          name: selectedTicket.product_name,
        },
        originalProductVariant: {
          id: selectedTicket.variant_id,
          name: selectedTicket.variant_name,
        },
      });
    } else {
      setFormData({
        orderId: "",
        customerEmail: "",
        originalProduct: null,
        originalProductVariant: null,
        productToBeReplaced: null,
        replacedProductVariant: null,
      });
    }
  }, [selectedTicket, isOpen]);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Calculate pagination range more clearly
        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage - 1;

        // Early return if no token available
        if (!user?.token) {
          throw new Error("No authentication token available");
        }

        const response = await getProducts(
          startIndex,
          endIndex,
          user.token,
          searchQuery
        );

        console.log("Products API Response:", response);

        // Handle error response
        if (response?.hasError) {
          throw new Error(
            response.message || "Failed to load products. Please try again."
          );
        }

        // Handle successful response
        if (response?.body?.data) {
          setProductsData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
          return;
        }

        // Handle empty response
        throw new Error("Received empty or invalid response from server");
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductsData([]);
        setTotalCount(0);

        toast.error("Failed to load products", {
          description:
            error.message || "Failed to load products. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, user?.token, itemsPerPage, searchQuery, refreshTrigger]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#161616] rounded-xl w-full max-w-[742px] p-6 border border-purple-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[2rem] font-bold text-white">Replace Product</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                name="orderId"
                value={formData.orderId}
                onChange={handleChange}
                placeholder="Order ID"
                disabled={selectedTicket !== null}
                className={`w-full bg-[#242424] border ${
                  errors.orderId ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.orderId && (
                <p className="text-red-500 text-xs mt-1">{errors.orderId}</p>
              )}
            </div>
            <div>
              <input
                type="text"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="Customer Email"
                className={`w-full bg-[#242424] border ${
                  errors.customerEmail ? "border-red-500" : "border-gray-700"
                } rounded-md p-3 text-white placeholder-gray-400`}
              />
              {errors.customerEmail && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.customerEmail}
                </p>
              )}
            </div>

            <InputSelect
              apiUrl={"/product?startsWith=0&endsWith=10"}
              labelKey={"name"}
              valueKey={"id"}
              value={formData.originalProduct}
              placeholder="Select Original Product"
              onChange={(e) => handleChange(e, "originalProduct")}
            />

            <InputSelect
              apiUrl={`/product/variants/${formData?.originalProduct?.id}?startsWith=0&endsWith=10`}
              labelKey={"name"}
              valueKey={"id"}
              value={formData.originalProductVariant}
              placeholder="Select Original Product Variant"
              onChange={(e) => handleChange(e, "originalProductVariant")}
              disabled={formData.originalProduct === null}
            />

            <InputSelect
              apiUrl={"/product?startsWith=0&endsWith=10"}
              labelKey={"name"}
              valueKey={"id"}
              value={formData.productToBeReplaced}
              placeholder="Product to be replaced with (Type to search)"
              onChange={(e) => handleChange(e, "productToBeReplaced")}
            />

            <InputSelect
              apiUrl={`/product/variants/${formData?.productToBeReplaced?.id}?startsWith=0&endsWith=10`}
              labelKey={"name"}
              valueKey={"id"}
              value={formData.replacedProductVariant}
              placeholder="Replaced Product Variant"
              onChange={(e) => handleChange(e, "replacedProductVariant")}
              disabled={formData.productToBeReplaced === null}
            />

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
                {isSubmitting ? "Replacing..." : "Replace"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
