import { Suspense, lazy } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { useAuth } from "./Context/AuthContext";
import "./App.css";
import PrivateRoute from "./components/PrivateRoute";
import Loader from "./components/Loader";
import Navbar from "./components/Navbar";

// Lazy load pages/components
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Search = lazy(() => import("./pages/Search"));
const AddEditDoc = lazy(() => import("./components/AddEditDoc"));
const Register = lazy(() => import("./pages/Register"));
const QnA = lazy(() => import("./components/QnA"));
const Login = lazy(() => import("./pages/Login"));

function App() {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Navbar */}
    <Navbar user={user} logout={logout}/>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        }
      >
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/search"
            element={
              <PrivateRoute>
                <Search />
              </PrivateRoute>
            }
          />
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <AddEditDoc />
              </PrivateRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <PrivateRoute>
                <AddEditDoc />
              </PrivateRoute>
            }
          />
          <Route
            path="/qna"
            element={
              <PrivateRoute>
                <QnA />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
