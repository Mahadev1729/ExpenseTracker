import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#040404] text-gray-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-4 tracking-tight">
              💰 Smart Expense Tracker
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
              Take control of your finances with our intelligent expense
              tracking platform. Monitor spending, set budgets, and achieve your
              financial goals effortlessly.
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
              className="bg-[#111111] text-white px-8 py-4 rounded-full text-lg font-semibold border border-white/10 hover:border-[#c9a227] hover:bg-[#1a1a1a] transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="premium-card p-8 transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Smart Analytics
            </h3>
            <p className="text-gray-400">
              Get detailed insights into your spending patterns with beautiful
              charts and reports.
            </p>
          </div>

          <div className="bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Budget Management
            </h3>
            <p className="text-gray-400">
              Set budgets for different categories and track your progress
              towards financial goals.
            </p>
          </div>

          <div className="bg-[#111111] border border-gray-800 p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Recurring Expenses
            </h3>
            <p className="text-gray-400">
              Automate tracking of recurring expenses like subscriptions and
              bills.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="premium-card p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose Smart Expense Tracker?
            </h2>
            <p className="text-gray-400">
              Join thousands of users who have taken control of their finances
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">10K+</div>
              <div className="text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">$2M+</div>
              <div className="text-gray-400">Expenses Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">24/7</div>
              <div className="text-gray-400">Support Available</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center premium-card p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Tracking?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and take the first step towards financial
            freedom.
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
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2026 Smart Expense Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
