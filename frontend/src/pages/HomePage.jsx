export const HomePage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-border bg-card p-8 text-center sm:p-16 transition-colors shadow-sm">
        <span className="inline-block rounded-full bg-[#ff5757]/10 px-3 py-1 text-xs font-semibold text-[#ff6161] border border-[#ff6161]/20 mb-4">
          Phase 1 Initialized
        </span>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Welcome to MovieBox
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto mb-8">
          Your personal portal for exploring trending films, discovery by genre, searching
          and curating your watchlist.
        </p>
      </div>
    </div>
  );
};
