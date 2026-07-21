export default function DeliveryLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4">
      <div className="mx-auto max-w-6xl animate-pulse space-y-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8">
          <div className="h-8 w-1/4 rounded-full bg-slate-200" />
          <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-200" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-slate-200" />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="h-10 w-3/4 rounded-full bg-slate-200" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="h-24 rounded-[1.5rem] bg-slate-200" />
              <div className="h-24 rounded-[1.5rem] bg-slate-200" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="h-10 w-1/2 rounded-full bg-slate-200" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="h-24 rounded-[1.5rem] bg-slate-200" />
              <div className="h-24 rounded-[1.5rem] bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
