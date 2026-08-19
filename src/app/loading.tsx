import { SoccerLoader } from "@/components/ui/soccer-loader";

export default function AppLoading() {
  return (
    <main className="luxury-shell-bg grid min-h-svh place-items-center px-4">
      <div className="premium-card flex items-center gap-3 px-5 py-4 text-sm font-semibold">
        <SoccerLoader />
        Dang tai...
      </div>
    </main>
  );
}
