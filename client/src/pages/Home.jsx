import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useAuth } from "../context/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function Home() {
  const { user } = useAuth();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const features = [
    { icon: "◈", title: "Trade Analytics", description: "P&L curves, win rates, and drawdown charts — all in one view." },
    { icon: "◉", title: "Pre-Trade Checklist", description: "18-point ICT verification before every entry. No exceptions." },
    { icon: "◐", title: "Prop Firm Tracking", description: "Monitor challenge rules, daily limits, and account health." },
    { icon: "◑", title: "Performance Insights", description: "Identify your best sessions, worst habits, and hidden patterns." },
    { icon: "◎", title: "Risk Calculator", description: "Position sizing tied to your live balance and risk tolerance." },
    { icon: "◒", title: "Trade Journaling", description: "Log emotion, conviction, and outcome on every single trade." },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#080810", color: "#e8e8f0", fontFamily: "'Inter', sans-serif", overflowX: "hidden" }}>

      {/* ── Navbar ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 2rem", height: "60px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        background: "rgba(8,8,16,0.7)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "30px", height: "30px",
            background: "linear-gradient(135deg, #c9a84c, #f0d080)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: "14px", color: "#080810",
          }}>X</div>
          <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "0.01em", color: "#f0f0f8" }}>XAU Journal</span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {user ? (
            <Link to="/dashboard">
              <button style={styles.btnGold}>Dashboard →</button>
            </Link>
          ) : (
            <>
              <Link to="/login">
                <button style={styles.btnGhost}>Sign In</button>
              </Link>
              <Link to="/register">
                <button style={styles.btnGold}>Get Started</button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section ref={heroRef} style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>

        {/* Ambient orbs */}
        <div style={{ position: "absolute", top: "15%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", left: "10%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(100,80,200,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }} />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity, position: "relative", zIndex: 10, textAlign: "center", padding: "0 1.5rem", maxWidth: "800px" }}
        >
          {/* Eyebrow */}
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="visible"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "2rem" }}>
            <span style={styles.pill}>ICT · Smart Money · XAU/USD</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="visible"
            style={{ fontSize: "clamp(2.8rem, 7vw, 5.5rem)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 1.5rem", color: "#f0f0f8" }}>
            Trade with{" "}
            <span style={{ background: "linear-gradient(90deg, #c9a84c, #f0d080, #c9a84c)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", animation: "shimmer 3s linear infinite" }}>
              precision.
            </span>
            <br />Journal everything.
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="visible"
            style={{ fontSize: "1.15rem", color: "#8888a8", maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7 }}>
            A structured trading journal for XAU/USD traders. Pre-trade checklists, prop firm tracking, and analytics that hold you accountable.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="visible"
            style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {user ? (
              <Link to="/dashboard">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.btnGoldLg}>
                  Open Dashboard →
                </motion.button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.btnGoldLg}>
                    Start for free
                  </motion.button>
                </Link>
                <Link to="/login">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={styles.btnGhostLg}>
                    Sign in
                  </motion.button>
                </Link>
              </>
            )}
          </motion.div>

          {/* Stats row */}
          <motion.div variants={stagger} initial="hidden" animate="visible"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", marginTop: "5rem", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", overflow: "hidden", background: "rgba(255,255,255,0.07)" }}>
            {[
              { value: "18", label: "Checklist items" },
              { value: "2", label: "Trading models" },
              { value: "10", label: "Golden rules" },
              { value: "24/7", label: "Journal access" },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                style={{ padding: "1.5rem 1rem", background: "#0c0c18", textAlign: "center" }}>
                <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#c9a84c", letterSpacing: "-0.02em" }}>{s.value}</div>
                <div style={{ fontSize: "0.75rem", color: "#6666888", marginTop: "4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: "2rem", left: "50%", transform: "translateX(-50%)", color: "#444466", fontSize: "12px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          scroll
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "8rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ marginBottom: "4rem" }}>
          <p style={styles.sectionEyebrow}>Features</p>
          <h2 style={styles.sectionHeading}>Built for disciplined traders</h2>
          <p style={{ color: "#6666888", fontSize: "1.05rem", maxWidth: "480px", lineHeight: 1.7 }}>
            Every tool is designed around ICT concepts and prop firm compliance — not generic trading advice.
          </p>
        </motion.div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", overflow: "hidden" }}>
          {features.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              whileHover={{ background: "rgba(201,168,76,0.04)" }}
              style={{ padding: "2rem", background: "#0c0c18", transition: "background 0.25s", cursor: "default" }}>
              <div style={{ fontSize: "1.4rem", color: "#c9a84c", marginBottom: "1rem", fontFamily: "monospace" }}>{f.icon}</div>
              <h3 style={{ fontWeight: 600, fontSize: "1rem", color: "#e0e0f0", marginBottom: "0.5rem", letterSpacing: "0.01em" }}>{f.title}</h3>
              <p style={{ fontSize: "0.875rem", color: "#5a5a7a", lineHeight: 1.65 }}>{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: "4rem 1.5rem 8rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          style={{ marginBottom: "4rem" }}>
          <p style={styles.sectionEyebrow}>Process</p>
          <h2 style={styles.sectionHeading}>From setup to consistency</h2>
        </motion.div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {[
            { num: "01", title: "Create your account", body: "Set up your profile, risk parameters, and preferred trading sessions in under two minutes." },
            { num: "02", title: "Log every trade", body: "Run the pre-trade checklist, record your entry thesis, and capture your emotional state before and after." },
            { num: "03", title: "Review and adapt", body: "Weekly analytics surface your edge, your weaknesses, and whether you're following your own rules." },
          ].map((step, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }}
              style={{ display: "flex", gap: "2rem", padding: "2.5rem 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none", alignItems: "flex-start" }}>
              <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#c9a84c", letterSpacing: "0.1em", paddingTop: "4px", minWidth: "32px" }}>{step.num}</div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: "1.1rem", color: "#e0e0f0", margin: "0 0 0.5rem" }}>{step.title}</h3>
                <p style={{ color: "#5a5a7a", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "0 1.5rem 8rem", maxWidth: "1100px", margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
          style={{
            position: "relative", overflow: "hidden", borderRadius: "20px",
            padding: "4rem 3rem", textAlign: "center",
            border: "1px solid rgba(201,168,76,0.2)",
            background: "linear-gradient(135deg, rgba(201,168,76,0.08) 0%, rgba(8,8,16,0) 60%)",
          }}>
          <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "400px", height: "300px", background: "radial-gradient(circle, rgba(201,168,76,0.1) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 700, letterSpacing: "-0.025em", color: "#f0f0f8", margin: "0 0 1rem" }}>
              Discipline compounds.<br />
              <span style={{ color: "#c9a84c" }}>Start the record.</span>
            </h2>
            <p style={{ color: "#6666888", fontSize: "1rem", marginBottom: "2rem", maxWidth: "400px", margin: "0 auto 2rem" }}>
              Every consistent trader has a log. This is yours.
            </p>
            {!user && (
              <Link to="/register">
                <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} style={styles.btnGoldLg}>
                  Open your journal →
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "2rem 2rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "24px", height: "24px", background: "linear-gradient(135deg, #c9a84c, #f0d080)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "11px", color: "#080810" }}>X</div>
            <span style={{ color: "#5a5a7a", fontSize: "0.85rem" }}>XAU/USD Journal</span>
          </div>
          <p style={{ color: "#3a3a5a", fontSize: "0.8rem", margin: 0 }}>© 2026 Trading Journal Pro</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0% { background-position: 0% } 100% { background-position: 200% } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; }
      `}</style>
    </div>
  );
}

const styles = {
  pill: {
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: "100px",
    fontSize: "0.72rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    fontWeight: 600,
    color: "#c9a84c",
    background: "rgba(201,168,76,0.1)",
    border: "1px solid rgba(201,168,76,0.25)",
  },
  btnGold: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #c9a84c, #e8c84a)",
    color: "#0c0c18",
    fontWeight: 600,
    fontSize: "13px",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  btnGoldLg: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #c9a84c, #e8c84a)",
    color: "#0c0c18",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    letterSpacing: "0.01em",
  },
  btnGhost: {
    padding: "8px 18px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#a0a0c0",
    fontWeight: 500,
    fontSize: "13px",
    cursor: "pointer",
  },
  btnGhostLg: {
    padding: "14px 28px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#a0a0c0",
    fontWeight: 500,
    fontSize: "15px",
    cursor: "pointer",
  },
  sectionEyebrow: {
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#c9a84c",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  sectionHeading: {
    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
    fontWeight: 700,
    letterSpacing: "-0.025em",
    color: "#e8e8f0",
    marginBottom: "1rem",
    lineHeight: 1.1,
  },
};