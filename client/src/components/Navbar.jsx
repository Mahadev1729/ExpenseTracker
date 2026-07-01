import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/context";
import NotificationInbox from "./NotificationInbox";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="border-b border-white/10 bg-[#060606]/90 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold tracking-[0.2em] text-white">
                Smart Expense Tracker
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm font-medium">
                  Welcome, {user.name}
                </span>
                <NotificationInbox />
              </div>
            )}
            <button
              onClick={handleLogout}
              className="bg-gradient-to-r from-[#c9a227] to-[#e2b84d] text-black hover:brightness-110 px-4 py-2 rounded-full text-sm font-semibold transition duration-200 shadow-[0_8px_20px_rgba(201,162,39,0.2)]"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
