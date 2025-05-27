import React, { useState, useEffect } from "react";
import { CustomTable } from "./custom-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { toast } from "sonner";
import { getUsers } from "@/lib/api";
import { useUserStore } from "@/lib/store";
const UserTab = ({
  role,
  columns,
  refreshTrigger,
  setRefreshTrigger,
  searchQuery,
}) => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const { user } = useUserStore();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const columnHelper = createColumnHelper();
  const [customersData, setCustomersData] = useState([]);

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

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

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getUsers(
          startsWith,
          endsWith,
          token,
          role,
          searchQuery
        );
        console.log("Customers API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load coupons. Please try again.";
          setError(errorMessage);
          setCustomersData([]);
          setTotalCount(0);
          toast.error("Failed to load coupons", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setCustomersData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setCustomersData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        const errorMessage =
          error.response?.data?.message ||
          `Failed to load users. Please try again.`;
        setError(errorMessage);
        setCustomersData([]);
        toast.error("Failed to load users", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsersData();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);

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
    <div className="rounded-lg border-2 p-4 border-purple-600 h-[84vh] flex flex-col mt-4">
      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <p className="text-white">Loading {role}...</p>
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
            <CustomTable columns={columns} data={customersData} />
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
  );
};

export default UserTab;
