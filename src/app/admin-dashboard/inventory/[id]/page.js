"use client";
import { CustomTable } from "@/components/custom-table";
import { EditEntryModal } from "@/components/edit-entry-modal";
import { Button } from "@/components/ui/button";
import {
  deleteInventory,
  deleteInventoryItem,
  getInventoryItems,
  updateEntry,
} from "@/lib/api";
import { useUserStore } from "@/lib/store";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
const columnHelper = createColumnHelper();
const InventoryItemsPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [inventoryItems, setInventoryItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { user } = useUserStore();
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const lastPageIndex = Math.max(0, totalPages - 1);

  const handleDelete = async () => {
    try {
      const token = user?.token;
      await deleteInventory(params.id, token);
      toast.success("Stock Deleted Successfully");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete stock");
    }
  };

  const handleEntryDelete = async () => {
    try {
      const token = user?.token;
      await deleteInventoryItem(selectedEntry.id, token);
      toast.success("Stock Deleted Successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to delete stock");
    }
  };

  const columns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("value", {
      header: "Item",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <div className="flex justify-end gap-4">
          <button
            className="text-white hover:text-purple-300 cursor-pointer"
            onClick={() => {
              setSelectedEntry(info.row.original);
              setIsOpen(true);
            }}
          >
            <SquarePen size={18} />
          </button>
        </div>
      ),
    }),
  ];

  const goToFirstPage = () => setCurrentPage(0);

  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () =>
    setCurrentPage((prev) => Math.min(lastPageIndex, prev + 1));
  const goToLastPage = () => setCurrentPage(lastPageIndex);

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const startsWith = currentPage * itemsPerPage;
        const endsWith = startsWith + (itemsPerPage - 1);

        // Get token from user store
        const token = user?.token;

        // Call the API service function with pagination parameters
        const response = await getInventoryItems(
          params.id,
          startsWith,
          endsWith,
          token
        );
        console.log("Inventory API Response:", response);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage =
            response.message || "Failed to load inventory. Please try again.";
          setError(errorMessage);
          setInventoryItems([]);
          setTotalCount(0);
          toast.error("Failed to load inventory", {
            description: errorMessage,
          });
          return;
        }

        // Update state with the actual API data
        if (response && response.body && response.body.data) {
          setInventoryItems(response.body.data);
          setTotalCount(response.body.totalcount || 0);
        } else {
          setInventoryItems([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error fetching inventory:", error);
        const errorMessage =
          error.response?.data?.message ||
          "Failed to load inventory. Please try again.";
        setError(errorMessage);
        setInventoryItems([]);
        toast.error("Failed to load inventory", {
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryItems();
  }, [currentPage, user, itemsPerPage, refreshTrigger]);
  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(0); // Reset to first page when changing items per page
  };

  const onSave = async (data) => {
    try {
      // Get token from user store
      const token = user?.token;

      const response = await updateEntry(
        selectedEntry.id,
        { name: data.entry },
        token
      );

      // Check for API errors using hasError property
      if (response?.hasError) {
        const errorMessage = response.message || "Failed to update entry";
        toast.error("Failed to update entry", {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      toast.success("Entry updated", {
        description: `Entry has been updated successfully.`,
      });

      // Refresh the user list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving entry:", error);

      const errorObj = await error?.response?.data;
      console.log(errorObj);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";

      if (!error.message?.includes("Failed to")) {
        toast.error("Failed to create entry", {
          description: errorMessage,
        });
      }

      console.log(error);
      throw error;
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ArrowLeft
            color="#fff"
            size="34"
            className="cursor-pointer"
            onClick={() => {
              router.push("/admin-dashboard/inventory");
            }}
          />
          <h1 className="text-[2rem] text-white font-cont font-normal">
            {searchParams.get("title")}
          </h1>
        </div>
        <Button className={"bg-[#FF0000]"} onClick={handleDelete}>
          Delete Stock
        </Button>
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 border-purple-600 h-[84vh] flex flex-col overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center flex-1">
            <p className="text-white">Loading inventory items...</p>
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
              <CustomTable columns={columns} data={inventoryItems} />
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
      <EditEntryModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSave={onSave}
        selectedEntry={selectedEntry}
        onDelete={handleEntryDelete}
      />
    </div>
  );
};

export default InventoryItemsPage;
