"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { CustomTable } from "@/components/custom-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Edit2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  SquarePen,
  Search,
  Trash2,
} from "lucide-react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/lib/api";
import { CouponModal } from "@/components/coupon-modal";
import { toast } from "sonner";

// Column helper for type-safe column definitions
const columnHelper = createColumnHelper();

export default function CouponsPage() {
  const { setRoute } = useNavigationStore();
  const { user } = useUserStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [couponsData, setCouponsData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Make itemsPerPage dynamic

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

  // Column definitions with edit action
  const columns = [
    columnHelper.accessor("id", {
      header: "Coupon ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("coupon_name", {
      header: "Coupon Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("usage_limit", {
      header: "Usage Limit",
      cell: (info) => info.getValue() || info.row.original.max_limit || 0,
    }),
    columnHelper.accessor("expiry_date", {
      header: "Expiry Date",
      cell: (info) => {
        const date = new Date(info.getValue());
        return date.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      },
    }),
    columnHelper.accessor("coupon_code", {
      header: "Coupon Code",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("discount_percent", {
      header: "Discount Percent",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex items-center gap-4">
          <button
            className="text-white hover:text-purple-300"
            onClick={() => handleEditCoupon(info.row.original)}
          >
            <SquarePen size={18} />
          </button>
        </div>
      ),
    }),
  ];

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/admin-dashboard/coupons");
  }, [setRoute]);

  // Fetch coupons data from API
  useEffect(() => {
    const fetchCouponsData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getCoupons(
          startsWith,
          endsWith,
          token,
          searchQuery
        );
        console.log("Coupons API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load coupons. Please try again.";
          setError(errorMessage);
          setCouponsData([]);
          setTotalCount(0);
          toast.error("Failed to load coupons", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setCouponsData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setCouponsData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load coupons. Please try again.";
        setError(errorMessage);
        setCouponsData([]);
        toast.error("Failed to load coupons", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCouponsData();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset to first page when changing items per page
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(0);
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  // Coupon CRUD handlers
  const handleAddCoupon = () => {
    setSelectedCoupon(null);
    setIsModalOpen(true);
  };

  const handleEditCoupon = (coupon) => {
    setSelectedCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSaveCoupon = async (couponData) => {
    try {
      // Get token from user store
      const token = user?.token;

      let response;
      if (selectedCoupon) {
        // Update existing coupon
        response = await updateCoupon(selectedCoupon.id, couponData, token);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage = response.message || "Failed to update coupon";
          toast.error("Failed to update coupon", {
            description: errorMessage,
          });
          throw new Error(errorMessage);
        }

        toast.success("Coupon updated", {
          description: `${couponData.coupon_name} has been updated successfully.`,
        });
      } else {
        // Create new coupon
        response = await createCoupon(couponData, token);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage = response.message || "Failed to create coupon";
          toast.error("Failed to create coupon", {
            description: errorMessage,
          });
          throw new Error(errorMessage);
        }

        toast.success("Coupon created", {
          description: `${couponData.coupon_name} has been created successfully.`,
        });
        console.log("Coupon created response:", response);
      }
      // Refresh the coupon list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving coupon:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      if (!error.message?.includes("Failed to")) {
        toast.error(
          selectedCoupon
            ? "Failed to update coupon"
            : "Failed to create coupon",
          {
            description: errorMessage,
          }
        );
      }

      console.log(error);
      throw error;
    }
  };

  const handleDeleteCoupon = async (id) => {
    try {
      // Get token from user store
      const token = user?.token;

      // Get coupon name for the success message
      const couponName = selectedCoupon?.coupon_name || "Coupon";

      const response = await deleteCoupon(id, token);

      // Check for API errors using hasError property
      if (response?.hasError) {
        const errorMessage = response.message || "Failed to delete coupon";
        toast.error("Failed to delete coupon", {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      toast.success("Coupon deleted", {
        description: `${couponName} has been deleted successfully.`,
      });

      // Refresh the coupon list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting coupon:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred";

      if (!error.message?.includes("Failed to")) {
        toast.error("Failed to delete coupon", {
          description: errorMessage,
        });
      }

      throw error;
    }
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

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Coupons</h1>
        <div className="flex items-center gap-4">
          <div className="h-[3rem] rounded-[.75rem] bg-[#FFFFFF0D] w-[455px] flex items-center gap-[1.125rem]">
            <Search size={25} color="#FFFFFF" className="ml-6" />
            <input
              type="text"
              className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none"
              placeholder="Search ID, Name, Code"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
              }}
            />
          </div>
          <button
            onClick={handleAddCoupon}
            className="btn-gradient-paint  text-white px-4 py-3 rounded-md flex items-center gap-4 transition-colors"
          >
            <div className="border-white border-2 rounded-md p-[2px]">
              <Plus size={18} />
            </div>
            Add Coupon
          </button>
        </div>
      </div>
      <div className="rounded-lg border-2 p-4 border-purple-600 h-[84vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading coupons...</p>
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
              <CustomTable columns={columns} data={couponsData} />
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

      {/* Coupon Modal */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCoupon}
        onDelete={handleDeleteCoupon}
        coupon={selectedCoupon}
      />
    </div>
  );
}
