"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { CustomTable } from "@/components/custom-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoveRight,
  Plus,
  Search,
  SquarePen,
} from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";
import { createInventory, getProducts } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

const columnHelper = createColumnHelper();

export default function ProductsPage() {
  const { setRoute } = useNavigationStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useUserStore();

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("image_url", {
      header: "Image",
      cell: (info) => (
        <Image
          src={info.getValue()}
          alt={info.row.original.name}
          width="29"
          height="29"
          className="rounded-lg"
        />
      ),
    }),
    columnHelper.accessor("description", {
      header: "Description",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("variants_count", {
      header: "Variants",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",

      cell: (info) => (
        <div className="flex justify-end gap-2">
          <button
            className="text-white hover:text-purple-300 text-right"
            onClick={() =>
              router.push(
                `/admin-dashboard/products/${info.row.original.id}/update`
              )
            }
          >
            <SquarePen size={18} />
          </button>
          <button
            className="text-white hover:text-purple-300 cursor-pointer"
            onClick={() =>
              router.push(
                `/admin-dashboard/products/${info.row.original.id}/variants?title=${info.row.original.name}`
              )
            }
          >
            <MoveRight size={18} />
          </button>
        </div>
      ),
    }),
  ];

  useEffect(() => {
    setRoute("/admin-dashboard/inventory");
  }, [setRoute]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getProducts(
          startsWith,
          endsWith,
          token,
          searchQuery
        );
        console.log("Products API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load products. Please try again.";
          setError(errorMessage);
          setProductsData([]);
          setTotalCount(0);
          toast.error("Failed to load products", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setProductsData(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setProductsData([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load products. Please try again.";
        setError(errorMessage);
        setProductsData([]);
        toast.error("Failed to load products", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
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
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Products</h1>
        <div className="flex items-center gap-[1.0625rem]">
          <div className="h-[3rem] rounded-[.75rem] bg-[#FFFFFF0D] w-[455px] flex items-center gap-[1.125rem]">
            <Search size={25} color="#FFFFFF" className="ml-6" />
            <input
              type="text"
              className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none"
              placeholder="Search Name"
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
              }}
            />
          </div>
          <button
            className="btn-gradient-paint  text-white px-4 py-3 rounded-md flex items-center gap-4 transition-colors"
            onClick={() => {
              router.push("/admin-dashboard/products/create");
            }}
          >
            <div className="border-white border-2 rounded-md p-[2px]">
              <Plus size={18} />
            </div>
            Add Product
          </button>
        </div>
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading products...</p>
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
              <CustomTable columns={columns} data={productsData} />
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
