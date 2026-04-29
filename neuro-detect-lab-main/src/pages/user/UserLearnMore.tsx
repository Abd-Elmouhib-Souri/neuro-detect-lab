import { motion } from "framer-motion";
import { ExternalLink, FlaskConical, Microscope } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { getLatestAlzheimerArticles, type ScientificArticle } from "@/lib/api";

const articleCardThemes = [
  { start: "#eff6ff", end: "#dbeafe", accent: "#2563eb", pill: "#bfdbfe" },
  { start: "#ecfdf5", end: "#d1fae5", accent: "#059669", pill: "#a7f3d0" },
  { start: "#fff7ed", end: "#ffedd5", accent: "#ea580c", pill: "#fed7aa" },
  { start: "#fef2f2", end: "#fee2e2", accent: "#dc2626", pill: "#fecaca" },
];

const createArticleImage = (title: string, index: number) => {
  const theme = articleCardThemes[index % articleCardThemes.length];
  const safeTitle = title
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .slice(0, 28);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="320" height="240" viewBox="0 0 320 240">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${theme.start}" />
          <stop offset="100%" stop-color="${theme.end}" />
        </linearGradient>
      </defs>
      <rect width="320" height="240" rx="28" fill="url(#g)" />
      <circle cx="248" cy="72" r="38" fill="${theme.pill}" />
      <circle cx="248" cy="72" r="18" fill="${theme.accent}" opacity="0.28" />
      <rect x="28" y="36" width="96" height="24" rx="12" fill="${theme.pill}" />
      <text x="42" y="52" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${theme.accent}">ALZHEIMER</text>
      <text x="28" y="120" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="${theme.accent}">Science</text>
      <text x="28" y="150" font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#0f172a">${safeTitle}</text>
      <rect x="28" y="184" width="150" height="12" rx="6" fill="${theme.pill}" />
      <rect x="28" y="204" width="110" height="12" rx="6" fill="${theme.pill}" opacity="0.8" />
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const FALLBACK_SCIENTIFIC_ARTICLES: ScientificArticle[] = [
  {
    id: "fallback-ui-1",
    title: "Nouvelles pistes pour mieux comprendre la progression d'Alzheimer",
    summary:
      "Resume rapide sur les biomarqueurs, l'imagerie cerebrale et les signes precoces utiles au suivi des patients.",
    journal: "Veille scientifique Alzheimer",
    publishedAt: "2026-04-01",
    articleUrl: "https://www.alzheimers.gov/",
    authors: ["Equipe de veille clinique"],
    source: "Fallback",
    imageUrl: createArticleImage("Progression Alzheimer", 0),
  },
  {
    id: "fallback-ui-2",
    title: "Memoire, sommeil et prevention: ce que montrent les etudes recentes",
    summary:
      "Une synthese utile pour les patients et les familles sur le sommeil, l'activite physique et la stimulation cognitive.",
    journal: "Revue prevention cognitive",
    publishedAt: "2026-03-15",
    articleUrl: "https://www.nia.nih.gov/health/alzheimers-and-dementia",
    authors: ["Cellule education patient"],
    source: "Fallback",
    imageUrl: createArticleImage("Sommeil et prevention", 1),
  },
  {
    id: "fallback-ui-3",
    title: "Imagerie IRM et suivi du declin cognitif: tendances actuelles",
    summary:
      "Point rapide sur les recherches recentes reliant les resultats d'IRM aux trajectoires cliniques de la maladie d'Alzheimer.",
    journal: "Observatoire neuro-imagerie",
    publishedAt: "2026-02-20",
    articleUrl: "https://www.alz.org/alzheimers-dementia/research_progress",
    authors: ["Equipe neuro-detect"],
    source: "Fallback",
    imageUrl: createArticleImage("IRM et suivi cognitif", 2),
  },
];

const accentBars = ["bg-primary", "bg-severity-healthy", "bg-severity-moderate", "bg-rose-400"];

const UserLearnMore = () => {
  const { user } = useAuth();
  const {
    data: articlesResponse,
    error: articlesError,
  } = useQuery({
    queryKey: ["alzheimer-science", user?.token],
    queryFn: () => getLatestAlzheimerArticles(user?.token || ""),
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });

  const scientificArticles =
    articlesResponse?.articles && articlesResponse.articles.length > 0
      ? articlesResponse.articles
      : FALLBACK_SCIENTIFIC_ARTICLES;

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#f3f8ff_45%,#eef6ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6 pb-10">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_26px_90px_rgba(37,99,235,0.10)]"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Articles scientifiques</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Nouveaux articles lies a Alzheimer
              </h1>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                Une veille recente pour aider le patient et la famille a mieux comprendre la maladie, la prevention et le suivi.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground">
              <FlaskConical className="h-4 w-4 text-primary" />
              {articlesResponse?.fallback || articlesError || !articlesResponse ? "Toujours disponible" : "Actualise via API"}
            </div>
          </div>
        </motion.section>

        <div className="space-y-4">
          {scientificArticles.map((article, index) => (
            <motion.a
              key={article.id}
              href={article.articleUrl}
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="group flex flex-col gap-5 rounded-[28px] border border-border/70 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_24px_55px_rgba(37,99,235,0.10)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 gap-4">
                <div className={`hidden w-1 rounded-full sm:block ${accentBars[index % accentBars.length]}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
                      <Microscope className="h-3.5 w-3.5" />
                      {article.source}
                    </span>
                    <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR")}</span>
                    <span>{article.journal}</span>
                  </div>

                  <p className="mt-4 text-xl font-bold leading-8 text-foreground transition-colors group-hover:text-primary">
                    {article.title}
                  </p>

                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    {article.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      {article.authors.length > 0 ? article.authors.join(", ") : "Auteurs non renseignes"}
                    </p>
                    <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-transform group-hover:-translate-y-0.5">
                      Learn more
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-28 w-full overflow-hidden rounded-[22px] border border-border/60 bg-muted sm:h-28 sm:w-44">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserLearnMore;
