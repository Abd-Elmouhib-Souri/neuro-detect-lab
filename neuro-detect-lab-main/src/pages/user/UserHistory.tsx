import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronRight,
  Loader2,
  ArrowLeft,
  Brain,
  ScanLine,
  Clock3,
  Sparkles,
  ShieldCheck,
  Activity,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getHistory } from "@/lib/api";
import PredictionResult from "@/components/PredictionResult";
import { toast } from "sonner";

interface ScanRecord {
  id: string;
  date: string;
  createdAt?: string;
  prediction: string;
  probabilities: Record<string, number>;
  heatmap_url: string;
  explanation: string;
  bestModel?: string | null;
  totalModels?: number;
  source?: string;
}

const severityStyles: Record<
  string,
  {
    dot: string;
    chip: string;
    icon: React.ReactNode;
    label: string;
  }
> = {
  "Non Demented": {
    dot: "bg-severity-healthy",
    chip: "bg-severity-healthy/10 text-severity-healthy border-severity-healthy/20",
    icon: <ShieldCheck className="h-4 w-4" />,
    label: "Stable",
  },
  "Very Mild Demented": {
    dot: "bg-severity-mild",
    chip: "bg-severity-mild/10 text-severity-mild border-severity-mild/20",
    icon: <Activity className="h-4 w-4" />,
    label: "Tres leger",
  },
  "Mild Demented": {
    dot: "bg-severity-moderate",
    chip: "bg-severity-moderate/10 text-severity-moderate border-severity-moderate/20",
    icon: <AlertTriangle className="h-4 w-4" />,
    label: "Leger",
  },
  "Moderate Demented": {
    dot: "bg-severity-severe",
    chip: "bg-severity-severe/10 text-severity-severe border-severity-severe/20",
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Modere",
  },
  "Severe Demented": {
    dot: "bg-severity-severe",
    chip: "bg-severity-severe/10 text-severity-severe border-severity-severe/20",
    icon: <AlertCircle className="h-4 w-4" />,
    label: "Severe",
  },
};

const getTopProbability = (probabilities?: Record<string, number>) => {
  if (!probabilities || Object.keys(probabilities).length === 0) return null;
  return Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0] ?? null;
};

