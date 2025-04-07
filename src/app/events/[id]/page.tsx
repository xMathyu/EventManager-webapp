"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Event } from "@/types/event";
import { eventService } from "@/services/eventService";
import { use } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EventDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const loadEvent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(parseInt(resolvedParams.id));
      setEvent(data);
    } catch (error) {
      setError("Failed to load event details. Please try again later.");
      console.error("Error loading event:", error);
      toast.error("Failed to load event details. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  const handleDelete = async () => {
    try {
      await eventService.deleteEvent(parseInt(resolvedParams.id));
      toast.success("Event deleted successfully.");
      window.location.href = "/";
    } catch (error) {
      setError("Failed to delete event. Please try again later.");
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event. Please try again later.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-500 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
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
                <Button variant="destructive" onClick={handleDelete}>
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
