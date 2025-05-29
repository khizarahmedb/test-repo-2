"use client";
import ProductForm from "@/components/add-product-form";
import CategoryForm from "@/components/category-form";
import Spinner from "@/components/Spinner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createCategory,
  createProduct,
  getCategories,
  getInventories,
  getProducts,
} from "@/lib/api";
import { useUserStore } from "@/lib/store";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const CreateCategoryPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [productsData, setProductsData] = useState([]);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    products: [],
  });
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const validateForm = () => {
    if (formData.name.trim() === "") {
      setErrors({
        name: "Category is Required",
      });
      return false;
    }
    return true;
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
        [field]: "",
      }));
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getProducts(
          startsWith,
          endsWith,
          token,
          searchQuery
        );
        console.log("Products API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load products. Please try again.";
          setProductsData([]);
          setTotalCount(0);
          toast.error("Failed to load products", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setProductsData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setProductsData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load products. Please try again.";
        setProductsData([]);
        toast.error("Failed to load products", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);

  const goToFirstPage = () => setCurrentPage(0);
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset to first page when changing items per page
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setCurrentPage(0);
      setRefreshTrigger((prev) => prev + 1);
    }, 300); // Debounce delay (in ms)

    return () => {
      clearTimeout(handler); // Clean up previous timeout if input changes again
    };
  }, [searchQuery]);

  const isProductSelected = (id) => {
    return formData.products.some((product) => product.product_id === id);
  };

  // Get all priority options (always show all options)
  const getAllPriorities = () => {
    const selectedProducts = formData.products;
    const totalSelected = selectedProducts.length;
    return Array.from({ length: totalSelected }, (_, i) => i + 1);
  };

  // Get current priority for a product
  const getCurrentPriority = (productId) => {
    const product = formData.products.find((p) => p.product_id === productId);
    return product?.priority || "";
  };

  // Handle priority change with swapping logic
  const handlePriorityChange = (productId, newPriority) => {
    setFormData((prev) => {
      const updatedProducts = [...prev.products];

      // Find if any other product already has this priority
      const existingProductIndex = updatedProducts.findIndex(
        (p) => p.priority === newPriority && p.product_id !== productId
      );

      // Find current product
      const currentProductIndex = updatedProducts.findIndex(
        (p) => p.product_id === productId
      );

      if (existingProductIndex !== -1 && currentProductIndex !== -1) {
        // Swap priorities: give the existing product the current product's priority
        const currentProductPriority =
          updatedProducts[currentProductIndex].priority;
        updatedProducts[existingProductIndex].priority = currentProductPriority;
      }

      // Set new priority for current product
      if (currentProductIndex !== -1) {
        updatedProducts[currentProductIndex].priority = newPriority;
      }

      return {
        ...prev,
        products: updatedProducts,
      };
    });
  };

  // Adjust priorities when a product is removed
  const adjustPrioritiesAfterRemoval = (
    removedProductPriority,
    remainingProducts
  ) => {
    if (!removedProductPriority || removedProductPriority === "")
      return remainingProducts;

    const removedPriorityNum = parseInt(removedProductPriority);

    return remainingProducts.map((product) => {
      if (product.priority && parseInt(product.priority) > removedPriorityNum) {
        return {
          ...product,
          priority: String(parseInt(product.priority) - 1),
        };
      }
      return product;
    });
  };

  const onCheckedChange = (check, item) => {
    if (check) {
      setFormData((prev) => {
        return {
          ...prev,
          products: [...prev.products, { product_id: item.id, priority: "" }],
        };
      });
    } else {
      // Find the product being removed to get its priority
      const productToRemove = formData.products.find(
        (p) => p.product_id === item.id
      );
      const removedPriority = productToRemove?.priority;

      // Remove the product
      const remainingProducts = formData.products.filter(
        (prod) => prod.product_id !== item.id
      );

      // Adjust priorities of remaining products
      const adjustedProducts = adjustPrioritiesAfterRemoval(
        removedPriority,
        remainingProducts
      );

      setFormData((prev) => {
        return {
          ...prev,
          products: adjustedProducts,
        };
      });
    }
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const token = user?.token;

        await createCategory(
          {
            name: formData.name,
            products: formData.products.map((item) => ({
              ...item,
              priority: +item.priority,
            })),
          },
          token
        );
        toast.success("Category Created Successfully");
        router.push("/admin-dashboard/categories");
      } catch (error) {
        if (error.status === 400) {
          toast.error(
            "Failed to Create Category",
            error?.response?.data?.message
          );
        } else {
          toast.error("Failed to Create Category");
        }
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <ArrowLeft
            color="#fff"
            size="34"
            className="cursor-pointer"
            onClick={() => {
              router.push("/admin-dashboard/categories");
            }}
          />
          <h1 className="text-[2rem] text-white font-cont font-normal">
            Add Category
          </h1>
        </div>
        <div className="flex items-center gap-[1.0625rem]">
          <Button
            className={
              "h-[44px] rounded-[.75rem] px-[1.25rem] text-white bg-[#FFFFFF1A]"
            }
            onClick={() => router.push("/admin-dashboard/categories")}
          >
            Cancel
          </Button>
          <Button
            className={
              "h-[44px] rounded-[.75rem] px-[1.25rem] text-white btn-gradient-save"
            }
            onClick={handleSubmit}
          >
            Save Changes
          </Button>
        </div>
      </div>
      <div className="relative rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col overflow-y-auto">
        <div>
          <div>
            <Input
              placeholder="Category Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              error={errors.name}
              className={"bg-[#242424] p-6 border-gray-700 text-white"}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          <h2 className="text-lg font-medium my-3 text-white">
            Priority Products
          </h2>
          <div className="h-[3.1875rem] rounded-[.75rem] bg-[#FFFFFF0D] flex items-center gap-[1.125rem]">
            <Search size={25} color="#FFFFFF" className="ml-6" />
            <input
              type="text"
              className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none bg-transparent"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
              }}
            />
          </div>
          {loading ? (
            <Spinner className="mt-7" size="lg" />
          ) : (
            <>
              <div className="flex flex-col px-5">
                {productsData.map((item) => {
                  const isSelected = isProductSelected(item.id);
                  const allPriorities = getAllPriorities();
                  const currentPriority = getCurrentPriority(item.id);

                  return (
                    <div
                      key={item.id}
                      className="py-3 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(e) => onCheckedChange(e, item)}
                        />
                        {item.image_url && (
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            width={29}
                            height={29}
                          />
                        )}
                        <h4 className="text-sm font-medium text-white">
                          {item.name}
                        </h4>
                      </div>
                      <Select
                        value={currentPriority}
                        onValueChange={(value) =>
                          handlePriorityChange(item.id, value)
                        }
                        disabled={!isSelected}
                      >
                        <SelectTrigger
                          className={`w-[110px] bg-[#242424] text-base cursor-pointer border rounded-md p-6 text-white placeholder-gray-400 ${
                            !isSelected ? "opacity-50 cursor-not-allowed" : ""
                          }`}
                        >
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="text-white bg-[#242424] border-gray-700">
                          {allPriorities.map((priority) => (
                            <SelectItem
                              key={priority}
                              value={String(priority)}
                              className="p-4 text-base hover:bg-[#333333] cursor-pointer"
                            >
                              {priority}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
              {totalCount > 0 && (
                <div className="flex items-center justify-between mt-4 text-white">
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Show</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="bg-gray-800 border border-gray-600 rounded-md px-2 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-sm">entries</span>
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={goToFirstPage}
                      disabled={currentPage === 0}
                      className="p-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft size={20} />
                    </button>
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 0}
                      className="p-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={20} />
                    </button>

                    <div className="flex items-center gap-1">
                      <span>Page</span>
                      <span className="font-bold">{currentPage + 1}</span>
                      <span>of</span>
                      <span className="font-bold">{totalPages}</span>
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage >= lastPageIndex}
                      className="p-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <button
                      onClick={goToLastPage}
                      disabled={currentPage >= lastPageIndex}
                      className="p-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight size={20} />
                    </button>
                  </div>

                  {/* Total count display */}
                  <div className="text-sm text-gray-400">
                    Showing {currentPage * itemsPerPage + 1} to{" "}
                    {Math.min((currentPage + 1) * itemsPerPage, totalCount)} of{" "}
                    {totalCount} entries
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryPage;
