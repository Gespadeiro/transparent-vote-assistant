
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Candidates", path: "/candidates" },
    { name: "Chatbot", path: "/chatbot" },
    { name: "Quiz", path: "/quiz" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        scrolled
          ? "glass-morphism py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <NavLink
          to="/"
          className="text-lg font-semibold flex items-center space-x-2 animate-fade-in"
        >
          <span className="text-election-blue font-bold">Transparent</span>
          <span>Election</span>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `transition-all duration-300 font-medium relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-election-blue after:transition-all after:duration-300 ${
                  isActive
                    ? "text-election-blue after:w-full"
                    : "text-foreground hover:text-election-blue after:w-0 hover:after:w-full"
                } animate-fade-in`
              }
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Mobile Navigation Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden focus:outline-none transition-all duration-300"
          aria-label="Toggle Menu"
        >
          {isOpen ? (
            <X size={24} className="text-foreground" />
          ) : (
            <Menu size={24} className="text-foreground" />
          )}
        </button>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 glass-morphism py-4 md:hidden animate-slide-down">
            <div className="container mx-auto px-6 flex flex-col space-y-4">
              {navLinks.map((link, index) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between py-2 px-4 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-election-blue/10 text-election-blue"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    } animate-slide-up`
                  }
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span>{link.name}</span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-300 ${
                      location.pathname === link.path ? "rotate-90" : ""
                    }`}
                  />
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
