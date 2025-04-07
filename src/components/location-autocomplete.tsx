"use client";

import { useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NOMINATIM_API_URL = process.env.NEXT_PUBLIC_NOMINATIM_API_URL;

if (!NOMINATIM_API_URL) {
  throw new Error("NOMINATIM_API_URL environment variable is not defined");
}

interface Location {
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  label = "Location",
}: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const fetchLocations = async (query: string) => {
      if (!query.trim()) {
        setLocations([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(
            query
          )}&limit=5`
        );
        const data = await response.json();
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchLocations(value);
    }, 300);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [value]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white dark:bg-gray-950 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
              <span className="truncate">{value || "Select location..."}</span>
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 shadow-lg">
          <Command className="rounded-lg border border-gray-200">
            <div className="flex items-center border-b px-3 gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-gray-500" />
              <CommandInput
                placeholder="Search location..."
                value={value}
                onValueChange={onChange}
                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <CommandEmpty className="py-6 text-center text-sm">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Searching locations...</span>
                </div>
              ) : (
                <div className="text-gray-500">No location found.</div>
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-[300px] overflow-auto p-1">
              {locations.map((location) => (
                <CommandItem
                  key={`${location.lat},${location.lon}`}
                  value={location.display_name}
                  onSelect={() => {
                    onChange(location.display_name);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === location.display_name
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {location.display_name.split(",")[0]}
                    </span>
                    <span className="text-xs text-gray-500">
                      {location.display_name
                        .split(",")
                        .slice(1)
                        .join(",")
                        .trim()}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
