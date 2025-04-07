"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { eventService } from "@/services/eventService";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

// Dynamically import the Card components with loading fallback
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  {
    loading: () => (
      <div className="animate-pulse bg-gray-200 h-48 rounded-lg" />
    ),
  }
);
const CardHeader = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardHeader)
);
const CardTitle = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardTitle)
);
const CardDescription = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardDescription)
);
const CardContent = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardContent)
);
const CardFooter = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardFooter)
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function Home() {
  const [currentPage, setCurrentPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["events", currentPage],
    queryFn: async () => {
      try {
        const response = await eventService.getAllEvents(currentPage);
        return response;
      } catch (error) {
        console.error("Error loading events:", error);
        toast.error("Failed to load events. Please try again later.");
        throw error;
      }
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600">
            Failed to load events. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const events = data?.content || [];
  const totalPages = data?.totalPages || 0;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Events</h1>
        <Link href="/events/new">
          <Button>Create New Event</Button>
        </Link>
      </div>

      <Suspense fallback={<LoadingSpinner />}>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{event.title}</CardTitle>
                <CardDescription>{event.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <p>
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <span className="font-medium">End:</span>{" "}
                    {new Date(event.endDate).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/events/${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Suspense>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage === totalPages - 1}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
