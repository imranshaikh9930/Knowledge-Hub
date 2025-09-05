import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react"; // icons

export default function Navbar({ user, logout }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 bg-white shadow-sm font-poppins">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo / Name */}
          <div className="flex items-center">
            <NavLink to="/" className="text-xl font-bold text-blue-600">
              Knowledge-Hub
            </NavLink>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex gap-6 ml-10">
            {user && <NavLink to="/" className={({isActive})=> isActive ? "text-blue-500 font-bold text-lg":"hover:text-blue-600 font-medium"}>Dashboard</NavLink>}
            {user && <NavLink to="/search" className={({isActive})=> isActive ? "text-blue-500 font-bold text-lg":"hover:text-blue-600 font-medium"} >Search</NavLink>}
            {user && <NavLink to="/add" className={({isActive})=> isActive ? "text-blue-500 font-bold text-lg":"hover:text-blue-600 font-medium"}>Add Doc</NavLink>}
            {user && <NavLink to="/qna" className={({isActive})=> isActive ? "text-blue-500 font-bold text-lg":"hover:text-blue-600 font-medium"}>Q&A</NavLink>}

            {!user && (
              <>
                <NavLink to="/login" className="hover:text-blue-600 font-medium">Login</NavLink>
                <NavLink to="/register" className="hover:text-blue-600 font-medium">Register</NavLink>
              </>
            )}
          </div>

          {/* Right side (Desktop) */}
          {user && (
            <div className="hidden md:flex items-center gap-4 ml-auto">
              <span className="text-gray-700 font-semibold">
                Welcome, <span className="text-blue-600">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center ml-auto">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-md hover:bg-gray-100">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-3 space-y-3 bg-gray-50 border-t">
          {user && <Link to="/" className="block hover:text-blue-600 font-medium">Dashboard</Link>}
          {user && <Link to="/search" className="block hover:text-blue-600 font-medium">Search</Link>}
          {user && <Link to="/add" className="block hover:text-blue-600 font-medium">Add Doc</Link>}
          {user && <Link to="/qna" className="block hover:text-blue-600 font-medium">Q&A</Link>}

          {!user && (
            <>
              <Link to="/login" className="block hover:text-blue-600 font-medium">Login</Link>
              <Link to="/register" className="block hover:text-blue-600 font-medium">Register</Link>
            </>
          )}

          {user && (
            <div className="pt-3 border-t">
              <span className="block text-gray-700 font-semibold mb-2">
                Welcome, <span className="text-blue-600">{user.name}</span>
              </span>
              <button
                onClick={logout}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
