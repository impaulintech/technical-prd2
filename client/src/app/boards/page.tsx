"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

interface Board {
  id: string;
  title: string;
  description?: string;
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <Navbar />
      <main className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Boards</h1>
          <Button>Create Board</Button>
        </div>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h2 className="text-lg font-semibold mb-2">{board.title}</h2>
                {board.description && (
                  <p className="text-sm text-muted-foreground">
                    {board.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
