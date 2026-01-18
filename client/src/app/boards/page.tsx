"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Task {
  id: number;
  board_id: number;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  assigned_to: string;
  priority: "low" | "medium" | "high";
  due_date: string;
  created_at: string;
  updated_at: string;
}

interface Board {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  updated_at: string;
  tasks: Task[];
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "red",
  });
  const router = useRouter();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/boards`
        );
        setBoards(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch boards"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateBoard = async () => {
    try {
      const response = await axios.post("http://localhost:3001/api/boards", formData);
      setToast({
        message: `Board "${response.data.name}" created successfully!`,
        type: "success",
      });
      setFormData({ name: "", description: "", color: "red" });
      setOpenDialog(false);
      // Refetch boards
      const boardsResponse = await axios.get("http://localhost:3001/api/boards");
      setBoards(boardsResponse.data);
      // Auto-hide toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create board";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error creating board:", err);
      // Auto-hide toast after 3 seconds
      setTimeout(() => setToast(null), 3000);
    }
  };

  const getColorBackground = (color: string): string => {
    const colorMap: Record<string, string> = {
      red: "#fee2e2",
      blue: "#dbeafe",
      green: "#dcfce7",
      yellow: "#fef3c7",
      purple: "#f3e8ff",
      pink: "#fbcfe8",
    };
    return colorMap[color] || "#f1f5f9";
  };

  return (
    <div>
      <Navbar />
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-3 rounded-md text-white z-50 animate-in fade-in ${
            toast.type === "success"
              ? "bg-green-500"
              : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
      <main className="max-w-(--breakpoint-md) mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Boards</h1>
          <Button onClick={() => setOpenDialog(true)} className="cursor-pointer">
            Create Board
          </Button>
        </div>

        <Sheet open={openDialog} onOpenChange={setOpenDialog}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create New Board</SheetTitle>
              <SheetDescription>
                Enter the details for your new board
              </SheetDescription>
            </SheetHeader>
            <div className="space-y-4 mt-6 px-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Board name"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Board description"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="red">Red</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="yellow">Yellow</option>
                  <option value="purple">Purple</option>
                  <option value="pink">Pink</option>
                </select>
              </div>
              <Button onClick={handleCreateBoard} className="w-full cursor-pointer">
                Create Board
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading boards...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            <p>Error: {error}</p>
          </div>
        )}

        {!loading && boards.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No boards found</p>
          </div>
        )}

        {!loading && boards.length > 0 && (
          <div className="space-y-2">
            {boards.map(({ id, name, description, color }) => (
              <div
                key={id}
                onClick={() => router.push(`/boards/${id}`)}
                className="border-none rounded-md px-4 py-4 bg-secondary cursor-pointer hover:shadow-md transition-shadow"
                style={{ backgroundColor: getColorBackground(color) }}
              >
                <div>
                  <h2 className="font-semibold text-lg">{name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {description || "No description provided"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
