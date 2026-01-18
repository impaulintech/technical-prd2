import Navbar from "@/components/navbar";

export default function BoardsPage() {
  return (
    <div>
      <Navbar />
      <main className="max-w-(--breakpoint-xl) mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold">Boards</h1>
      </main>
    </div>
  );
}
