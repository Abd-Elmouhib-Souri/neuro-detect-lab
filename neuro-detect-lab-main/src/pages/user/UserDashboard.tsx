import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Calendar, ChevronRight, Loader2, ArrowLeft } from "lucide-react";
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
}

const severityStyles: Record<string, string> = {
  "Non Demented": "bg-green-100 text-green-700",
  "Very Mild Demented": "bg-yellow-100 text-yellow-700",
  "Mild Demented": "bg-orange-100 text-orange-700",
  "Moderate Demented": "bg-red-100 text-red-700",
};

const UserHistory = () => {
  const { user } = useAuth();
  const [selected, setSelected] = useState<ScanRecord | null>(null);

  const { data: scans = [], isLoading, error } = useQuery({
    queryKey: ["history", user?.token],
    queryFn: () => getHistory(user!.token),
    enabled: !!user?.token,
  });

  if (error) {
    toast.error("Failed to load scan history");
  }

  if (selected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <button
          onClick={() => setSelected(null)}
          className="mb-6 flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          Back to History
        </button>

        <div className="rounded-2xl border bg-card p-6 shadow-lg">
          <PredictionResult
            data={{
              prediction: selected.prediction,
              probabilities: selected.probabilities,
              heatmap_url: selected.heatmap_url,
            }}
          />

          {selected.explanation && (
            <div className="mt-4 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">Explanation</p>
              {selected.explanation}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold text-foreground">
          Scan History
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review all your previous MRI scan results and predictions.
        </p>
      </motion.div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : scans.length === 0 ? (
        <div className="text-center py-12 border rounded-xl bg-muted/20">
          <p className="text-muted-foreground">No scan history available.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {scans.map((scan: ScanRecord, i: number) => {
            const date = new Date(
              scan.date || scan.createdAt || ""
            ).toLocaleDateString();

            return (
              <motion.button
                key={scan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(scan)}
                className="group w-full flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 text-left"
              >
                <div className="flex items-center gap-4">
                  {/* Severity badge */}
                  <div
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      severityStyles[scan.prediction] ?? "bg-muted text-muted-foreground"
                    }`}
                  >
                    {scan.prediction}
                  </div>

                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      MRI Scan Result
                    </p>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {date}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserHistory;