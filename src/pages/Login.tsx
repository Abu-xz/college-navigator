import { useBlockNavigationStore } from "@/store/useBlockNavigationStore";
import { useNavigationStore } from "@/store/useNavigationStore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Map, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useNavigate();
  const adminModeToggle = useNavigationStore().toggleAdminMode;
  const blockAdminModeToggle = useBlockNavigationStore().toggleAdminMode;

  const handleAdminToggle = () => {
    adminModeToggle();
    blockAdminModeToggle();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      return setError("All fields are required");
    }

    if (email === "admin@gmail.com" && password === "admin@123") {
      handleAdminToggle();
      router("/");
    } else {
      setError("Invalid admin credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Card */}
      <div className="w-full max-w-md bg-card/80 backdrop-blur-md border border-border rounded-xl shadow-xl p-8">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-3">
            <Map className="h-6 w-6 text-primary-foreground" />
          </div>

          <h2 className="text-2xl font-bold">Admin Login</h2>
          <p className="text-sm text-muted-foreground">
            CampusNav Control Panel
          </p>
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input
              type="email"
              placeholder="admin@campus.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-muted-foreground">Password</label>
            <div className="relative mt-1">
              <Input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-muted-foreground"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4" />
            {loading ? "Signing in..." : "Login as Admin"}
          </Button>
        </form>
      </div>
    </div>
  );
}
