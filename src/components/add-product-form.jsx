"use client";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Plus, Upload, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import MultiSelect from "./multi-select";

const ProductForm = () => {
  const [formData, setFormData] = useState({
    stock: "",
    productName: "",
    category: [],
    description: "",
    removeSoldStock: false,
    couponActivation: false,
    approveProduct: false,
    variants: [
      {
        type: "",
        quantity: "",
        unitPrice: "",
        buyingUnitPrice: "",
        lowStockLimit: "",
        outOfStockLimit: "",
        availability: "",
        deliveryTime: "",
      },
    ],
  });

  const [errors, setErrors] = useState({});
  const [uploadedImage, setUploadedImage] = useState(null);
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Sample data
  const stockOptions = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
  ];

  const categoryOptions = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Clothing" },
    { id: 3, name: "Books" },
    { id: 4, name: "Home & Garden" },
  ];

  const availabilityOptions = [
    { id: 1, name: "In Stock" },
    { id: 2, name: "Out of Stock" },
    { id: 3, name: "Pre-order" },
  ];

  const deliveryTimeOptions = [
    { id: 1, name: "1-2 Days" },
    { id: 2, name: "3-5 Days" },
    { id: 3, name: "1 Week" },
    { id: 4, name: "2 Weeks" },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.stock.trim()) newErrors.stock = "Stock selection is required";
    if (!formData.productName.trim())
      newErrors.productName = "Product name is required";
    if (!formData.category.length === 0)
      newErrors.category = "Category is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";

    formData.variants.forEach((variant, index) => {
      if (!variant.type.trim())
        newErrors[`variant_${index}_type`] = "Type is required";
      if (!variant.quantity.trim())
        newErrors[`variant_${index}_quantity`] = "Quantity is required";
      if (!variant.unitPrice.trim())
        newErrors[`variant_${index}_unitPrice`] = "Unit price is required";
      if (!variant.buyingUnitPrice.trim())
        newErrors[`variant_${index}_buyingUnitPrice`] =
          "Buying unit price is required";
      if (!variant.availability.trim())
        newErrors[`variant_${index}_availability`] = "Availability is required";
      if (!variant.deliveryTime.trim())
        newErrors[`variant_${index}_deliveryTime`] =
          "Delivery time is required";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (value, field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user makes selection
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }

    // Close dropdown
    setOpenDropdowns((prev) => ({
      ...prev,
      [field]: false,
    }));
  };

  const handleVariantSelectChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));

    // Clear error when user makes selection
    const errorKey = `variant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }

    // Close dropdown
    setOpenDropdowns((prev) => ({
      ...prev,
      [`variant_${index}_${field}`]: false,
    }));
  };

  const toggleDropdown = (key) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getSelectedOptionName = (options, value) => {
    const option = options.find((opt) => String(opt.id) === String(value));
    return option ? option.name : "";
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...formData.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));

    // Clear error when user starts typing
    const errorKey = `variant_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({
        ...prev,
        [errorKey]: undefined,
      }));
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          type: "",
          quantity: "",
          unitPrice: "",
          buyingUnitPrice: "",
          lowStockLimit: "",
          outOfStockLimit: "",
          availability: "",
          deliveryTime: "",
        },
      ],
    }));
  };

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData((prev) => ({
        ...prev,
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (validateForm()) {
      console.log("Form data:", formData);
      console.log("Uploaded image:", uploadedImage);
      alert("Product saved successfully!");
    }
  };

  const handleCancel = () => {
    setFormData({
      stock: "",
      productName: "",
      category: "",
      description: "",
      removeSoldStock: false,
      couponActivation: false,
      approveProduct: false,
      variants: [
        {
          type: "",
          quantity: "",
          unitPrice: "",
          buyingUnitPrice: "",
          lowStockLimit: "",
          outOfStockLimit: "",
          availability: "",
          deliveryTime: "",
        },
      ],
    });
    setUploadedImage(null);
    setErrors({});
  };

  return (
    <div>
      <div className="bg-[#0000000F] rounded-lg p-6 space-y-6">
        {/* Header Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stock Selection */}
          <div className="space-y-2">
            <Select
              name="stock"
              value={formData.stock}
              onValueChange={(value) => handleSelectChange(value, "stock")}
            >
              <SelectTrigger
                className={`w-full bg-[#242424] text-base cursor-pointer border ${
                  errors.stock ? "border-red-500" : "border-gray-700"
                } rounded-md p-6 text-white placeholder-gray-400`}
                onClick={() => toggleDropdown("stock")}
              >
                <SelectValue placeholder="Select Stock" />
              </SelectTrigger>
              <SelectContent className="text-white">
                {stockOptions.map((stock) => (
                  <SelectItem
                    key={stock.id}
                    value={String(stock.id)}
                    className="p-4 text-base"
                  >
                    {stock.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stock && (
              <p className="text-red-500 text-xs">{errors.stock}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="space-y-2">
            <Input
              placeholder="Product Name"
              value={formData.productName}
              onChange={(e) => handleInputChange("productName", e.target.value)}
              error={errors.productName}
              className={"bg-[#242424] p-6 border-gray-700 text-white"}
            />
            {errors.productName && (
              <p className="text-red-500 text-xs">{errors.productName}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <MultiSelect
              options={[
                { label: "React", value: "1" },
                { label: "Node js", value: "2" },
              ]}
              onChange={(values) => handleSelectChange(values, "category")}
              placeholder="Category"
              selectedValues={formData.category}
            />
            {errors.category && (
              <p className="text-red-500 text-xs">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Description and Image Upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Description */}
          <div className="space-y-2">
            <Textarea
              placeholder="Description"
              rows={6}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              className={"h-[131px] text-white border-gray-700 bg-[#FFFFFF0D]"}
            />
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <div className="bg-[#FFFFFF0D] border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-gray-500 transition-colors">
              {uploadedImage ? (
                <div className="space-y-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded product"
                    className="max-w-full max-h-32 mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => setUploadedImage(null)}
                    className="text-xs"
                  >
                    Remove Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-400 text-sm">
                      Upload Product Image
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer text-blue-400 hover:text-blue-300 text-sm underline"
                    >
                      Choose file
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="removeSoldStock"
              checked={formData.removeSoldStock}
              onCheckedChange={(e) => handleInputChange("removeSoldStock", e)}
            />
            <label htmlFor="removeSoldStock" className="text-[#D9D9D9]">
              Remove sold stock
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="couponActivation"
              checked={formData.couponActivation}
              onCheckedChange={(e) => handleInputChange("couponActivation", e)}
            />
            <label htmlFor="couponActivation" className="text-[#D9D9D9]">
              Coupon Activation
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="approveProduct"
              checked={formData.approveProduct}
              onCheckedChange={(e) => handleInputChange("approveProduct", e)}
            />
            <label htmlFor="approveProduct" className="text-[#D9D9D9]">
              Approve Product
            </label>
          </div>
        </div>

        {/* Product Variants */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-white">Product Variants</h3>
            <Button
              onClick={addVariant}
              className="flex items-center text-sm bg-white"
            >
              <Plus className="w-4 h-4" color="#000" />
              <span className="text-black">Add</span>
            </Button>
          </div>

          {formData.variants.map((variant, index) => (
            <div
              key={index}
              className="bg-[#0000000F]  rounded-lg p-4 space-y-4"
            >
              <div className="flex items-center justify-end">
                {formData.variants.length > 1 && (
                  <Button
                    variant="destructive"
                    onClick={() => removeVariant(index)}
                    className="p-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* First Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Input
                    placeholder="Type"
                    value={variant.type}
                    onChange={(e) =>
                      handleVariantChange(index, "type", e.target.value)
                    }
                    error={errors[`variant_${index}_type`]}
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                  {errors[`variant_${index}_type`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_type`]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Input
                    placeholder="Quantity"
                    type="number"
                    value={variant.quantity}
                    onChange={(e) =>
                      handleVariantChange(index, "quantity", e.target.value)
                    }
                    error={errors[`variant_${index}_quantity`]}
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                  {errors[`variant_${index}_quantity`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_quantity`]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Unit Price"
                    type="number"
                    step="0.01"
                    value={variant.unitPrice}
                    onChange={(e) =>
                      handleVariantChange(index, "unitPrice", e.target.value)
                    }
                    error={errors[`variant_${index}_unitPrice`]}
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                  {errors[`variant_${index}_unitPrice`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_unitPrice`]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Buying Unit Price"
                    type="number"
                    step="0.01"
                    value={variant.buyingUnitPrice}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "buyingUnitPrice",
                        e.target.value
                      )
                    }
                    error={errors[`variant_${index}_buyingUnitPrice`]}
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                  {errors[`variant_${index}_buyingUnitPrice`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_buyingUnitPrice`]}
                    </p>
                  )}
                </div>
              </div>

              {/* Second Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Input
                    placeholder="Low Stock Limit"
                    type="number"
                    value={variant.lowStockLimit}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "lowStockLimit",
                        e.target.value
                      )
                    }
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Out of Stock Limit"
                    type="number"
                    value={variant.outOfStockLimit}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "outOfStockLimit",
                        e.target.value
                      )
                    }
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                </div>
                <div className="space-y-1">
                  <Select
                    name={`availability_${index}`}
                    value={variant.availability}
                    onValueChange={(value) =>
                      handleVariantSelectChange(index, "availability", value)
                    }
                  >
                    <SelectTrigger
                      className={`w-full bg-[#242424] text-base cursor-pointer border ${
                        errors[`variant_${index}_availability`]
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-md p-6 text-white placeholder-gray-400`}
                      onClick={() =>
                        toggleDropdown(`variant_${index}_availability`)
                      }
                    >
                      <SelectValue placeholder="Availability" />
                    </SelectTrigger>
                    <SelectContent className="text-white">
                      {availabilityOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={String(option.id)}
                          className="p-4 text-base"
                          onClick={(value) =>
                            handleVariantSelectChange(
                              index,
                              "availability",
                              value
                            )
                          }
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`variant_${index}_availability`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_availability`]}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Select
                    name={`deliveryTime_${index}`}
                    value={variant.deliveryTime}
                    onValueChange={(value) =>
                      handleVariantSelectChange(index, "deliveryTime", value)
                    }
                  >
                    <SelectTrigger
                      className={`w-full bg-[#242424] text-base cursor-pointer border ${
                        errors[`variant_${index}_deliveryTime`]
                          ? "border-red-500"
                          : "border-gray-700"
                      } rounded-md p-6 text-white placeholder-gray-400`}
                      onClick={() =>
                        toggleDropdown(`variant_${index}_deliveryTime`)
                      }
                    >
                      <SelectValue placeholder="Delivery Time" />
                    </SelectTrigger>
                    <SelectContent className="text-white">
                      {deliveryTimeOptions.map((option) => (
                        <SelectItem
                          key={option.id}
                          value={String(option.id)}
                          className="p-4 text-base"
                          onClick={(value) =>
                            handleVariantSelectChange(
                              index,
                              "deliveryTime",
                              value
                            )
                          }
                        >
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[`variant_${index}_deliveryTime`] && (
                    <p className="text-red-500 text-xs">
                      {errors[`variant_${index}_deliveryTime`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button variant="outline" onClick={handleCancel} className="px-8">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-8 bg-purple-600 hover:bg-purple-700"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
