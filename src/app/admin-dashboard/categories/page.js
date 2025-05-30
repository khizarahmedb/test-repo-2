"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { CustomTable } from "@/components/custom-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  deleteCategory,
  getCategories,
  getReviews,
  updateReview,
} from "@/lib/api";
import { UpdateReviewModal } from "@/components/update-review-modal";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const columnHelper = createColumnHelper();

export default function CategoryPage() {
  const { setRoute } = useNavigationStore();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useUserStore();

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const token = user?.token;
      await deleteCategory(id, token);
      toast.success("Product Deleted Successfully");
      setRefreshTrigger((prev) => prev + 1);
      setLoading(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete product");
      setLoading(false);
    }
  };
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("product_count", {
      header: "Products",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex justify-end gap-4">
          <button
            className="text-white hover:text-purple-300"
            onClick={() =>
              router.push(
                `/admin-dashboard/categories/${info.row.original.id}/update`
              )
            }
          >
            <SquarePen size={18} />
          </button>
          <button
            className="text-white hover:text-purple-300 text-right"
            onClick={() => handleDelete(info.row.original.id)}
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    }),
  ];

  useEffect(() => {
    setRoute("/admin-dashboard/reviews");
  }, [setRoute]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getCategories(startsWith, endsWith, token);
        console.log("Categories API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load categories. Please try again.";
          setError(errorMessage);
          setCategoryData([]);
          setTotalCount(0);
          toast.error("Failed to load categories", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setCategoryData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setCategoryData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load categories. Please try again.";
        setError(errorMessage);
        setCategoryData([]);
        toast.error("Failed to load categories", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);

  // Pagination handlers
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

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Categories</h1>
        <div className="flex items-center gap-[1.0625rem]">
          <button
            className="btn-gradient-paint  text-white px-4 py-3 rounded-md flex items-center gap-4 transition-colors"
            onClick={() => {
              router.push("/admin-dashboard/categories/create");
            }}
          >
            <div className="border-white border-2 rounded-md p-[2px]">
              <Plus size={18} />
            </div>
            Add Category
          </button>
        </div>
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading categories...</p>
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
              <CustomTable columns={columns} data={categoryData} />
            </div>
            {/* Pagination with Items Per Page Selector */}
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
}
