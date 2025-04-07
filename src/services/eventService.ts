import { Event, PaginatedResponse } from "@/types/event";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL environment variable is not defined"
  );
}

export const eventService = {
  async getAllEvents(page = 0, size = 10): Promise<PaginatedResponse<Event>> {
    const response = await fetch(
      `${API_BASE_URL}/events?page=${page}&size=${size}&sortBy=startDate&direction=desc`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch events");
    }
    return response.json();
  },

  async searchEvents(params: {
    title?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Event>> {
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.append("title", params.title);
    if (params.location) queryParams.append("location", params.location);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);
    if (params.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params.size !== undefined)
      queryParams.append("size", params.size.toString());

    const response = await fetch(
      `${API_BASE_URL}/events/search?${queryParams}`
    );
    if (!response.ok) {
      throw new Error("Failed to search events");
    }
    return response.json();
  },

  async getEventById(id: number): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }
    return response.json();
  },

  async createEvent(
    event: Omit<Event, "id" | "weatherData" | "createdAt" | "updatedAt">
  ): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error("Failed to create event");
    }
    return response.json();
  },

  async updateEvent(
    id: number,
    event: Omit<Event, "id" | "weatherData" | "createdAt" | "updatedAt">
  ): Promise<Event> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    });
    if (!response.ok) {
      throw new Error("Failed to update event");
    }
    return response.json();
  },

  async deleteEvent(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/events/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new Error("Failed to delete event");
    }
  },
};
