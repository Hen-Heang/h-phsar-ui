import React from 'react'

export default function SkeletonCard() {
  const cardsData = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
  
  return (
    <div className="w-full grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-5">
      {cardsData.map((card) => (
        <div
          key={card.id}
          className="relative flex flex-col overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white p-5 animate-pulse dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="aspect-square w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
          <div className="mt-6 flex flex-col items-center">
            <div className="h-4 w-3/4 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-3 h-6 w-1/2 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-4 h-3 w-1/3 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="mt-8 h-12 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
