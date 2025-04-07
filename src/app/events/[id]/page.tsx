"use client";

import { useState } from "react";
import Link from "next/link";
import { eventService } from "@/services/eventService";
import { use } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Dynamically import the Card components
const Card = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.Card)
);
const CardContent = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardContent)
);
const CardDescription = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardDescription)
);
const CardHeader = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardHeader)
);
const CardTitle = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardTitle)
);

// Dynamically import the Dialog components
const Dialog = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.Dialog)
);
const DialogContent = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogContent)
);
const DialogDescription = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogDescription)
);
const DialogFooter = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogFooter)
);
const DialogHeader = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogHeader)
);
const DialogTitle = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogTitle)
);
const DialogTrigger = dynamic(() =>
  import("@/components/ui/dialog").then((mod) => mod.DialogTrigger)
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);

export default function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", resolvedParams.id],
    queryFn: async () => {
      try {
        const data = await eventService.getEventById(
          parseInt(resolvedParams.id)
        );
        return data;
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event details. Please try again later.");
        throw error;
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await eventService.deleteEvent(parseInt(resolvedParams.id));
    },
    onSuccess: () => {
      toast.success("Event deleted successfully.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Failed to delete event. Please try again later.");
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
            Failed to load event details. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-gray-600">
            The requested event could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="space-x-4">
          <Link href={`/events/${event.id}/edit`}>
            <Button>Edit Event</Button>
          </Link>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete Event</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Event</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this event? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    deleteMutation.mutate();
                    setShowDeleteDialog(false);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>{event.location}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-600">{event.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Date & Time</h2>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Start:</span>{" "}
                {new Date(event.startDate).toLocaleString()}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">End:</span>{" "}
                {new Date(event.endDate).toLocaleString()}
              </p>
            </div>
          </div>

          {event.weatherData && (
            <div>
              <h2 className="text-lg font-semibold mb-2">
                Weather Information
              </h2>
              <p className="text-gray-600">{event.weatherData}</p>
            </div>
          )}

          <div className="pt-4">
            <Link href="/">
              <Button variant="outline">← Back to Events</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
