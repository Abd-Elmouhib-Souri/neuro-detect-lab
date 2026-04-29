import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BookHeart,
  Brain,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Moon,
  NotebookPen,
  ShieldAlert,
  Smile,
  TimerReset,
  TriangleAlert,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { createPatientJournalEntry, getHistory, getPatientJournalEntries, type JournalEntry } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import EmptyState from "@/components/ui/empty-state";

type JournalLevel = "Faible" | "Modere" | "Eleve";
type SleepLevel = "Bon" | "Irregulier" | "Perturbe";
type MoodLevel = "Stable" | "Stress" | "Triste" | "Irritable";
type ConfusionLevel = "Aucune" | "Legere" | "Moderee" | "Frequente";
type AutonomyLevel = "Bonne" | "Moyenne" | "Faible";

type CognitiveJournalEntry = JournalEntry;

interface ScanRecord {
  id: string;
  date: string;
  createdAt?: string;
  prediction: string;
}

const fieldTone = {
  calm: "border-severity-healthy/30 bg-severity-healthy/10 text-severity-healthy",
  watch: "border-severity-mild/30 bg-severity-mild/10 text-severity-mild",
  alert: "border-severity-severe/30 bg-severity-severe/10 text-severity-severe",
};

const entrySeverity = (entry: CognitiveJournalEntry) => {
  let score = 0;
  if (entry.memory === "Eleve") score += 2;
  else if (entry.memory === "Modere") score += 1;
  if (entry.forgetfulness === "Eleve") score += 2;
  else if (entry.forgetfulness === "Modere") score += 1;
  if (entry.sleep === "Perturbe") score += 1;
  if (entry.confusion === "Moderee") score += 1;
  if (entry.confusion === "Frequente") score += 2;
  if (entry.autonomy === "Faible") score += 2;
  else if (entry.autonomy === "Moyenne") score += 1;
  if (entry.mood === "Triste" || entry.mood === "Irritable") score += 1;

  if (score >= 6) {
    return {
      label: "A surveiller",
      tone: fieldTone.alert,
      icon: <ShieldAlert className="h-4 w-4" />,
      summary: "Plusieurs signes meritent un suivi rapproche avec la famille ou le medecin.",
    };
  }
  if (score >= 3) {
    return {
      label: "Vigilance",
      tone: fieldTone.watch,
      icon: <TriangleAlert className="h-4 w-4" />,
      summary: "Quelques changements sont notes. Continuez le suivi quotidien.",
    };
  }
  return {
    label: "Stable",
    tone: fieldTone.calm,
    icon: <CheckCircle2 className="h-4 w-4" />,
    summary: "Le journal du jour reste plutot rassurant dans l'ensemble.",
  };
};

