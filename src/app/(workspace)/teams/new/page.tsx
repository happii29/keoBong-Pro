import { appConfig } from "@/config/app";
import { requireAuthenticatedUser } from "@/modules/auth/guards";
import { CreateTeamForm } from "@/modules/teams/components/create-team-form";
import { JoinTeamForm } from "@/modules/teams/components/join-team-form";

export const dynamic = "force-dynamic";

export default async function NewTeamPage() {
  await requireAuthenticatedUser("/teams/new");

  return (
    <main className="luxury-shell-bg min-h-svh px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-5xl items-center">
        <div className="w-full space-y-5">
          <div>
            <p className="premium-kicker">{appConfig.name}</p>
            <h1 className="mt-3 font-display text-3xl font-semibold sm:text-4xl">
              Vào đội bóng của bạn
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Nếu đội đã tồn tại, nhập slug đội để tham gia. Nếu bạn là captain
              lập đội mới, tạo workspace mới cho đội của mình.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <JoinTeamForm />
            <CreateTeamForm />
          </div>
        </div>
      </div>
    </main>
  );
}
