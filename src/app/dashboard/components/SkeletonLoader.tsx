'use client'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/5 rounded-2xl ${className}`} />
  )
}

export default function DashboardSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-4">
          <Skeleton className="w-48 h-12" />
          <Skeleton className="w-64 h-6" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <Skeleton className="w-12 h-12 rounded-2xl" />
        </div>
      </div>

      {/* Bento Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="h-64 rounded-[3rem] md:col-span-1" />
        <Skeleton className="h-64 rounded-[3rem] md:col-span-1" />
        <Skeleton className="h-64 rounded-[3rem] md:col-span-1" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex justify-center">
        <Skeleton className="w-80 h-16 rounded-[2rem]" />
      </div>

      {/* List Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Skeleton className="h-48 rounded-[2.5rem]" />
        <Skeleton className="h-48 rounded-[2.5rem]" />
        <Skeleton className="h-48 rounded-[2.5rem]" />
      </div>
    </div>
  )
}
