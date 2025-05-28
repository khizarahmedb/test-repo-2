import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./../components/ui/tabs";
import React, { useState, useEffect } from "react";
import { CustomTable } from "./custom-table";
import UserTab from "./user-tab";
import { createColumnHelper } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";
import { UserUpdateModal } from "./user-update-modal";
import { useUserStore } from "@/lib/store";
import { toast } from "sonner";
import { createUser, updateUser } from "@/lib/api";
function UserTabs({
  refreshTrigger,
  setRefreshTrigger,
  isModalOpen,
  setIsModalOpen,
  selectedUser,
  setSelectedUser,
  searchQuery,
}) {
  const [currentTab, setCurrentTab] = useState("customers");
  const columnHelper = createColumnHelper();

  const { user } = useUserStore();
  const customersColumns = [
    columnHelper.accessor("id", {
      header: "User ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("user_ip", {
      header: "IP",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("total_spendings", {
      header: "Total Spending",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("referal_invites", {
      header: "Referrals",
      cell: (info) => info.getValue(),
    }),
  ];
  const otherRoleColumns = [
    columnHelper.accessor("id", {
      header: "User ID",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => info.getValue(),
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex justify-end">
          <button
            className="text-white hover:text-purple-300 text-right"
            onClick={() => handleEditUser(info.row.original)}
          >
            <SquarePen size={18} />
          </button>
        </div>
      ),
    }),
  ];

  function handleEditUser(data) {
    setSelectedUser(data);
    setIsModalOpen(true);
  }
  const onSave = async (data) => {
    try {
      // Get token from user store
      const token = user?.token;

      let response;
      if (selectedUser) {
        const newData = {
          user_id: selectedUser.id,
          role_id: data.role_id,
          name: data.name,
          email: data.email,
        };
        response = await updateUser(newData, token);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage = response.message || "Failed to update coupon";
          toast.error("Failed to update user", {
            description: errorMessage,
          });
          throw new Error(errorMessage);
        }

        toast.success("User updated", {
          description: `${data.name} has been updated successfully.`,
        });
      } else {
        // Create new user
        response = await createUser(data, token);

        // Check for API errors using hasError property
        if (response?.hasError) {
          const errorMessage = response.message || "Failed to create user";
          toast.error("Failed to create user", {
            description: errorMessage,
          });
          throw new Error(errorMessage);
        }

        toast.success("User created", {
          description: `${data.name} has been created successfully.`,
        });
        console.log("User created response:", response);
      }

      // Refresh the user list
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Error saving user:", error);

      // Extract error message from response if available
      const errorMessage =
        error.response?.data?.message ||
        error?.message ||
        "An unexpected error occurred";

      if (!error.message?.includes("Failed to")) {
        toast.error("Failed to create user", {
          description: errorMessage,
        });
      }

      console.log(error);
      throw error;
    }
  };
  return (
    <>
      <Tabs
        value={currentTab}
        className="w-full"
        onValueChange={(val) => setCurrentTab(val)}
      >
        <TabsList className="grid grid-cols-5 w-[515px] h-[54px]">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="managers">Managers</TabsTrigger>
          <TabsTrigger value="resellers">Resellers</TabsTrigger>
          <TabsTrigger value="stockers">Stockers</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>
        <TabsContent value="customers">
          <UserTab
            columns={customersColumns}
            role={"customers"}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            searchQuery={searchQuery}
          />
        </TabsContent>
        <TabsContent value="managers">
          <UserTab
            columns={otherRoleColumns}
            role={"managers"}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            searchQuery={searchQuery}
          />
        </TabsContent>
        <TabsContent value="resellers">
          <UserTab
            columns={otherRoleColumns}
            role={"resellers"}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            searchQuery={searchQuery}
          />
        </TabsContent>
        <TabsContent value="stockers">
          <UserTab
            columns={otherRoleColumns}
            role={"stockers"}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            searchQuery={searchQuery}
          />
        </TabsContent>
        <TabsContent value="support">
          <UserTab
            columns={otherRoleColumns}
            role={"supports"}
            refreshTrigger={refreshTrigger}
            setRefreshTrigger={setRefreshTrigger}
            searchQuery={searchQuery}
          />
        </TabsContent>
      </Tabs>
      <UserUpdateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSave}
        selectedUser={selectedUser}
      />
    </>
  );
}
export default UserTabs;
