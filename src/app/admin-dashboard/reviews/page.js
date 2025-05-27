"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { CustomTable } from "@/components/custom-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SquarePen,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { getReviews, updateReview } from "@/lib/api";
import { UpdateReviewModal } from "@/components/update-review-modal";
import { toast } from "sonner";

const columnHelper = createColumnHelper();

export default function ReviewsPage() {
  const { setRoute } = useNavigationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [reviewsData, setReviewsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useUserStore();

  const handleReviewUpdate = (data) => {
    setSelectedReview(data);
    setIsOpen(true);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);
  const columns = [
    columnHelper.accessor("id", {
      header: "Review ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("customer_name", {
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("review_text", {
      header: "Review Text",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("stars", {
      header: "Stars",
      cell: (info) => <span>{`${info.getValue()} out of 5`}</span>,
    }),
    columnHelper.accessor("is_approved", {
      header: "Status",
      cell: (info) => {
        return (
          <>
            {info.getValue() ? (
              <span className="text-sm text-[#23B123] font-medium">
                Approved
              </span>
            ) : (
              <span className="text-sm text-[#F8E623] font-medium">
                Pending
              </span>
            )}
          </>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex justify-end">
          <button
            className="text-white hover:text-purple-300"
            onClick={() => handleReviewUpdate(info.row.original)}
          >
            <SquarePen size={18} />
          </button>
        </div>
      ),
    }),
  ];

  useEffect(() => {
    setRoute("/admin-dashboard/reviews");
  }, [setRoute]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getReviews(startsWith, endsWith, token);
        console.log("Reviews API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load reviews. Please try again.";
          setError(errorMessage);
          setReviewsData([]);
          setTotalCount(0);
          toast.error("Failed to load reviews", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setReviewsData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setReviewsData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load reviews. Please try again.";
        setError(errorMessage);
        setReviewsData([]);
        toast.error("Failed to load reviews", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(0);

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  const onSave = async (data) => {
    try {
      // Get token from user store
      const token = user?.token;

      const response = await updateReview(selectedReview.id, data, token);

      // Check for API errors using hasError property
      if (response?.hasError) {
        const errorMessage = response.message || "Failed to update review";
        toast.error("Failed to update review", {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      toast.success("Review updated", {
        description: `Review has been updated successfully.`,
      });

      // Refresh the user list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving review:", error);

      const errorObj = await error?.response?.data;
      console.log(errorObj);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";

      if (!error.message?.includes("Failed to")) {
        toast.error("Failed to create review", {
          description: errorMessage,
        });
      }

      console.log(error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 w-full">
      <h1 className="text-3xl font-bold text-white">Reviews</h1>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading reviews...</p>
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
              <CustomTable columns={columns} data={reviewsData} />
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
      <UpdateReviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        selectedReview={selectedReview}
      />
    </div>
  );
}
