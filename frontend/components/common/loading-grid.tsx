export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="h-[420px] rounded-[2rem] skeleton" />
      ))}
    </div>
  );
}

export function LoadingPanel() {
  return <div className="h-80 rounded-[2.5rem] skeleton" />;
}
