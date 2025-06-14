"use client";
import { CustomTable } from "@/components/custom-table";
import { getProductVariants, getproductVariants } from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";

const columnHelper = createColumnHelper();

const ProductVariantPage = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [productVariants, setProductVariants] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useUserStore();
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

  const goToFirstPage = () => setCurrentPage(0);

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("availability", {
      header: "Availability",
      cell: (info) => {
        return (
          <>
            {info.getValue() === "Available" ? (
              <span className="text-[#23B123] text-sm font-medium">
                {info.getValue()}
              </span>
            ) : (
              <span className="text-[#23B123] text-sm font-medium">
                {info.getValue()}
              </span>
            )}
          </>
        );
      },
    }),
    columnHelper.accessor("quantity", {
      header: "Stock",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("price", {
      header: "Price",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("delivery_time", {
      header: "Delivery Time",
      cell: (info) => info.getValue(),
    }),
  ];

  useEffect(() => {
    const fetchProductVariants = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getProductVariants(
          params.id,
          startsWith,
          endsWith,
          token
        );
        console.log("Product Variants API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load variants. Please try again.";
          setError(errorMessage);
          setProductVariants([]);
          setTotalCount(0);
          toast.error("Failed to load variants", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setProductVariants(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setProductVariants([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching variants:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load variants. Please try again.";
        setError(errorMessage);
        setProductVariants([]);
        toast.error("Failed to load variants", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProductVariants();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset to first page when changing items per page
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
          {searchParams.get("title")}
        </h1>
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading variants...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => setRefreshTrigger((prev) => prev + 1)}
              className="ml-4 bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <CustomTable columns={columns} data={productVariants} />
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
  );
};

export default ProductVariantPage;