const UserJournal = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [entries, setEntries] = useState<CognitiveJournalEntry[]>([]);
  const [form, setForm] = useState({
    memory: "Faible" as JournalLevel,
    sleep: "Bon" as SleepLevel,
    mood: "Stable" as MoodLevel,
    confusion: "Aucune" as ConfusionLevel,
    autonomy: "Bonne" as AutonomyLevel,
    forgetfulness: "Faible" as JournalLevel,
    note: "",
  });

  const journalQueryKey = useMemo(() => ["patient-journal", user?.token], [user?.token]);

  const { data: scans = [], isLoading, error } = useQuery({
    queryKey: ["history", user?.token],
    queryFn: () => getHistory(user?.token || ""),
    enabled: !!user?.token,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: true,
  });

  const { data: journalData } = useQuery({
    queryKey: journalQueryKey,
    queryFn: () => getPatientJournalEntries(user?.token || ""),
    enabled: !!user?.token,
  });

  const createJournalEntryMutation = useMutation({
    mutationFn: (payload: Omit<JournalEntry, "id" | "createdAt">) =>
      createPatientJournalEntry(payload, user?.token || ""),
    onSuccess: async (data) => {
      setEntries(data.entries as CognitiveJournalEntry[]);
      await queryClient.invalidateQueries({ queryKey: journalQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["patient-journal-preview", user?.token] });
      setForm({
        memory: "Faible",
        sleep: "Bon",
        mood: "Stable",
        confusion: "Aucune",
        autonomy: "Bonne",
        forgetfulness: "Faible",
        note: "",
      });
      toast.success("Journal cognitif enregistre");
    },
  });

  useEffect(() => {
    if (journalData?.entries) {
      setEntries(journalData.entries as CognitiveJournalEntry[]);
    }
  }, [journalData]);

  if (error) {
    toast.error("Impossible de charger le contexte du dernier scan");
  }

  const typedScans = scans as ScanRecord[];
  const sortedScans = [...typedScans].sort(
    (a, b) => new Date(b.date || b.createdAt || "").getTime() - new Date(a.date || a.createdAt || "").getTime()
  );
  const lastScan = sortedScans[0] ?? null;
  const latestEntry = entries[0] ?? null;
  const latestStatus = latestEntry ? entrySeverity(latestEntry) : null;

  const last7Days = useMemo(() => {
    const now = Date.now();
    return entries.filter((entry) => now - new Date(entry.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000);
  }, [entries]);

  const trendSummary = useMemo(() => {
    if (last7Days.length === 0) {
      return "Aucune tendance disponible pour le moment. Ajoutez quelques jours de suivi pour voir l'evolution.";
    }

    const alerts = last7Days.filter((entry) => entrySeverity(entry).label === "A surveiller").length;
    const averageForgetfulness =
      last7Days.filter((entry) => entry.forgetfulness === "Eleve" || entry.forgetfulness === "Modere").length;
    const sleepIssues = last7Days.filter((entry) => entry.sleep !== "Bon").length;

    if (alerts >= 3) {
      return "Plusieurs journees recentes montrent des signes a surveiller. Un partage avec le medecin peut etre utile.";
    }
    if (averageForgetfulness >= 3) {
      return "Les oublis sont plus frequents cette semaine. Continuez le journal pour confirmer la tendance.";
    }
    if (sleepIssues >= 3) {
      return "Le sommeil semble perturbe sur plusieurs jours, ce qui peut influencer la memoire et l'humeur.";
    }
    return "La tendance recente reste globalement stable avec quelques variations normales d'un jour a l'autre.";
  }, [last7Days]);

  const stats = [
    {
      label: "Entrees enregistrees",
      value: entries.length,
      hint: "Historique en base du patient",
      icon: <BookHeart className="h-5 w-5 text-primary" />,
    },
    {
      label: "Dernier scan lie",
      value: lastScan?.prediction ?? "Aucun scan",
      hint: lastScan ? "Contexte clinique utilise pour le journal" : "Le journal fonctionne aussi sans scan recent",
      icon: <Brain className="h-5 w-5 text-primary" />,
    },
    {
      label: "Suivi 7 jours",
      value: last7Days.length,
      hint: "Nombre d'entrees recentes",
      icon: <CalendarDays className="h-5 w-5 text-primary" />,
    },
  ];

  const saveEntry = () => {
    const entry: Omit<JournalEntry, "id" | "createdAt"> = {
      scanPrediction: lastScan?.prediction ?? "Aucun scan",
      memory: form.memory,
      sleep: form.sleep,
      mood: form.mood,
      confusion: form.confusion,
      autonomy: form.autonomy,
      forgetfulness: form.forgetfulness,
      fatigue: "Faible",
      riskLevel: "Medium",
      note: form.note.trim(),
    };
    createJournalEntryMutation.mutate(entry);
  };

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,transparent_0%,rgba(255,255,255,0.42)_100%)] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border/70 bg-card/85 p-6 shadow-card backdrop-blur-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Module patient</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Journal cognitif quotidien</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                Suivez chaque jour la memoire, le sommeil, l'humeur, la confusion, l'autonomie et les oublis pour
                completer les resultats IRM avec l'evolution du quotidien.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-primary">
              {lastScan ? `Dernier scan: ${lastScan.prediction}` : "Aucun scan recent lie au journal"}
            </div>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-card"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                {stat.icon}
              </div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="mt-2 text-lg font-bold text-foreground">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.hint}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-card"
          >
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">Entrer l'etat du jour</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Un formulaire simple pour documenter la journee du patient et garder une trace reguliere.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><Brain className="h-4 w-4 text-primary" /> Memoire</span>
                <select
                  value={form.memory}
                  onChange={(e) => setForm((current) => ({ ...current, memory: e.target.value as JournalLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Faible</option>
                  <option>Modere</option>
                  <option>Eleve</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><Moon className="h-4 w-4 text-primary" /> Sommeil</span>
                <select
                  value={form.sleep}
                  onChange={(e) => setForm((current) => ({ ...current, sleep: e.target.value as SleepLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Bon</option>
                  <option>Irregulier</option>
                  <option>Perturbe</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><Smile className="h-4 w-4 text-primary" /> Humeur</span>
                <select
                  value={form.mood}
                  onChange={(e) => setForm((current) => ({ ...current, mood: e.target.value as MoodLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Stable</option>
                  <option>Stress</option>
                  <option>Triste</option>
                  <option>Irritable</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><TriangleAlert className="h-4 w-4 text-primary" /> Confusion</span>
                <select
                  value={form.confusion}
                  onChange={(e) => setForm((current) => ({ ...current, confusion: e.target.value as ConfusionLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Aucune</option>
                  <option>Legere</option>
                  <option>Moderee</option>
                  <option>Frequente</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><NotebookPen className="h-4 w-4 text-primary" /> Autonomie</span>
                <select
                  value={form.autonomy}
                  onChange={(e) => setForm((current) => ({ ...current, autonomy: e.target.value as AutonomyLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Bonne</option>
                  <option>Moyenne</option>
                  <option>Faible</option>
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="flex items-center gap-2 text-foreground"><TimerReset className="h-4 w-4 text-primary" /> Oublis</span>
                <select
                  value={form.forgetfulness}
                  onChange={(e) => setForm((current) => ({ ...current, forgetfulness: e.target.value as JournalLevel }))}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option>Faible</option>
                  <option>Modere</option>
                  <option>Eleve</option>
                </select>
              </label>
            </div>

            <label className="mt-4 block space-y-2 text-sm">
              <span className="text-foreground">Note libre</span>
              <Input
                value={form.note}
                onChange={(e) => setForm((current) => ({ ...current, note: e.target.value }))}
                placeholder="Exemple: oublis plus frequents le soir, humeur anxieuse, besoin d'aide pour les repas..."
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Button onClick={saveEntry} className="rounded-xl">
                Enregistrer l'entree du jour
              </Button>
              <p className="text-sm text-muted-foreground">
                Les entrees sont sauvegardees dans la base de donnees et reliees a ce patient.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-card"
          >
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold text-foreground">Lecture rapide</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Resume de la derniere entree et interpretation simple sur les 7 derniers jours.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : latestEntry && latestStatus ? (
              <div className="space-y-4">
                <div className={`rounded-2xl border p-4 ${latestStatus.tone}`}>
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {latestStatus.icon}
                    {latestStatus.label}
                  </div>
                  <p className="mt-2 text-sm leading-6">{latestStatus.summary}</p>
                </div>

                <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Tendance recente</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{trendSummary}</p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Derniere entree</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {new Date(latestEntry.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{latestEntry.scanPrediction}</p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Contexte scan</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {lastScan?.prediction ?? "Aucun scan recent"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Le journal reste utile meme entre deux analyses IRM.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Aucune entree pour le moment"
                description="Commence par enregistrer l'etat cognitif du jour pour faire apparaitre les tendances."
              />
            )}
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-border bg-card p-6 shadow-card"
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">Historique du journal</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Les 30 dernieres entrees pour suivre l'evolution du patient jour apres jour.
              </p>
            </div>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title="Pas encore d'historique"
              description="Chaque entree cree une trace utile pour le suivi quotidien de la memoire, du sommeil et de l'autonomie."
            />
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const status = entrySeverity(entry);

                return (
                  <div key={entry.id} className="rounded-2xl border border-border bg-background/70 p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Contexte du scan: {entry.scanPrediction}
                        </p>
                      </div>
                      <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`}>
                        {status.icon}
                        {status.label}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Memoire</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.memory}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Sommeil</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.sleep}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Humeur</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.mood}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Confusion</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.confusion}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Autonomie</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.autonomy}</p>
                      </div>
                      <div className="rounded-2xl bg-muted/40 p-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Oublis</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{entry.forgetfulness}</p>
                      </div>
                    </div>

                    {entry.note && <p className="mt-3 text-sm leading-6 text-foreground">{entry.note}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default UserJournal;
