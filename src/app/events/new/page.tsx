"use client";

import EventForm from "../[id]/edit/page";

export default function NewEvent() {
  const paramsPromise = Promise.resolve({ id: "new" });
  return <EventForm params={paramsPromise} />;
}
