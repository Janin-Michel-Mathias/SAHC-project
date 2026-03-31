"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function Page() {
  const [text, setText] = useState("")
  async function fetchAdmin(): Promise<void> {
    const data = await fetch(process.env.NEXT_PUBLIC_API_URL + "admin")
    const text = await data.text();
    setText(text);
  }

  async function fetchBookings(): Promise<void> {
    const data = await fetch(process.env.NEXT_PUBLIC_API_URL + "bookings")
    const text = await data.text();
    setText(text);
  }

  async function fetchDashboard(): Promise<void> {
    const data = await fetch(process.env.NEXT_PUBLIC_API_URL + "statistics")
    const text = await data.text();
    setText(text);
  }

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <Button onClick={fetchAdmin}>Administration</Button>
        <Button onClick={fetchBookings}>Réservation</Button>
        <Button onClick={fetchDashboard}>Dashboard</Button>
      </div>
      <div>{text}</div>
    </div>
  )
}
