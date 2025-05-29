import React, { useState } from "react";
import { Input } from "./ui/input";
import { Search } from "lucide-react";

const CategoryForm = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    categoryName: "",
    products: [],
  });
  const validateForm = () => {
    if (formData.categoryName.trim() === "") {
      setErrors({
        categoryName: "Category is Required",
      });
      return false;
    }
    return true;
  };
  return (
    <div>
      <Input
        placeholder="Category Name"
        value={formData.categoryName}
        onChange={(e) => handleInputChange("categoryName", e.target.value)}
        error={errors.categoryName}
        className={"bg-[#242424] p-6 border-gray-700 text-white"}
      />
      <h2 className="text-lg font-medium my-3 text-white">Priority Products</h2>
      <div className="h-[3.1875rem] rounded-[.75rem] bg-[#FFFFFF0D] flex items-center gap-[1.125rem]">
        <Search size={25} color="#FFFFFF" className="ml-6" />
        <input
          type="text"
          className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value;
            setSearchQuery(value);
          }}
        />
      </div>
    </div>
  );
};

export default CategoryForm;
