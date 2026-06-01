import { useState } from "react";
import { BiMenu } from "react-icons/bi";
import { FaGraduationCap, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function HomePageNav() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between fixed w-full bg-white h-20 font-galano p-4 md:px-20 shadow-2xl shadow-gray-200 z-50">
      <span>
        <a href="/" className="text-primary flex items-center gap-1.5">
          <FaGraduationCap className="text-5xl" />
          <span className="font-extrabold pt-3">SAMS</span>
        </a>
      </span>
      <span className="cursor-pointer md:hidden" onClick={() => setIsOpen(!isOpen)}>
        <BiMenu className="text-primary text-4xl" />
      </span>

      <ul className="hidden md:flex md:items-center justify-between w-max gap-6 list-none font-semibold">
        <li className="text-dark hover:text-primary cursor-pointer"><a href="#features">Features</a></li>
        <li className="text-dark hover:text-primary cursor-pointer"><a href="#how-it-works">How it works</a></li>
        <li className="text-dark hover:text-primary cursor-pointer"><a href="#benefits">Benefits</a></li>
      </ul>

      <div className="hidden md:flex w-max items-center gap-4 font-semibold">
        <button
          onClick={() => navigate("/login")}
          className="border-2 border-dark outline-0 w-28 py-2 text-dark bg-white rounded-full cursor-pointer hover:bg-dark hover:text-white transition-colors duration-500 ease-in-out"
        >
          Login
        </button>
        <button
          onClick={() => navigate("/register")}
          className="border-2 border-transparent outline-0 w-32 py-2 text-white bg-primary rounded-full cursor-pointer hover:bg-white hover:border-primary hover:text-primary transition-colors duration-500 ease-in-out"
        >
          Get Started
        </button>
      </div>

      {isOpen && (
        <div className="mobileMenu md:hidden fixed left-0 top-0 w-full h-full bg-transparent backdrop-blur-sm z-20 flex items-end justify-center flex-col">
          <ul className="w-[70%] h-full bg-white flex items-center justify-start pt-40 px-5 gap-3 flex-col">
            <span className="exit absolute top-10 right-5 cursor-pointer" onClick={() => setIsOpen(false)}>
              <FaTimes className="text-3xl text-dark hover:text-primary" />
            </span>
            <li className="text-dark hover:text-primary cursor-pointer"><a href="#features" onClick={() => setIsOpen(false)}>Features</a></li>
            <li className="text-dark hover:text-primary cursor-pointer"><a href="#how-it-works" onClick={() => setIsOpen(false)}>How it works</a></li>
            <li className="text-dark hover:text-primary cursor-pointer"><a href="#benefits" onClick={() => setIsOpen(false)}>Benefits</a></li>
            <div className="flex flex-col w-full items-center justify-center mt-5 gap-4 font-semibold">
              <button
                onClick={() => navigate("/login")}
                className="border-2 border-dark outline-0 w-28 py-2 text-dark bg-white rounded-full cursor-pointer hover:bg-dark hover:text-white transition-colors duration-500 ease-in-out"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register")}
                className="border-2 border-transparent outline-0 w-32 py-2 text-white bg-primary rounded-full cursor-pointer hover:bg-white hover:border-primary hover:text-primary transition-colors duration-500 ease-in-out"
              >
                Get Started
              </button>
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default HomePageNav;
