export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-hell-void p-6 text-white">
      <div className="text-center">
        <div className="mx-auto mb-5 h-16 w-16 animate-spin rounded-full border-4 border-white/10 border-t-hell-red" />
        <h1 className="text-2xl font-black">در حال بارگذاری...</h1>
        <p className="mt-2 text-white/45">چند لحظه صبر کن.</p>
      </div>
    </main>
  );
}
