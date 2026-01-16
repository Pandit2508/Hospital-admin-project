import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Scroll spy for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "about", "contact"];
      for (let id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="bg-blue-900 bg-opacity-90 backdrop-blur-md text-white shadow-md fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-white">
          <span className="text-blue-200">Medi</span>
          <span className="text-blue-400">Connect</span>
        </Link>

        {/* Center: Page Links (scrolling) */}
        <div className="hidden md:flex space-x-10 font-medium text-blue-100">
          {["home", "about", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className={`transition ${
                activeSection === id
                  ? "text-white font-semibold"
                  : "hover:text-blue-300"
              }`}
            >
              {id === "contact" ? "Contact Us" : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
        </div>

        {/* Right: Auth Actions (Static for now) */}
        <div className="hidden md:flex items-center space-x-4 text-sm">
          <Link
            to="/login"
            className="border border-blue-400 hover:bg-blue-500 text-blue-200 px-4 py-1 rounded-md"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md"
          >
            Signup
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-blue-200 ml-4"
          aria-label="Toggle Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4 pt-2 space-y-3 text-blue-100 bg-blue-900 bg-opacity-95">
          {["home", "about", "contact"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="block hover:text-blue-300"
              onClick={() => setMenuOpen(false)}
            >
              {id === "contact" ? "Contact Us" : id.charAt(0).toUpperCase() + id.slice(1)}
            </a>
          ))}
          <hr className="border-blue-700" />
          <Link
            to="/login"
            className="block hover:text-blue-300"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="block hover:text-blue-300"
            onClick={() => setMenuOpen(false)}
          >
            Signup
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
