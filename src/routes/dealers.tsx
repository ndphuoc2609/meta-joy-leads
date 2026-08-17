import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, Download, Play, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEALERS,
  OUTCOME_LABEL,
  buildDealerLeads,
  formatDateTime,
  formatDuration,
  maskPhoneTail,
  type DealerLead,
} from "@/lib/leads-data";

export const Route = createFileRoute("/dealers")({
  head: () => ({
    meta: [
      { title: "Danh sách lead theo đại lý · Hyundai Lead Operations" },
      {
        name: "description",
        content:
          "Xem toàn bộ đại lý Hyundai và danh sách lead đã phân bổ: số điện thoại ẩn, ngày xác nhận và file ghi âm cuộc gọi.",
      },
      { property: "og:title", content: "Danh sách lead theo đại lý · Hyundai" },
      {
        property: "og:description",
        content: "Bộ lọc đại lý và danh sách lead kèm ngày xác nhận, file ghi âm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DealersPage,
});

function DealersPage() {
  const [data, setData] = useState<DealerLead[]>([]);
  const [dealerQuery, setDealerQuery] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [active, setActive] = useState<string>(DEALERS[0] as string);

  useEffect(() => setData(buildDealerLeads(Date.now())), []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of DEALERS) m.set(d, 0);
    for (const l of data) m.set(l.dealer, (m.get(l.dealer) ?? 0) + 1);
    return m;
  }, [data]);

  const dealers = DEALERS.filter((d) =>
    d.toLowerCase().includes(dealerQuery.trim().toLowerCase()),
  );

  const rows = data
    .filter((l) => l.dealer === active)
    .filter((l) => {
      const q = leadQuery.trim().toLowerCase();
      if (!q) return true;
      return l.name.toLowerCase().includes(q) || l.phone.includes(q) || l.model.toLowerCase().includes(q);
    });

  return (
    <main className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-5">
      <header className="mb-4 flex min-w-0 items-center gap-3">
        <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
          <Link to="/">
            <ArrowLeft className="size-3.5" />
            Quay lại
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="truncate text-[17px] font-semibold tracking-tight">
            Lead theo đại lý
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {data.length} lead đã phân bổ · {DEALERS.length} đại lý
          </p>
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-[268px_minmax(0,1fr)]">
        {/* Left: dealer tabs + filter */}
        <aside className="card-surface flex flex-col p-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={dealerQuery}
              onChange={(e) => setDealerQuery(e.target.value)}
              placeholder="Lọc đại lý..."
              className="h-8 pl-8 text-[13px]"
            />
          </div>
          <nav className="mt-2 flex gap-1.5 overflow-x-auto pb-1 lg:max-h-[70vh] lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:pb-0">
            {dealers.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setActive(d)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left text-[13px] transition-colors lg:w-full",
                  active === d
                    ? "border-border bg-primary/10 font-semibold text-primary"
                    : "hover:bg-accent/60",
                )}
              >
                <Building2 className="size-3.5 shrink-0 opacity-70" />
                <span className="truncate">{d}</span>
                <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
                  {counts.get(d) ?? 0}
                </span>
              </button>
            ))}
            {dealers.length === 0 ? (
              <p className="px-1 py-3 text-xs text-muted-foreground">Không tìm thấy đại lý.</p>
            ) : null}
          </nav>
        </aside>

        {/* Right: leads table */}
        <section className="card-surface min-w-0 p-3">
          <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-semibold tracking-tight">{active}</h2>
              <p className="truncate text-[11px] text-muted-foreground">
                {rows.length} lead · số điện thoại đã được ẩn
              </p>
            </div>
            <div className="relative w-[190px] sm:w-[240px]">
              <Search className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={leadQuery}
                onChange={(e) => setLeadQuery(e.target.value)}
                placeholder="Tìm lead..."
                className="h-8 pl-8 text-[13px]"
              />
            </div>
          </header>

          <div className="mt-3 -mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[720px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-border text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                  <th className="w-12 py-2 pr-2 font-medium">STT</th>
                  <th className="py-2 pr-2 font-medium">Tên khách hàng</th>
                  <th className="py-2 pr-2 font-medium">Số điện thoại</th>
                  <th className="py-2 pr-2 font-medium">Ngày xác nhận</th>
                  <th className="py-2 pr-2 font-medium">File ghi âm</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((l, i) => (
                  <tr key={l.id} className="border-b border-border/70 transition-colors hover:bg-accent/50">
                    <td className="py-2.5 pr-2 tabular-nums text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 pr-2">
                      <p className="truncate font-medium">{l.name}</p>
                      <p className="truncate text-[11px] text-muted-foreground">
                        {l.model} · {l.outcome ? OUTCOME_LABEL[l.outcome] : ""}
                      </p>
                    </td>
                    <td className="py-2.5 pr-2 tabular-nums">{maskPhoneTail(l.phone)}</td>
                    <td className="py-2.5 pr-2 whitespace-nowrap text-muted-foreground">
                      {formatDateTime(l.assignedAt)}
                    </td>
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                          aria-label={`Phát ghi âm ${l.name}`}
                        >
                          <Play className="size-3" />
                        </button>
                        <span className="hidden h-1 w-24 overflow-hidden rounded-full bg-muted sm:block">
                          <span className="block h-full w-1/3 rounded-full bg-primary/50" />
                        </span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {formatDuration(l.recordingSeconds)}
                        </span>
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                          aria-label={`Tải ghi âm ${l.name}`}
                        >
                          <Download className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                      Chưa có lead nào cho đại lý này.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
