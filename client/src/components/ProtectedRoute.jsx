import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/context";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null; // or a loading spinner
  }

  return children;
}

export default ProtectedRoute;
