"use client";

import { useEffect, useState } from "react";
import { useNavigationStore, useUserStore } from "@/lib/store";
import { Plus, Search } from "lucide-react";
import UserTabs from "./../../../components/user-tabs";

export default function UsersPage() {
  const { setRoute } = useNavigationStore();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    setRoute("/admin-dashboard/users");
  }, [setRoute]);

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Users</h1>
        <div className="flex items-center gap-[1.0625rem]">
          <div className="h-[3rem] rounded-[.75rem] bg-[#FFFFFF0D] w-[455px] flex items-center gap-[1.125rem]">
            <Search size={25} color="#FFFFFF" className="ml-6" />
            <input
              type="text"
              className="flex-grow h-full text-white focus-visible:border-none focus-visible:outline-none"
              placeholder="Search by ID, Name"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          <button
            className="btn-gradient-paint  text-white px-4 py-3 rounded-md flex items-center gap-4 transition-colors"
            onClick={() => {
              setSelectedUser(null);
              setIsModalOpen(true);
            }}
          >
            <div className="border-white border-2 rounded-md p-[2px]">
              <Plus size={18} />
            </div>
            Add Users
          </button>
        </div>
      </div>
      <UserTabs
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        searchQuery={searchQuery}
      />
    </div>
  );
}
