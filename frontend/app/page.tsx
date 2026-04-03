"use client"

import Login from "@/components/user/login/Login"
import { Suspense } from "react"

export default function Page() {
  return (
    <div className="grid min-h-svh place-items-center p-6">
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    </div>
  )
}
