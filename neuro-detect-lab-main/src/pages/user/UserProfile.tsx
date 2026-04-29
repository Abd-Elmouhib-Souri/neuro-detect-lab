import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");

  const handleSave = () => {
    toast.success("Profile updated successfully.");
  };

  return (
    <div className="p-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account settings.</p>
      </motion.div>

      <div className="max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-foreground">Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} className="rounded-xl gradient-medical text-primary-foreground">Save Changes</Button>
          <Button variant="outline" onClick={logout} className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10">Logout</Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
