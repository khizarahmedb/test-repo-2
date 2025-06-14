"use client";
import ProductForm from "@/components/add-product-form";
import Spinner from "@/components/Spinner";
import { createProduct, getCategories, getInventories } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const CreateProductPage = () => {
  const router = useRouter();
  const [categoriesData, setCategoriesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUserStore();
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);

      try {
        const token = user?.token;
        const startsWith = 0;
        const endsWith = 999;

        const response = await getCategories(startsWith, endsWith, token);
        console.log("Category API Response:", response);

        if (response?.hasError) {
          toast.error("Failed to load categories", {
            description:
              response.message ||
              "Failed to load categories. Please try again.",
          });
          setCategoriesData([]);
        } else {
          const options =
            response?.body?.data?.map((item) => ({
              label: item.name,
              value: String(item.id),
            })) || [];
          setCategoriesData(options);
        }
      } catch (error) {
        console.error("Error fetching category:", error);
        toast.error("Failed to load category", {
          description:
            error?.response?.data?.message ||
            "Failed to load category. Please try again.",
        });
        setCategoriesData([]);
      }

      setIsLoading(false);
    };

    if (user?.token) {
      fetchAllData();
    }
  }, [user]);

  const onFormSubmit = async (data) => {
    try {
      const token = user?.token;
      await createProduct(data, token);
      toast.success("Product Created Successfully");
      router.push("/admin-dashboard/products");
    } catch (error) {
      if (error.status === 400) {
        const errorObj = error.response.data;
        toast.error(errorObj.message);
      } else {
        toast.error("Failed to create product", error.message);
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
          Add Product
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
            categoryOptions={categoriesData}
            onFormSubmit={onFormSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default CreateProductPage;
