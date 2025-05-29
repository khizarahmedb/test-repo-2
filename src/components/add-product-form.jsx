"use client";
import { useState, useEffect } from "react";
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
import { createProduct, uploadFile } from "@/lib/api";
import { toast } from "sonner";

const ProductForm = ({
  stockOptions,
  categoryOptions,
  onFormSubmit,
  productData = null,
}) => {
  const [isLoading, setIsLoading] = useState(false);
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
        id: null,
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
  const [file, setFile] = useState(null);

  const availabilityOptions = [
    { id: "Available", name: "Available" },
    { id: "Not Available", name: "Not Available" },
  ];

  const deliveryTimeOptions = [{ id: "Instant", name: "Instant" }];

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
          id: null,
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
    setFile(event.target.files[0]);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("directory", "uploads/invader-products");
      formData.append("file", file);
      const image = await uploadFile(formData);
      return { data: image, error: null };
    } catch (error) {
      return { error, data: null };
    }
  };
  const handleSave = async () => {
    if (validateForm()) {
      setIsLoading(true);
      console.log("Form data:", formData);
      console.log("Uploaded image:", uploadedImage);

      let imageUrl;
      // upload image
      if (file) {
        const res = await uploadImage(file);
        if (res.error) {
          toast.error("Failed to upload image", {
            description: res.error.message,
          });
          return;
        }
        imageUrl = `https://files.tfgsolutions.pk/public/${res.data.filePath}`;
      } else {
        imageUrl = productData?.image_url;
      }

      // send form data
      const data = {
        stock_id: +formData.stock,
        name: formData.productName,
        description: formData.description,
        remove_sold_stock: formData.removeSoldStock,
        image_url: imageUrl,
        categories: formData.category.map((item) => +item.value),
        coupon_activation: formData.couponActivation,
        approve_product: formData.approveProduct,
        variants: formData.variants.map((item) => {
          return {
            name: item.type,
            quantity: +item.quantity,
            price: +item.unitPrice,
            buying_price_per_unit: +item.buyingUnitPrice,
            out_of_stock_alert_limit: +item.outOfStockLimit,
            low_stock_alert_limit: +item.lowStockLimit,
            availability: item.availability,
            delivery_time: item.deliveryTime,
          };
        }),
      };

      await onFormSubmit(data);
      setIsLoading(false);
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

  useEffect(() => {
    if (productData) {
      setFormData({
        stock: String(productData.stock_id),
        productName: productData.name,
        category: [],
        description: productData.description,
        removeSoldStock: productData.remove_sold_stock ? true : false,
        couponActivation: productData.apply_coupon ? true : false,
        approveProduct: productData.is_approved ? true : false,
        variants: productData.variants.map((item) => {
          return {
            id: item.id,
            type: item.name,
            quantity: String(item.quantity),
            unitPrice: String(item.price),
            buyingUnitPrice: String(item.buying_price_per_unit),
            lowStockLimit: String(item.low_stock_alert_limit),
            outOfStockLimit: String(item.out_of_stock_alert_limit),
            availability: item.availability,
            deliveryTime: item.delivery_time,
          };
        }),
      });
      setUploadedImage(productData?.image_url);
    }
  }, [productData]);

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
              disabled={productData !== null}
            >
              <SelectTrigger
                className={` w-full bg-[#242424] text-base cursor-pointer border ${
                  errors.stock ? "border-red-500" : "border-gray-700"
                } rounded-md p-6 text-white placeholder-gray-400`}
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
              options={categoryOptions}
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
                    value={variant.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleVariantChange(index, "quantity", value);
                      }
                    }}
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
                    step="0.01"
                    value={variant.unitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleVariantChange(index, "unitPrice", value);
                      }
                    }}
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
                    step="0.01"
                    value={variant.buyingUnitPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleVariantChange(index, "buyingUnitPrice", value);
                      }
                    }}
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
                    value={variant.lowStockLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleVariantChange(index, "lowStockLimit", value);
                      }
                    }}
                    className={"bg-[#242424] p-6 border-gray-700 text-white"}
                  />
                </div>
                <div className="space-y-1">
                  <Input
                    placeholder="Out of Stock Limit"
                    value={variant.outOfStockLimit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d*$/.test(value)) {
                        handleVariantChange(index, "outOfStockLimit", value);
                      }
                    }}
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
        <div className="grid grid-cols-2 space-x-4 pt-6">
          <Button
            onClick={handleCancel}
            className="px-8 btn-gradient-cancel h-[44px] text-white border-none"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-8 btn-gradient-save h-[44px] text-white border-none"
          >
            {isLoading ? "Saving" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
