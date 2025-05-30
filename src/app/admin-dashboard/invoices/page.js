"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { getInvoices } from "@/lib/api";
import { toast } from "sonner";
import { CustomTable } from "@/components/custom-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";

// Column helper for type-safe column definitions
const columnHelper = createColumnHelper();

export default function InvoicesPage() {
  const { setRoute } = useNavigationStore();
  const { user } = useUserStore();
  const [currentPage, setCurrentPage] = useState(0);
  const [invoicesData, setInvoicesData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

  // Column definitions for invoices table
  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => `TX${info.getValue()}`,
    }),
    columnHelper.accessor("customer_name", {
      header: "Customer Name",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("customer_email", {
      header: "Customer Email",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("products", {
      header: "Product(s)",
      cell: (info) => {
        const products = info.getValue() || [];
        if (products.length === 0) return "No products";

        // Show first product name and count if multiple
        const firstProduct =
          products[0]?.product_info?.name || "Unknown Product";
        const totalProducts = products.length;

        if (totalProducts === 1) {
          return firstProduct;
        } else {
          return `${firstProduct} +${totalProducts - 1} more`;
        }
      },
    }),
    columnHelper.accessor("inv_amount", {
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue() || 0;
        const currency = info.row.original.inv_currency || "USD";
        return `$${amount.toFixed(2)}`;
      },
    }),
    columnHelper.accessor("payment_gateway", {
      header: "Gateway",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("payment_status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue() || "Unknown";
        const isSuccessful = status.toLowerCase() === "successful";

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isSuccessful
                ? "bg-green-900/20 text-green-400 border border-green-500/20"
                : "bg-red-900/20 text-red-400 border border-red-500/20"
            }`}
          >
            {status}
          </span>
        );
      },
    }),
  ];

  // Set the current route in the navigation store
  useEffect(() => {
    setRoute("/admin-dashboard/invoices");
  }, [setRoute]);

  // Fetch invoices data with pagination
  useEffect(() => {
    const fetchInvoicesData = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calculate pagination parameters
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        console.log(
          `Fetching invoices: startsWith=${startsWith}, endsWith=${endsWith}`
        );

        // Get token from user store
        const token = user?.token;

        // Call the API with pagination parameters
        const response = await getInvoices(
          startsWith,
          endsWith,
          token,
          searchQuery
        );
        console.log("Invoices API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError === true) {
          const errorMessage =
            response.message || "Failed to load invoices data";
          setError(errorMessage);
          setInvoicesData([]);
          setTotalCount(0);
          toast.error("Failed to load invoices", {
            description: errorMessage,
          });
          return;
        }

        // Extract invoices data from response
        if (response && response.body) {
          setInvoicesData(response.body.data || []);
          setTotalCount(response.body.totalcount || 0);

          if (response.body.data && response.body.data.length > 0) {
            toast.success("Invoices loaded successfully");
          }
        } else {
          setInvoicesData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching invoices data:", error);

        // Handle different types of errors
        let errorMessage = "Failed to load invoices data";

        if (error.response?.data?.hasError === true) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setInvoicesData([]);
        setTotalCount(0);
        toast.error("Failed to load invoices", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInvoicesData();
  }, [user?.token, currentPage, itemsPerPage, refreshTrigger]);

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

  // Calculate summary statistics
  const successfulInvoices = invoicesData.filter(
    (invoice) => invoice.payment_status?.toLowerCase() === "successful"
  ).length;

  const totalRevenue = invoicesData
    .filter((invoice) => invoice.payment_status?.toLowerCase() === "successful")
    .reduce((sum, invoice) => sum + (invoice.inv_amount || 0), 0);

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
        <h1 className="text-3xl font-bold text-white">Invoices</h1>
        <div className="flex items-center gap-4">
          <div className="h-[3rem] rounded-[.75rem] bg-[#FFFFFF0D] w-[455px] flex items-center gap-[1.125rem]">
            <Search size={25} color="#FFFFFF" className="ml-6" />
            <input
              type="text"
              className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none"
              placeholder="Search ID, Customer Name"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
              }}
            />
          </div>
          <div className="text-sm text-gray-400">
            {totalCount > 0
              ? `${totalCount} invoice${totalCount !== 1 ? "s" : ""} found`
              : "No invoices"}
          </div>
        </div>
      </div>

      {/* Main Table with Pagination */}
      <div className="rounded-lg border-2 p-4 border-purple-600 h-[84vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
              <p className="text-white">Loading invoices...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto">
              <CustomTable columns={columns} data={invoicesData} />
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