const UserHistory = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  const { data: scans = [], isLoading, error } = useQuery({
    queryKey: ["history", user?.token],
    queryFn: () => getHistory(user?.token || ""),
    enabled: !!user?.token,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  if (error) {
    toast.error("Failed to load scan history");
  }

  const typedScans = scans as ScanRecord[];
  const latestScan = typedScans[0] ?? null;
  const latestTopProbability = getTopProbability(latestScan?.probabilities);

  const historyStats = useMemo(
    () => [
      {
        label: "Total scans",
        value: typedScans.length,
        icon: <ScanLine className="h-5 w-5 text-primary" />,
      },
      {
        label: "Dernier resultat",
        value: latestScan?.prediction ?? "Aucun",
        icon: <Brain className="h-5 w-5 text-primary" />,
      },
      {
        label: "Date recente",
        value: latestScan ? new Date(latestScan.date || latestScan.createdAt || "").toLocaleDateString("fr-FR") : "--",
        icon: <Calendar className="h-5 w-5 text-primary" />,
      },
    ],
    [latestScan, typedScans.length]
  );

  if (selected) {
    const selectedTopProbability = getTopProbability(selected.probabilities);
    const selectedCfg = severityStyles[selected.prediction] ?? severityStyles["Non Demented"];

    return (
      <div className="min-h-full bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.42)_100%)] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-5 pb-8">
          <button
            onClick={() => setSelected(null)}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/40"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour a l'historique
          </button>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Clock3 className="h-3.5 w-3.5" />
                  Scan du {new Date(selected.date || selected.createdAt || "").toLocaleDateString("fr-FR")}
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Detail du scan IRM</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Analyse detaillee du resultat selectionne avec prediction et probabilites.
                </p>
              </div>

              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${selectedCfg.chip}`}>
                {selectedCfg.icon}
                {selected.prediction}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Prediction dominante</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{selectedTopProbability?.[0] ?? selected.prediction}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Confiance principale</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {selectedTopProbability ? `${(selectedTopProbability[1] * 100).toFixed(1)}%` : "Indisponible"}
                </p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Modele retenu</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{selected.bestModel ?? "Analyse globale"}</p>
              </div>
            </div>
          </div>

          <PredictionResult
            data={{
              prediction: selected.prediction,
              probabilities: selected.probabilities,
              heatmap_url: selected.heatmap_url,
              explanation: selected.explanation,
              best_model: selected.bestModel ?? undefined,
              total_models: selected.totalModels,
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.42)_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-[28px] border border-border bg-card shadow-card"
        >
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_40%),linear-gradient(135deg,#f8fbff_0%,#ffffff_60%)] p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  Historique IRM patient
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground">Historique des scans</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Retrouvez toutes les analyses IRM effectuees, comparez les dates et ouvrez chaque examen pour
                  consulter le detail du resultat.
                </p>
              </div>

              {latestScan && (
                <div className="rounded-3xl border border-primary/15 bg-primary/5 p-4 lg:min-w-[280px]">
                  <p className="text-xs uppercase tracking-wide text-primary">Dernier scan</p>
                  <p className="mt-2 text-lg font-bold text-foreground">{latestScan.prediction}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(latestScan.date || latestScan.createdAt || "").toLocaleDateString("fr-FR")}
                  </p>
                  {latestTopProbability && (
                    <p className="mt-3 text-sm font-medium text-primary">
                      Score principal: {(latestTopProbability[1] * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {historyStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                {stat.icon}
              </div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-lg font-bold text-foreground">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center rounded-2xl border border-border bg-card py-16 shadow-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : typedScans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card/70 px-6 py-16 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Brain className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Aucun scan enregistre</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Votre historique apparaitra ici des qu'une nouvelle IRM sera analysee.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              {typedScans.map((scan, index) => {
                const cfg = severityStyles[scan.prediction] ?? severityStyles["Non Demented"];
                const topProbability = getTopProbability(scan.probabilities);

                return (
                  <motion.button
                    key={scan.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelected(scan)}
                    className="group w-full overflow-hidden rounded-3xl border border-border bg-card text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <div className="flex items-start gap-4 p-5">
                      <div className={`mt-1 h-3 w-3 shrink-0 rounded-full ${cfg.dot}`} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${cfg.chip}`}>
                              {cfg.icon}
                              {cfg.label}
                            </div>
                            <h3 className="mt-3 text-lg font-bold text-foreground">{scan.prediction}</h3>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {new Date(scan.date || scan.createdAt || "").toLocaleDateString("fr-FR")}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="h-3.5 w-3.5" />
                                {scan.source === "current" ? "Scan courant" : "Archive medicale"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs uppercase tracking-wide text-muted-foreground">Score principal</p>
                              <p className="mt-1 text-base font-bold text-foreground">
                                {topProbability ? `${(topProbability[1] * 100).toFixed(1)}%` : "--"}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-muted/40 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Prediction dominante</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">
                              {topProbability?.[0] ?? scan.prediction}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-muted/40 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Modele</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{scan.bestModel ?? "Analyse globale"}</p>
                          </div>
                          <div className="rounded-2xl bg-muted/40 p-3">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Modeles compares</p>
                            <p className="mt-1 text-sm font-semibold text-foreground">{scan.totalModels ?? 1}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Lecture rapide</p>
              <h2 className="mt-2 font-display text-xl font-bold text-foreground">Comprendre votre historique</h2>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">Ordre des scans</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Les examens sont affiches du plus recent au plus ancien pour suivre l'evolution dans le temps.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">Score principal</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Il correspond a la probabilite la plus forte observee dans l'analyse du scan selectionne.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-sm font-semibold text-foreground">Ouvrir un detail</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Cliquez sur une carte pour voir la prediction complete, les probabilites et les informations IA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserHistory;
