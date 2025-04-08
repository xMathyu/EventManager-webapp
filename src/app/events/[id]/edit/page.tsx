"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { eventService } from "@/services/eventService";
import { use } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LocationAutocomplete } from "@/components/location-autocomplete";
import { CalendarDays, Clock, FileText, Type } from "lucide-react";

// Dynamically import the Card components
const Card = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.Card)
);
const CardContent = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardContent)
);
const CardHeader = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardHeader)
);
const CardTitle = dynamic(() =>
  import("@/components/ui/card").then((mod) => mod.CardTitle)
);

// Dynamically import the Input components
const Input = dynamic(() =>
  import("@/components/ui/input").then((mod) => mod.Input)
);
const Textarea = dynamic(() =>
  import("@/components/ui/textarea").then((mod) => mod.Textarea)
);

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-sm text-gray-500">Loading event details...</p>
    </div>
  </div>
);

export default function EventForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const isEdit = resolvedParams.id !== "new";
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", resolvedParams.id],
    queryFn: async () => {
      try {
        const data = await eventService.getEventById(
          parseInt(resolvedParams.id)
        );
        return data;
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event. Please try again later.");
        throw error;
      }
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        startDate: event.startDate.slice(0, 16),
        endDate: event.endDate.slice(0, 16),
      });
    }
  }, [event]);

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await eventService.createEvent(data);
    },
    onSuccess: () => {
      toast.success("Event created successfully.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to create event. Please try again later.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await eventService.updateEvent(parseInt(resolvedParams.id), data);
    },
    onSuccess: () => {
      toast.success("Event updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", resolvedParams.id] });
      router.push("/");
    },
    onError: () => {
      toast.error("Failed to update event. Please try again later.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (isEdit && isLoadingEvent) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1 border-b bg-gray-50/50 dark:bg-gray-900/50">
            <CardTitle className="text-2xl font-bold text-center">
              {isEdit ? "Edit Event" : "Create New Event"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Type className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="title" className="font-medium">
                    Title
                  </Label>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full"
                  placeholder="Enter event title"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <Label htmlFor="description" className="font-medium">
                    Description
                  </Label>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full resize-none"
                  placeholder="Enter event description"
                />
              </div>

              <LocationAutocomplete
                value={formData.location}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, location: value }))
                }
                label="Location"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="startDate" className="font-medium">
                      Start Date & Time
                    </Label>
                  </div>
                  <Input
                    type="datetime-local"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Label htmlFor="endDate" className="font-medium">
                      End Date & Time
                    </Label>
                  </div>
                  <Input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-32"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="w-32"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : isEdit ? (
                    "Update Event"
                  ) : (
                    "Create Event"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
