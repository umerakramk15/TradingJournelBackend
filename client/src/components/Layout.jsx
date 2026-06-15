import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  BarChart2,
  Landmark,
  ScrollText,
  CheckSquare,
  Settings,
  Sun,
  Moon,
  Menu,
  LogOut,
  Wallet,
} from "lucide-react";

const sidebarLinks = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/add-trade", label: "Add Trade", icon: PlusCircle },
  { to: "/history", label: "Trade History", icon: History },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/funding-accounts", label: "Funding", icon: Landmark },
  { to: "/rules", label: "Rules", icon: ScrollText },
  { to: "/checklist", label: "Checklist", icon: CheckSquare },
  { to: "/settings", label: "Settings", icon: Settings },
];

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--bg-tertiary)",
        color: "var(--text-secondary)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
      }}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen bg-grid flex"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              zIndex: 20,
            }}
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border)",
        }}
        className={`
  fixed inset-y-0 left-0 z-30
  w-64 backdrop-blur-xl
  transform transition-transform duration-300 ease-in-out
  ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  flex flex-col shadow-2xl
`}
      >
        {/* Logo */}
        <div
          style={{
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, var(--accent-bg), transparent)",
              pointerEvents: "none",
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              position: "relative",
            }}
          >
            <div
              style={{
                width: "38px",
                height: "38px",
                background:
                  "linear-gradient(135deg, var(--accent-dark), var(--accent))",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "16px",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              XJ
            </div>
            <div>
              <div
                style={{
                  color: "var(--text-primary)",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  letterSpacing: "-0.01em",
                }}
              >
                XAU Journal
              </div>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.7rem",
                  marginTop: "1px",
                }}
              >
                {user?.name || "Trader"}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Nav Links */}
        <nav
          style={{
            flex: 1,
            padding: "0.75rem",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
        >
          {sidebarLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.to}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <NavLink
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? "active" : ""}`
                  }
                >
                  <Icon size={17} strokeWidth={1.75} />
                  <span>{link.label}</span>
                </NavLink>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div
          style={{
            padding: "0.75rem",
            borderTop: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <div className="glass-card" style={{ padding: "0.875rem 1rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginBottom: "4px",
              }}
            >
              <Wallet size={12} style={{ color: "var(--text-muted)" }} />
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Balance
              </div>
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontWeight: 600,
                fontSize: "1rem",
                color: "var(--text-primary)",
              }}
            >
              ${user?.accountBalance?.toLocaleString() || "10,000"}
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="btn-secondary w-full"
            style={{
              fontSize: "0.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
            }}
          >
            <LogOut size={14} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen lg:pl-64">
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            background: "var(--bg-secondary)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
            padding: "0 1.5rem",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: scrolled ? "0 4px 24px rgba(0,0,0,0.1)" : "none",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden"
            style={{
              color: "var(--text-muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
            }}
          >
            <Menu size={20} />
          </button>

          <span
            className="hidden sm:block"
            style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ThemeToggle />
            <div
              style={{
                width: "30px",
                height: "30px",
                background:
                  "linear-gradient(135deg, var(--accent-dark), var(--accent))",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "12px",
                color: "#FFFFFF",
              }}
            >
              {user?.name?.charAt(0)?.toUpperCase() || "T"}
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: "1.5rem 2rem", overflowY: "auto" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
