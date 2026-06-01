import HomePageNav from "../components/HomePageNav";
import imageOne from "../assets/images/students-holding-a-phone.jpg";
import imageTwo from "../assets/images/students.jpg";
import { FaChartLine, FaDownload, FaQrcode, FaShieldAlt } from "react-icons/fa";
import { BsLightningChargeFill } from "react-icons/bs";
import { FaShield, FaChartBar } from "react-icons/fa6";
import { TfiDashboard } from "react-icons/tfi";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full">
      <HomePageNav />
      <header className="w-full h-200 md:h-180 translate-y-20 py-5 px-4 md:pb-10 md:px-20 md:py-8 md:pt-10 flex items-start justify-center flex-col md:flex-row-reverse bg-gray-100">
        <div className="w-full h-[40%] md:w-[40%] md:h-full mt-3 border-8 border-primary md:border-0 overflow-hidden rounded-2xl md:px-5">
          <img
            className="w-full h-full md:w-120 md:h-120 md:-rotate-6 object-cover md:rounded-tl-[8rem] md:rounded-br-[8rem] md:mt-8"
            src={imageOne}
            alt="hero image"
          />
        </div>
        <div className="w-full h-[60%] md:w-[60%] md:h-full flex items-start justify-center flex-col gap-6">
          <h1 className="text-5xl font-bold md:text-7xl md:font-extrabold text-primary">
            Smart<br /> Attendance <br />Management <br />System
          </h1>
          <p className="text-[1.2rem] md:text-[1.5rem] mt-4 md:mt-0 md:pe-32">
            Simplify classroom attendance with secure QR codes and real-time dashboard tracking
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn border-2 border-none outline-0 w-full max-w-[18rem] py-2 md:py-4 self-center md:self-auto font-galano"
          >
            Get Started
          </button>
        </div>
      </header>

      <section id="features" className="w-full h-400 md:h-140 translate-y-20 bg-white flex items-center justify-center flex-col gap-10 md:gap-16">
        <div className="w-full flex items-center justify-center flex-col text-center gap-2">
          <h2 className="text-dark text-3xl font-bold">Powerful Features</h2>
          <p className="px-2 md:px-0">Everything you need to manage attendance efficiently, accurately, and without the paperwork</p>
        </div>
        <div className="card-con w-full h-max flex items-center justify-center flex-col gap-20 py-5 md:flex-row md:px-20 md:gap-10">
          <div className="card">
            <span className="icon"><FaQrcode className="text-primary text-[20px]" /></span>
            <h3>QR Code Attendance</h3>
            <p>Instant scanning for students via their mobile devices. Unique and time-sensitive.</p>
          </div>
          <div className="card">
            <span className="icon"><FaChartLine className="text-primary" /></span>
            <h3>Live Tracking</h3>
            <p>Watch attendance update in real-time as students enter the lecture hall</p>
          </div>
          <div className="card">
            <span className="icon"><FaShieldAlt className="text-primary" /></span>
            <h3>Code Verification</h3>
            <p>Secure verification by unique codes to prevent proxy attendance</p>
          </div>
          <div className="card">
            <span className="icon"><FaDownload className="text-primary" /></span>
            <h3>Export Attendance</h3>
            <p>Download detailed reports in CSV or Excel formats for administrative use.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full h-230 md:h-150 bg-gray-100 translate-y-20 flex items-center justify-center flex-col md:pt-8 px-5 md:px-0">
        <h2 className="text-4xl md:text-5xl text-center font-bold">How it works</h2>
        <div className="w-full h-[80%] flex items-center justify-center flex-col px-5 gap-18 mt-10 md:mt-0">
          {[
            { step: 1, title: "Lecturer creates session", desc: "Select the course, unit and room. The system generates a secure, dynamic QR code instantly." },
            { step: 2, title: "Students scan QR or enter code", desc: "Students open the SAMS portal on their phones to scan the displayed QR or enter a manual session pin/code." },
            { step: 3, title: "Attendance live updates", desc: "The lecturer's dashboard populates immediately. No more physical sheets or manual entry later." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start justify-center flex-col md:flex-row gap-3 md:gap-8 w-full">
              <span className="w-10 h-10 bg-primary text-white font-bold flex items-center justify-center rounded-full md:mt-2">{step}</span>
              <div className="md:flex md:items-start md:justify-center md:flex-col md:w-[60%]">
                <h3 className="font-bold text-2xl md:text-3xl">{title}</h3>
                <p>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="benefits" className="translate-y-20 bg-white w-full min-h-150 md:h-150 flex items-center justify-center flex-col md:flex-row p-5 pt-16 md:pt-0 gap-10">
        <h2 className="md:hidden text-4xl font-bold text-center">Why choose SAMS?</h2>
        <div className="w-full h-[30%] md:w-2/4 md:h-[80%] flex items-center justify-center">
          <img src={imageTwo} className="w-[90%] h-[90%] object-cover rounded-2xl" />
        </div>
        <div className="w-full md:w-2/4 flex flex-col justify-center gap-6 md:pr-10">
          <h2 className="hidden md:block text-4xl font-bold">Why learning institutes choose SAMS</h2>
          <div className="w-full flex flex-col gap-5">
            {[
              { icon: <BsLightningChargeFill className="text-primary text-[1.3rem]" />, title: "Faster Attendance", desc: "Reduce attendance time from 10 minutes to 30 seconds per class." },
              { icon: <FaShield className="text-primary text-[1.3rem]" />, title: "Anti-Proxy Protection", desc: "Time-sensitive QR codes and session pins prevent attendance fraud." },
              { icon: <TfiDashboard className="text-primary text-[1.3rem]" />, title: "Real-Time Dashboard", desc: "Live view of who's present — no waiting, no manual tallying." },
              { icon: <FaChartBar className="text-primary text-[1.3rem]" />, title: "Detailed Analytics", desc: "Export attendance records as CSV or Excel for administrative review." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start md:items-center justify-center flex-col md:flex-row gap-3 w-full">
                <span className="w-10 h-10 min-w-10 bg-light-purple-alt flex items-center justify-center rounded-[0.8rem]">{icon}</span>
                <div>
                  <h3 className="text-[1.1rem] font-bold">{title}</h3>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="translate-y-20 bg-dark text-white w-full py-10 px-6 md:px-20 flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-primary font-extrabold text-2xl">SAMS</span>
          <p className="text-gray-400 text-sm max-w-xs">Smart Attendance Management System — built for modern education.</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Quick Links</p>
          <a href="#features" className="text-gray-400 text-sm hover:text-primary">Features</a>
          <a href="#how-it-works" className="text-gray-400 text-sm hover:text-primary">How it works</a>
          <a href="#benefits" className="text-gray-400 text-sm hover:text-primary">Benefits</a>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Account</p>
          <a href="/login" className="text-gray-400 text-sm hover:text-primary">Login</a>
          <a href="/register" className="text-gray-400 text-sm hover:text-primary">Register</a>
        </div>
        <p className="text-gray-600 text-xs self-end">© 2026 SAMS. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
