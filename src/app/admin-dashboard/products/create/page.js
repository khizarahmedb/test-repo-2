"use client";
import ProductForm from "@/components/add-product-form";
import { ArrowLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React from "react";

const CreateProductPage = () => {
  const searchParams = useSearchParams();
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
          {searchParams.get("title")}
        </h1>
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col overflow-y-auto">
        <ProductForm />
      </div>
    </div>
  );
};

export default CreateProductPage;
