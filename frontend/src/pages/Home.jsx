import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const sections = [
  {
    image: '/images/image1.png',
    title: 'Seamless Patient Referrals',
    subtitle: 'REFERRAL NETWORK',
    description:
      "If a hospital lacks a facility, patients can be referred instantly to the nearest hospital in the network, ensuring timely treatment without delays.",
    button: 'Refer Now',
  },
  {
    image: '/images/image2.png',
    title: 'Connected Hospitals, Better Care',
    subtitle: 'REAL-TIME DATABASE',
    description:
      'All hospitals are connected through a synchronized database, keeping facility availability up-to-date and reliable at all times.',
    button: 'Explore Network',
  },
  {
    image: '/images/image3.png',
    title: 'Trust, Care & Accessibility',
    subtitle: 'OUR PROMISE',
    description:
      'We ensure no patient is left untreated due to lack of resources. Hospitals collaborate to provide safe, fast, and trusted care.',
    button: 'Join Network',
  },
];

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const goToLogin = () => navigate("/login");

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 text-gray-900 scroll-smooth">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="scroll-mt-[96px] min-h-screen flex items-center justify-center px-6 pt-[88px] relative bg-gradient-to-br from-blue-900/90 to-blue-700/90"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: 'url("/images/main.png")' }}
        />
        <div className="absolute inset-0 bg-black/40 z-0" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-4xl text-center relative z-10"
        >
          <div className="text-sm uppercase tracking-widest font-bold text-white/90 mb-3 text-lg">
            Smarter Healthcare Connections
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white">
            Welcome to <span className="text-blue-200">MediConnect</span>
          </h1>

          <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto">
            A unified platform where hospitals collaborate — refer patients, share resources, and
            ensure <em className="text-blue-200">every patient gets the care they need</em>.
          </p>

          <div className="mt-8">
            <button
              onClick={goToLogin}
              className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold shadow-lg transition text-lg"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </section>

      {/* Sections */}
      {sections.map((section, idx) => {
        const isAbout = idx === 1;

        return (
          <section
            key={idx}
            id={isAbout ? 'about' : undefined}
            className={`scroll-mt-[96px] flex flex-col md:flex-row items-center justify-center px-6 py-16 gap-10 max-w-6xl mx-auto 
            ${idx % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            data-aos="fade-up"
          >
            <div className="md:w-1/2">
              <img
                src={section.image}
                alt="section"
                className="rounded-2xl shadow-2xl object-cover w-full h-80 md:h-[400px]"
              />
            </div>

            <div className="md:w-1/2">
              <div className="uppercase text-sm text-blue-500 font-medium mb-2">
                {section.subtitle}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
                {section.title}
              </h2>

              <p className="text-gray-600 text-lg mb-6">{section.description}</p>

              <button
                onClick={goToLogin}
                className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl font-medium text-white"
              >
                {section.button}
              </button>
            </div>
          </section>
        );
      })}

      {/* FAQ Section */}
      <section className="bg-blue-50 text-gray-900 py-20 px-6" data-aos="fade-up">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked <br className="hidden md:block" /> Questions
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Curious about how MediConnect works? Here are some common questions to guide you.
            </p>
            <button
              onClick={goToLogin}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-semibold text-white"
            >
              Contact Support
            </button>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'How does the referral system work?',
                answer:
                  'If a hospital lacks a facility, they can instantly refer the patient to the nearest connected hospital with the required resources.',
              },
              {
                question: 'Is the database updated in real-time?',
                answer:
                  'Yes. All hospitals are connected via a synchronized, replicated database that updates availability instantly.',
              },
              {
                question: 'How can my hospital join MediConnect?',
                answer:
                  'Simply register your hospital on our platform. Our team will integrate your facility data into the network database.',
              },
            ].map((faq, idx) => (
              <div key={idx}>
                <h3 className="text-xl font-semibold mb-1 text-gray-900">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                <hr className="my-4 border-blue-200" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
