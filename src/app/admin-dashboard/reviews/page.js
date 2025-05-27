"use client";

import { useEffect, useState } from "react";
import { useNavigationStore } from "@/lib/store";
import { CustomTable } from "@/components/custom-table";
import { SquarePen } from "lucide-react";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper();

export default function ReviewsPage() {
  const { setRoute } = useNavigationStore();
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const columns = [
    columnHelper.accessor("id", {
      header: "Review ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("user", {
      header: "User",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("review_text", {
      header: "Review Text",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("stars", {
      header: "Stars",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => (
        <button
          className="text-white hover:text-purple-300"
          // onClick={() => handleEditCoupon(info.row.original)}
        >
          <SquarePen size={18} />
        </button>
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
        const response = await getCoupons(startsWith, endsWith, token);
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
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-white">Reviews</h1>
      <div className="rounded-lg border-2 p-4 border-purple-600 h-[84vh] flex flex-col">
        <div className="flex-1 overflow-auto">
          <CustomTable columns={columns} data={[]} />
        </div>
      </div>
    </div>
  );
}
