"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

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

interface Statistics {
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  completionPercentage: number;
}

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

export default function Home() {
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState<Statistics>({
    totalTasks: 0,
    todoCount: 0,
    inProgressCount: 0,
    doneCount: 0,
    completionPercentage: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all boards and tasks
        const boardsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/boards`
        );
        const tasksResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/tasks`
        );

        setBoards(boardsResponse.data);
        setAllTasks(tasksResponse.data);

        // Calculate statistics
        const tasks = tasksResponse.data;
        const totalTasks = tasks.length;
        const todoCount = tasks.filter((t: Task) => t.status === "todo").length;
        const inProgressCount = tasks.filter(
          (t: Task) => t.status === "in_progress"
        ).length;
        const doneCount = tasks.filter((t: Task) => t.status === "done").length;
        const completionPercentage =
          totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

        setStatistics({
          totalTasks,
          todoCount,
          inProgressCount,
          doneCount,
          completionPercentage,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(boards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBoards = boards.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Analytics Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Analytics</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              <p>Error: {error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Total Tasks Card */}
              <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Total Tasks
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {statistics.totalTasks}
                    </p>
                  </div>
                  <div className="text-4xl text-blue-500">📊</div>
                </div>
              </div>

              {/* To Do Tasks Card */}
              <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      To Do
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {statistics.todoCount}
                    </p>
                  </div>
                  <div
                    className="text-2xl px-3 py-2 rounded text-white"
                    style={{ backgroundColor: "#fecaca" }}
                  >
                    ⭕
                  </div>
                </div>
              </div>

              {/* In Progress Tasks Card */}
              <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      In Progress
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {statistics.inProgressCount}
                    </p>
                  </div>
                  <div
                    className="text-2xl px-3 py-2 rounded text-white"
                    style={{ backgroundColor: "#fbbf24" }}
                  >
                    ⏳
                  </div>
                </div>
              </div>

              {/* Done Tasks Card */}
              <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Completed
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {statistics.doneCount}
                    </p>
                  </div>
                  <div
                    className="text-2xl px-3 py-2 rounded text-white"
                    style={{ backgroundColor: "#86efac" }}
                  >
                    ✅
                  </div>
                </div>
              </div>

              {/* Completion Percentage Card */}
              <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">
                      Completion Rate
                    </p>
                    <p className="text-3xl font-bold mt-2">
                      {statistics.completionPercentage}%
                    </p>
                  </div>
                  <div className="text-4xl">📈</div>
                </div>
                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${statistics.completionPercentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boards Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">All Boards</h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading boards...</p>
            </div>
          ) : error ? (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
              <p>Error: {error}</p>
            </div>
          ) : boards.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No boards found</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedBoards.map(({ id, name, description, color }) => (
                  <div
                    key={id}
                    onClick={() => router.push(`/boards/${id}`)}
                    className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                    style={{ backgroundColor: getColorBackground(color) }}
                  >
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {description || "No description provided"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({boards.length} total
                    boards)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      variant="outline"
                      className="cursor-pointer"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
