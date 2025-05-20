"use client";

import { useState, useEffect, useRef } from "react"; // Added useRef
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/userContext";
import { addProduct, deleteProduct, editProduct } from "@/utils/axiosInstance";
import { Router } from "next/router";

export function ProductModal({ isOpen, onClose, mode, product }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, setUser, products, setProducts, inventory, fetchData } =
    useUser();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    currency: "PKR",
    variations: ["1 month"],
    availability: "available",
    stock: 0, // Changed to number with default 0
    stock_id: 0,
    stock_name: "Select Stock",
    image_url: "",
    stock_delimiter: "comma",
    low_stock_alert: 50,
    out_of_stock: 50,
    remove_sold_stock: "true",
    delivery_time: "Instant",
  });

  const [selectedVariations, setSelectedVariations] = useState([]);
  const availableVariations = [
    "1 month",
    "2 months",
    "3 months",
    "4 months",
    "5 months",
    "6 months",
    "1 year",
  ];

  // --- Start: Added for file upload ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef(null);
  // --- End: Added for file upload ---

  useEffect(() => {
    if (mode === "edit" && product) {
      const variations =
        product.variations ||
        (product.variation ? product.variation.split(", ") : ["1 month"]);
      let stockName = "Select Stock";
      if (inventory && inventory.length > 0 && product.stock_id) {
        const stockItem = inventory.find(
          (item) => item.id === product.stock_id
        );
        if (stockItem) {
          stockName = stockItem.stock_name;
        }
      }
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        currency: product.currency || "PKR",
        delivery_time:
          product.delivery_time || product.deliveryTime || "Instant",
        variations: variations,
        availability: product.availability || "available",
        stock:
          typeof product.stock === "number"
            ? product.stock
            : Number(product.stock) || 0, // Convert to number
        stock_id: product.stock_id || 0,
        stock_name: stockName,
        image_url: product.image_url || "",
        stock_delimiter: product.stock_delimiter || "comma",
        low_stock_alert: product.low_stock_alert || 50,
        out_of_stock: product.out_of_stock || 50,
        remove_sold_stock: product.remove_sold_stock || "true",
      });
      setSelectedVariations(variations);
    } else {
      setFormData({
        name: "",
        description: "",
        price: 0,
        currency: "PKR",
        delivery_time: "Instant",
        variations: ["1 month"],
        availability: "available",
        stock: 0, // Default to 0 instead of empty string
        stock_id: 0,
        stock_name: "Select Stock",
        image_url: "",
        stock_delimiter: "comma",
        low_stock_alert: 50,
        out_of_stock: 50,
        remove_sold_stock: "true",
      });
      setSelectedVariations(["1 month"]);
    }
    // Reset upload status when modal opens/changes mode
    setIsUploading(false);
    setUploadStatus("");
  }, [mode, product, isOpen, inventory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value ? Number(value) : 0 }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      remove_sold_stock: checked ? "true" : "false",
    }));
  };

  const handleStockChange = (stockId) => {
    const numericStockId = Number(stockId);
    if (numericStockId === 0) {
      setFormData((prev) => ({
        ...prev,
        stock_id: 0,
        stock_name: "Select Stock",
      }));
      return;
    }
    if (inventory && inventory.length > 0) {
      const selectedStock = inventory.find(
        (item) => item.id === numericStockId
      );
      if (selectedStock) {
        setFormData((prev) => ({
          ...prev,
          stock_id: numericStockId,
          stock_name: selectedStock.stock_name,
        }));
      }
    }
  };

  const handleVariationToggle = (variation) => {
    setSelectedVariations((prev) => {
      if (prev.includes(variation)) {
        return prev.filter((v) => v !== variation);
      } else {
        return [...prev, variation];
      }
    });
    setFormData((prev) => {
      const updatedVariations = prev.variations.includes(variation)
        ? prev.variations.filter((v) => v !== variation)
        : [...prev.variations, variation];
      return {
        ...prev,
        variations: updatedVariations,
      };
    });
  };

  // --- Start: File Upload Handlers ---
  const handleUploadButtonClick = () => {
    setUploadStatus(""); // Clear previous status
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("Uploading...");

    const uploadUrl = "https://files.tfgsolutions.pk/api/file-directory/upload";
    const uploadDirectory = "uploads/invaderProducts";
    const bodyFormData = new FormData();
    bodyFormData.append("file", file);
    bodyFormData.append("directory", uploadDirectory);

    try {
      const response = await fetch(uploadUrl, {
        method: "POST",
        body: bodyFormData,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Upload failed" }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      // --- Start: Modified URL handling ---
      const relativePath = result.filePath; // Get the relative path from the response

      if (relativePath) {
        // Prepend the base URL to the relative path
        const fullImageUrl = `https://files.tfgsolutions.pk/public/${relativePath}`;
        // Update the form data with the full image URL
        setFormData((prev) => ({ ...prev, image_url: fullImageUrl }));
        setUploadStatus("Upload successful!");
        console.log("Upload successful, URL set to:", fullImageUrl);
      } else {
        // Throw an error if filePath is missing in the response
        throw new Error("filePath not found in API response.");
      }
      // --- End: Modified URL handling ---
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setUploadStatus(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
      // Reset file input value
      if (event.target) {
        event.target.value = "";
      }
    }
  };
  // --- End: File Upload Handlers ---

  const handleSave = async () => {
    // Make handleSave async to use await
    const formattedData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      currency: formData.currency,
      variation: formData.variations.join(", "),
      availability: formData.availability,
      stock: Number(formData.stock), // Convert stock to number
      stock_id: Number(formData.stock_id),
      // Use the potentially updated image_url, provide default if still empty
      image_url: formData.image_url || "uploads/1741773811721.png",
      stock_delimiter: formData.stock_delimiter,
      low_stock_alert: Number(formData.low_stock_alert),
      out_of_stock: Number(formData.out_of_stock),
      remove_sold_stock: formData.remove_sold_stock,
      delivery_time: formData.delivery_time,
    };

    try {
      // Call your actual save API here using the addProduct function
      if (mode === "add") {
        const response = await addProduct(user.token, formattedData);
        console.log("Product saved successfully:", response);
        if (response && response.product) {
          setProducts([...products, response.product]);
        } else {
          // Refetch all data if the response doesn't include the new product
          await fetchData();
        }
      }
      if (mode === "edit") {
        const response = await editProduct(
          user.token,
          product.id,
          formattedData
        );
        console.log(formattedData);
        if (response && response.product) {
          setProducts(
            products.map((p) => (p.id === product.id ? response.product : p))
          );
        } else {
          // Update with local data if response doesn't include the updated product
          const updatedProduct = {
            ...product,
            ...formattedData,
          };
          setProducts(
            products.map((p) => (p.id === product.id ? updatedProduct : p))
          );
        }
      }
      onClose(); // Close modal after save if needed
    } catch (error) {
      console.error("Error saving product:", error, formattedData);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleDelete = async () => {
    try {
      const response = await deleteProduct(user.token, product.id);
      console.log(response);
      setProducts(products.filter((p) => p.id !== product.id));
      fetchData();
      Router.push("/dashboard/products");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="no-scrollbar bg-black text-white border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </DialogTitle>
        </DialogHeader>

        {/* Delete button only shown in edit mode */}
        {mode === "edit" && (
          <Button
            variant="destructive"
            className="absolute right-10 top-4 bg-red-600 hover:bg-red-700 h-auto py-1 px-3" // Adjusted position and size
            onClick={() => {
              handleDelete();
              onClose();
            }}
          >
            Delete
          </Button>
        )}

        <div className="grid gap-4 py-4">
          {/* Stock Selection */}
          <Select
            value={formData.stock_id.toString()}
            onValueChange={handleStockChange}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700">
              <SelectValue placeholder="Select Stock">
                {formData.stock_name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="0">Select Stock</SelectItem>
              {inventory && inventory.length > 0 ? (
                inventory.map((item) => (
                  <SelectItem key={item.id} value={item.id.toString()}>
                    {item.stock_name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="0" disabled>
                  No stock available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          {/* Name */}
          <Input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleInputChange}
            className="bg-gray-900 border-gray-700"
          />

          {/* Description */}
          <Textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleInputChange}
            className="bg-gray-900 border-gray-700"
          />

          {/* Price and Delivery Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex">
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
              >
                <SelectTrigger className="w-20 bg-gray-900 border-gray-700 rounded-r-none">
                  <SelectValue placeholder="PKR" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  <SelectItem value="PKR">PKR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              <Input
                name="price"
                type="number"
                placeholder="Price"
                value={formData.price || ""}
                onChange={handleNumberInputChange}
                className="flex-1 bg-gray-900 border-gray-700 rounded-l-none"
              />
            </div>
            <Select
              value={formData.delivery_time}
              onValueChange={(value) =>
                handleSelectChange("delivery_time", value)
              }
            >
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Delivery Time" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="Instant">Instant</SelectItem>
                <SelectItem value="1-2 days">1-2 days</SelectItem>
                <SelectItem value="3-5 days">3-5 days</SelectItem>
                <SelectItem value="8-10 days">8-10 days</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Variations */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {availableVariations.map((variation) => (
                <Badge
                  key={variation}
                  variant={
                    formData.variations.includes(variation)
                      ? "default"
                      : "outline"
                  }
                  className={`cursor-pointer ${
                    formData.variations.includes(variation)
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-transparent text-gray-400 hover:text-white border-gray-600" // Added border for outline
                  }`}
                  onClick={() => handleVariationToggle(variation)}
                >
                  {variation}
                  {formData.variations.includes(variation) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            {/* This Select is just a placeholder label now */}
            <div className="relative">
              <Input
                readOnly
                value={
                  formData.variations.length > 0
                    ? `${formData.variations.length} variation(s) selected`
                    : "Select Variations"
                }
                className="bg-gray-900 border-gray-700 cursor-default"
              />
            </div>
          </div>

          {/* Availability and Stock Count */}
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={formData.availability}
              onValueChange={(value) =>
                handleSelectChange("availability", value)
              }
            >
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                <SelectItem value="coming_soon">Coming Soon</SelectItem>
              </SelectContent>
            </Select>
            {/* Updated stock input to use number type and handleNumberInputChange */}
            <Input
              name="stock"
              type="number"
              placeholder="Stock (leave empty if using Stock ID)"
              value={formData.stock || ""}
              onChange={handleNumberInputChange}
              className="bg-gray-900 border-gray-700"
            />
          </div>

          {/* Stock Delimiter */}
          <Select
            value={formData.stock_delimiter}
            onValueChange={(value) =>
              handleSelectChange("stock_delimiter", value)
            }
          >
            <SelectTrigger className="bg-gray-900 border-gray-700">
              <SelectValue placeholder="Stock Delimiter" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="comma">Comma</SelectItem>
              <SelectItem value="semicolon">Semi colon</SelectItem>
              <SelectItem value="newline">New line</SelectItem>
            </SelectContent>
          </Select>

          {/* Stock Alerts */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="low_stock_alert"
              type="number"
              placeholder="Low Stock Alert Limit"
              value={formData.low_stock_alert || ""}
              onChange={handleNumberInputChange}
              className="bg-gray-900 border-gray-700"
              // Remove or modify this condition if you want these fields always enabled
              // disabled={formData.stock_id === 0}
            />
            <Input
              name="out_of_stock"
              type="number"
              placeholder="Out of Stock Alert Limit"
              value={formData.out_of_stock || ""}
              onChange={handleNumberInputChange}
              className="bg-gray-900 border-gray-700"
              // Remove or modify this condition if you want these fields always enabled
              // disabled={formData.stock_id === 0}
            />
          </div>

          {/* --- Start: Modified Upload Button --- */}
          <div className="flex flex-col items-center">
            {" "}
            {/* Wrapper for button and status */}
            <Button
              type="button" // Prevent default form submission
              variant="outline"
              className="w-full h-24 bg-gray-900 border-gray-700 hover:bg-gray-800 disabled:opacity-50"
              onClick={handleUploadButtonClick} // Attach click handler
              disabled={isUploading} // Disable when uploading
            >
              <div className="flex flex-col items-center justify-center">
                <Upload className="h-6 w-6 mb-2" />
                {isUploading
                  ? "Uploading..."
                  : mode === "add"
                  ? "Upload Product Image"
                  : "Update Image"}
              </div>
            </Button>
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*" // Accept only images
              style={{ display: "none" }}
            />
            {/* Display upload status */}
            {uploadStatus && (
              <p
                className={`mt-2 text-sm ${
                  uploadStatus.startsWith("Upload failed")
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {uploadStatus}
              </p>
            )}
            {/* Display current image URL if available */}
            {formData.image_url && !isUploading && (
              <p
                className="mt-1 text-xs text-gray-400 truncate w-full text-center"
                title={formData.image_url}
              >
                Current: {formData.image_url.split("/").pop()}{" "}
                {/* Show only filename */}
              </p>
            )}
          </div>
          {/* --- End: Modified Upload Button --- */}

          {/* Remove Sold Stock Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeSoldStock"
              checked={formData.remove_sold_stock === "true"}
              onCheckedChange={handleCheckboxChange}
              className="border-gray-600 data-[state=checked]:bg-purple-600" // Style checkbox
              disabled={formData.stock_id === 0} // Disable if no stock ID is selected
            />
            <label
              htmlFor="removeSoldStock"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remove sold stock
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isUploading} // Disable save while uploading
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
