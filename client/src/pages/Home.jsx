import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              💰 Smart Expense Tracker
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Take control of your finances with our intelligent expense tracking platform.
              Monitor spending, set budgets, and achieve your financial goals effortlessly.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-white text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Analytics</h3>
            <p className="text-gray-600">
              Get detailed insights into your spending patterns with beautiful charts and reports.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Budget Management</h3>
            <p className="text-gray-600">
              Set budgets for different categories and track your progress towards financial goals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-4xl mb-4">🔄</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Recurring Expenses</h3>
            <p className="text-gray-600">
              Automate tracking of recurring expenses like subscriptions and bills.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Smart Expense Tracker?</h2>
            <p className="text-gray-600">Join thousands of users who have taken control of their finances</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$2M+</div>
              <div className="text-gray-600">Expenses Tracked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">95%</div>
              <div className="text-gray-600">User Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Tracking?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our community and take the first step towards financial freedom.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
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
