"use client"

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 bg-accent rounded-full opacity-25 animate-pulse"></div>
        <div className="absolute inset-0 border-2 border-transparent border-t-accent border-r-accent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}
