"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventService } from "@/services/eventService";
import { use } from "react";
import { Button } from "@/components/ui/button";
import dynamic from "next/dynamic";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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

  const { isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", resolvedParams.id],
    queryFn: async () => {
      try {
        const data = await eventService.getEventById(
          parseInt(resolvedParams.id)
        );
        setFormData({
          title: data.title,
          description: data.description,
          location: data.location,
          startDate: data.startDate.slice(0, 16),
          endDate: data.endDate.slice(0, 16),
        });
        return data;
      } catch (error) {
        console.error("Error loading event:", error);
        toast.error("Failed to load event. Please try again later.");
        throw error;
      }
    },
    enabled: isEdit,
  });

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
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Event" : "Create New Event"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date & Time</Label>
              <Input
                type="datetime-local"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date & Time</Label>
              <Input
                type="datetime-local"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
