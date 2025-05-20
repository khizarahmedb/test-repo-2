"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/userContext";
import {
  addInventory,
  editInventory,
  deleteInventory,
} from "@/utils/axiosInstance"; // Adjust import path as needed

export function InventoryModal({ isOpen, onClose, mode, inventoryItem }) {
  const { user, inventory, setInventory, fetchData } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stock_name: "",
    delimiter: ",", // Default delimiter
  });

  // Initialize form data when modal opens or changes mode
  useEffect(() => {
    if (mode === "edit" && inventoryItem) {
      setFormData({
        stock_name: inventoryItem.stock_name || "",
        delimiter: inventoryItem.delimiter || ",",
      });
    } else {
      // Reset form for add mode
      setFormData({
        stock_name: "",
        delimiter: ",",
      });
    }
    setIsSubmitting(false);
  }, [mode, inventoryItem, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);

      // Prepare data for API
      const apiData = {
        ...formData,
      };

      if (mode === "add") {
        // Add new inventory item
        const response = await addInventory(user.token, apiData);
        console.log("Inventory item added successfully", response);

        // Option 1: Update the inventory state directly with the new item
        if (response && response.body) {
          setInventory([...inventory, response.body]);
        } else {
          // Option 2: Refetch all data if the response doesn't include the new item
          await fetchData();
        }
      } else {
        // Edit existing inventory item
        const response = await editInventory(
          user.token,
          inventoryItem.id,
          apiData
        );
        console.log("Inventory item updated successfully", response);

        // Option 1: Update the specific item in the state
        if (response && response.body) {
          setInventory(
            inventory.map((item) =>
              item.id === inventoryItem.id ? response.body : item
            )
          );
        } else {
          // Option 2: Update the item in state with local data
          const updatedItem = {
            ...inventoryItem,
            ...apiData,
            // Keep other fields that might not be in the form
            id: inventoryItem.id,
            created_at: inventoryItem.created_at,
            created_by: inventoryItem.created_by,
            last_updated: new Date().toISOString(),
            products: inventoryItem.products,
            status: inventoryItem.status,
          };
          setInventory(
            inventory.map((item) =>
              item.id === inventoryItem.id ? updatedItem : item
            )
          );
        }
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error saving inventory item:", error);
      // Option 3: Always refetch on error to ensure data consistency
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!inventoryItem || !inventoryItem.id) return;

    try {
      setIsSubmitting(true);
      await deleteInventory(user.token, inventoryItem.id);
      console.log("Inventory item deleted successfully");

      // Option 1: Remove the deleted item from state
      setInventory(inventory.filter((item) => item.id !== inventoryItem.id));

      onClose();
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      // Refetch on error to ensure data consistency
      await fetchData();
    } finally {
      setIsSubmitting(false);
    }
  };

  const CloseButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-4 top-4 text-gray-400 hover:text-white"
      onClick={onClose}
    >
      <X className="h-4 w-4" />
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="no-scrollbar bg-black text-white border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {mode === "add" ? "Add Stock" : "Edit Stock"}
          </DialogTitle>
          <CloseButton />
        </DialogHeader>

        {/* Delete button only shown in edit mode */}
        {mode === "edit" && (
          <Button
            variant="destructive"
            className="absolute right-4 top-4 bg-red-600 hover:bg-red-700"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete Stock
          </Button>
        )}

        <div className="grid gap-4 py-4">
          {/* Stock Name */}
          <Textarea
            name="stock_name"
            placeholder="Stock"
            value={formData.stock_name}
            onChange={handleInputChange}
            className="bg-gray-900 border-gray-700 min-h-[150px]"
            disabled={isSubmitting}
          />

          {/* Delimiter */}
          <Select
            value={formData.delimiter}
            onValueChange={(value) => handleSelectChange("delimiter", value)}
          >
            <SelectTrigger className="bg-gray-900 border-gray-700">
              <SelectValue placeholder="Delimiter" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value=",">Comma</SelectItem>
              <SelectItem value=";">Semi colon</SelectItem>
              <SelectItem value="|">New line</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-800 hover:bg-gray-700 border-gray-700"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : mode === "add" ? "Add Stock" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
