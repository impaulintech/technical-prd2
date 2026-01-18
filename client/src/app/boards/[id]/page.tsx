"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
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

const statusColors: Record<string, string> = {
  todo: "#fecaca",
  in_progress: "#fbbf24",
  done: "#86efac",
};

const priorityColors: Record<string, string> = {
  low: "#a7f3d0",
  medium: "#fcd34d",
  high: "#fca5a5",
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

export default function BoardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [openTaskDetailDialog, setOpenTaskDetailDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    status: "todo" as "todo" | "in_progress" | "done",
    assigned_to: "",
    priority: "low" as "low" | "medium" | "high",
    due_date: "",
  });

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`
        );
        setBoard(response.data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch board"
        );
      } finally {
        setLoading(false);
      }
    };

    if (boardId) {
      fetchBoard();
    }
  }, [boardId]);

  const handleTaskInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTaskFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateTask = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
        ...taskFormData,
        board_id: parseInt(boardId),
      });
      setToast({
        message: `Task "${taskFormData.title}" created successfully!`,
        type: "success",
      });
      setTaskFormData({
        title: "",
        description: "",
        status: "todo",
        assigned_to: "",
        priority: "low",
        due_date: "",
      });
      setOpenTaskDialog(false);
      // Refetch board data
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`);
      setBoard(response.data);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create task";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error creating task:", err);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setTaskFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      assigned_to: task.assigned_to || "",
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split("T")[0] : "",
    });
    setIsEditingTask(false);
    setOpenTaskDetailDialog(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/tasks/${selectedTask.id}`,
        {
          ...taskFormData,
          board_id: selectedTask.board_id,
        }
      );
      setToast({
        message: `Task "${taskFormData.title}" updated successfully!`,
        type: "success",
      });
      setIsEditingTask(false);
      // Refetch board data
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`);
      setBoard(response.data);
      setOpenTaskDetailDialog(false);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update task";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error updating task:", err);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${selectedTask.id}`);
      setToast({
        message: "Task deleted successfully!",
        type: "success",
      });
      setOpenTaskDetailDialog(false);
      // Refetch board data
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/boards/${boardId}`);
      setBoard(response.data);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete task";
      setToast({
        message: errorMessage,
        type: "error",
      });
      console.error("Error deleting task:", err);
      setTimeout(() => setToast(null), 3000);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading board...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md">
            <p>Error: {error || "Board not found"}</p>
          </div>
          <Button onClick={() => router.back()} className="mt-4 cursor-pointer">
            Go Back
          </Button>
        </main>
      </div>
    );
  }

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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Board Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button onClick={() => router.back()} className="cursor-pointer">
              ← Back
            </Button>
          </div>
          <div
            className="rounded-lg p-6 text-white"
            style={{ backgroundColor: getColorBackground(board.color) }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {board.name}
            </h1>
            <p className="text-gray-700 mb-4">{board.description}</p>
            <div className="text-sm text-gray-600">
              <p>Created: {new Date(board.created_at).toLocaleDateString()}</p>
              <p>
                Last updated: {new Date(board.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Tasks ({board.tasks.length})</h2>
            <Button onClick={() => setOpenTaskDialog(true)} className="cursor-pointer">
              + Create Task
            </Button>
          </div>

          <Sheet open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create New Task</SheetTitle>
                <SheetDescription>
                  Enter the details for your new task
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6 px-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    type="text"
                    name="title"
                    value={taskFormData.title}
                    onChange={handleTaskInputChange}
                    placeholder="Task title"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    name="description"
                    value={taskFormData.description}
                    onChange={handleTaskInputChange}
                    placeholder="Task description"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={taskFormData.status}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned To</label>
                  <input
                    type="text"
                    name="assigned_to"
                    value={taskFormData.assigned_to}
                    onChange={handleTaskInputChange}
                    placeholder="Assignee name"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <select
                    name="priority"
                    value={taskFormData.priority}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={taskFormData.due_date}
                    onChange={handleTaskInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button onClick={handleCreateTask} className="w-full cursor-pointer">
                  Create Task
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {board.tasks.length === 0 ? (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {board.tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDetail(task)}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer hover:bg-muted/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold">{task.title}</h3>
                    <div className="flex gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: statusColors[task.status] }}
                      >
                        {task.status.replace("_", " ")}
                      </span>
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: priorityColors[task.priority] }}
                      >
                        {task.priority}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">
                    {task.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="font-medium">Assigned to:</span>
                      <p className="text-muted-foreground">{task.assigned_to}</p>
                    </div>
                    <div>
                      <span className="font-medium">Due date:</span>
                      <p className="text-muted-foreground">
                        {new Date(task.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <p className="text-muted-foreground">
                        {new Date(task.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span>
                      <p className="text-muted-foreground">
                        {new Date(task.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Task Detail Side Panel */}
        <Sheet open={openTaskDetailDialog} onOpenChange={setOpenTaskDetailDialog}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {isEditingTask ? "Edit Task" : "Task Details"}
              </SheetTitle>
              <SheetDescription>
                {isEditingTask
                  ? "Update task information"
                  : "View task details"}
              </SheetDescription>
            </SheetHeader>
            {selectedTask && (
              <div className="space-y-4 mt-6 px-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  {isEditingTask ? (
                    <input
                      type="text"
                      name="title"
                      value={taskFormData.title}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {taskFormData.title}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  {isEditingTask ? (
                    <textarea
                      name="description"
                      value={taskFormData.description}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {taskFormData.description || "No description"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  {isEditingTask ? (
                    <select
                      name="status"
                      value={taskFormData.status}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  ) : (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor: statusColors[taskFormData.status],
                      }}
                    >
                      {taskFormData.status.replace("_", " ")}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned To</label>
                  {isEditingTask ? (
                    <input
                      type="text"
                      name="assigned_to"
                      value={taskFormData.assigned_to}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {taskFormData.assigned_to || "Not assigned"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  {isEditingTask ? (
                    <select
                      name="priority"
                      value={taskFormData.priority}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  ) : (
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        backgroundColor:
                          priorityColors[taskFormData.priority],
                      }}
                    >
                      {taskFormData.priority}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Due Date</label>
                  {isEditingTask ? (
                    <input
                      type="date"
                      name="due_date"
                      value={taskFormData.due_date}
                      onChange={handleTaskInputChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {taskFormData.due_date
                        ? new Date(taskFormData.due_date).toLocaleDateString()
                        : "No due date"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Created</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTask.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Updated</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedTask.updated_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 flex gap-2">
                  {isEditingTask ? (
                    <>
                      <Button
                        onClick={handleUpdateTask}
                        className="flex-1 cursor-pointer"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={() => setIsEditingTask(false)}
                        variant="outline"
                        className="flex-1 cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setIsEditingTask(true)}
                        className="flex-1 cursor-pointer"
                      >
                        Edit Task
                      </Button>
                      <Button
                        onClick={handleDeleteTask}
                        variant="destructive"
                        className="flex-1 cursor-pointer"
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </main>
    </div>
  );
}
