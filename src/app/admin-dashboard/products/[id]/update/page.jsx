"use client";
import ProductForm from "@/components/add-product-form";
import Spinner from "@/components/Spinner";
import {
  createProduct,
  fetchProductById,
  getCategories,
  getInventories,
  updateProduct,
} from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const UpdateProductPage = () => {
  const router = useRouter();
  const [inventoryData, setInventoryData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [productData, setProductData] = useState(null);
  const { user } = useUserStore();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = user?.token;

      const startsWith = 0;
      const endsWith = 999;

      const categoriesPromise = getCategories(startsWith, endsWith, token);
      const productPromise = fetchProductById(params.id, token);

      const results = await Promise.allSettled([
        categoriesPromise,
        productPromise,
      ]);

      // CATEGORIES
      const categoriesResult = results[0];
      if (categoriesResult.status === "fulfilled") {
        const response = categoriesResult.value;
        console.log("Category API Response:", response);
        if (response?.hasError) {
          setCategoriesData([]);
          toast.error("Failed to load categories", {
            description: response.message || "Please try again.",
          });
        } else {
          const options =
            response?.body?.data?.map((item) => ({
              label: item.name,
              value: String(item.id),
            })) || [];
          setCategoriesData(options);
        }
      } else {
        setCategoriesData([]);
        console.error("Error fetching categories:", categoriesResult.reason);
        toast.error("Failed to load categories", {
          description: categoriesResult.reason?.message || "Please try again.",
        });
      }

      // PRODUCT
      const productResult = results[1];
      if (productResult.status === "fulfilled") {
        const response = productResult.value;
        console.log("Product API Response:", response);
        if (response?.hasError) {
          setProductData(null);
          toast.error("Failed to load product", {
            description: response.message || "Please try again.",
          });
        } else {
          setProductData(response?.body || null);
        }
      } else {
        setProductData(null);
        console.error("Error fetching product:", productResult.reason);
        toast.error("Failed to load product", {
          description: productResult.reason?.message || "Please try again.",
        });
      }

      setIsLoading(false);
    };

    if (user?.token) {
      fetchData();
    }
  }, [user, params.id]);

  const processProductData = (data) => {
    const newVariants = [];
    const updatedVariants = [];
    const prevCategories =
      productData?.categories?.map((item) => item.id) || [];
    const updatedCategories = data.categories || [];

    const newCategoriesAdded = updatedCategories.filter(
      (id) => !prevCategories.includes(id)
    );
    const categoriesRemove = prevCategories.filter(
      (id) => !updatedCategories.includes(id)
    );

    data.variants.forEach((variant) => {
      if (variant.id === null || variant.id === undefined) {
        newVariants.push(variant);
      } else {
        const apiVariant = productData.variants.find(
          (item) => item.id === variant.id
        );

        if (!apiVariant) return; // skip if not found in API

        // Compare fields
        const isModified = Object.keys(variant).some((key) => {
          return variant[key] !== apiVariant[key];
        });

        if (isModified) {
          updatedVariants.push(variant);
        }
      }
    });

    const updatedIds = data.variants
      .map((v) => v.id)
      .filter((v) => v !== null && v !== undefined);

    const deletedVariants = (productData?.variants || [])
      .filter((apiVariant) => !updatedIds.includes(apiVariant.id))
      .map((item) => item.id);
    delete data.variants;
    delete data.stock_id;
    delete data.categories;
    return {
      ...data,
      deleted_variants: deletedVariants,
      updated_variants: updatedVariants,
      new_variants: newVariants,
      new_categories_added: newCategoriesAdded,
      categories_removed: categoriesRemove,
    };
  };

  const onFormSubmit = async (data) => {
    try {
      const token = user?.token;

      const updatedData = processProductData(data);
      console.log("UPDATED DATA", updatedData);

      await updateProduct(productData.id, updatedData, token);

      toast.success("Product Updated Successfully");
      router.push("/admin-dashboard/products");
    } catch (error) {
      if (error.status === 400) {
        const errorObj = error.response.data;
        toast.error(errorObj.message);
      } else {
        console.log(error);

        toast.error("Failed to update product", error.message);
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-4">
        <ArrowLeft
          color="#fff"
          size="34"
          className="cursor-pointer"
          onClick={() => {
            router.push("/admin-dashboard/products");
          }}
        />
        <h1 className="text-[2rem] text-white font-cont font-normal">
          Edit Product
        </h1>
      </div>
      <div className="relative rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col overflow-y-auto">
        {isLoading ? (
          <Spinner
            size="lg"
            className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]"
          />
        ) : (
          <ProductForm
            stockOptions={inventoryData}
            categoryOptions={categoriesData}
            onFormSubmit={onFormSubmit}
            productData={productData}
          />
        )}
      </div>
    </div>
  );
};

export default UpdateProductPage;
