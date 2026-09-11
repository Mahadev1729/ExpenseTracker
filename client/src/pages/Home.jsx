import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-root)", color: "var(--text-primary)" }}>
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-bold mb-4 tracking-tight" style={{ color: "var(--text-heading)" }}>
              💰 Smart Expense Tracker
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Take control of your finances with our intelligent expense tracking platform.
              Monitor spending, set budgets, and achieve your financial goals effortlessly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black px-8 py-4 rounded-full text-lg font-semibold hover:brightness-110 transform hover:scale-[1.02] transition-all duration-200 shadow-[0_12px_30px_rgba(201,162,39,0.25)]"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-full text-lg font-semibold transform hover:scale-[1.02] transition-all duration-200"
              style={{
                backgroundColor: "var(--bg-card)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-primary)",
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { icon: "📊", title: "Smart Analytics", desc: "Get detailed insights into your spending patterns with beautiful charts and reports." },
            { icon: "🎯", title: "Budget Management", desc: "Set budgets for different categories and track your progress towards financial goals." },
            { icon: "🔄", title: "Recurring Expenses", desc: "Automate tracking of recurring expenses like subscriptions and bills." },
          ].map((f) => (
            <div key={f.title} className="premium-card p-8 transition-all duration-300 hover:-translate-y-1">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: "var(--text-heading)" }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)" }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="premium-card p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>
              Why Choose Smart Expense Tracker?
            </h2>
            <p style={{ color: "var(--text-secondary)" }}>
              Join thousands of users who have taken control of their finances
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { val: "10K+", label: "Active Users" },
              { val: "₹2M+", label: "Expenses Tracked" },
              { val: "95%", label: "User Satisfaction" },
              { val: "24/7", label: "Support Available" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold mb-2" style={{ color: "var(--accent)" }}>{s.val}</div>
                <div style={{ color: "var(--text-secondary)" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center premium-card p-12">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-heading)" }}>Ready to Start Tracking?</h2>
          <p className="text-xl mb-8" style={{ color: "var(--text-secondary)" }}>
            Join our community and take the first step towards financial freedom.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black px-8 py-4 rounded-full text-lg font-semibold hover:brightness-110 transform hover:scale-[1.02] transition-all duration-200 shadow-[0_12px_30px_rgba(201,162,39,0.25)]"
          >
            Create Your Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 mt-16" style={{ backgroundColor: "var(--bg-sidebar)", borderTop: "1px solid var(--border)" }}>
        <div className="container mx-auto px-4 text-center">
          <p style={{ color: "var(--text-muted)" }}>© 2026 Smart Expense Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
