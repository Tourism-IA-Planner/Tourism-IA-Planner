import React, { useState, useRef } from "react";
import emailjs from '@emailjs/browser';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaRobot, FaComment, FaFacebook, FaInstagram } from "react-icons/fa";
import ChatInterface from './ChatInterface';

const ContactSection = () => {
  const form = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ show: false, success: false, message: '' });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    emailjs.sendForm(
      'service_riipxc4',
      'template_omy9iet',
      form.current,
      '_DwsBrRywtSPiDULH'
    )
    .then(() => {
      setStatus({ show: true, success: true, message: 'Message envoyé avec succès!' });
      setFormData({ name: "", email: "", subject: "", message: "" });
    })
    .catch(() => {
      setStatus({ show: true, success: false, message: "Une erreur s'est produite. Veuillez réessayer." });
    })
    .finally(() => {
      setLoading(false);
      setTimeout(() => setStatus({ show: false, success: false, message: '' }), 5000);
    });
  };

  return (
    <div id="contact" className="w-full bg-white">
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-4">
              GET IN <span className="text-[#8DD3BB]">TOUCH</span>
            </h2>
            <p className="text-xl text-center text-black mb-12">
              We're here to help you plan the perfect Moroccan adventure
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Contact Form */}
              <div className="bg-white p-8 rounded-lg shadow-xl">
                {status.show && (
                  <div className={`mb-4 p-4 rounded ${status.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {status.message}
                  </div>
                )}
                
                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    placeholder="Your Name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-transparent"
                    onChange={handleInputChange}
                    required
                  />
                  
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    placeholder="Your Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-transparent"
                    onChange={handleInputChange}
                    required
                  />
                  
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    placeholder="Subject"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-transparent"
                    onChange={handleInputChange}
                    required
                  />
                  
                  <textarea
                    name="message"
                    value={formData.message}
                    placeholder="What can we help you with today?"
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#8DD3BB] focus:border-transparent"
                    onChange={handleInputChange}
                    required
                  />
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#8DD3BB] to-[#5b6763] text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>

              {/* Right Column - Contact Info */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                  <h3 className="text-2xl font-semibold mb-6 text-gray-800">Other Ways to Connect</h3>
                  <div className="space-y-4">
                    <div className="flex items-center text-gray-700">
                      <FaPhone className="text-[#8DD3BB] text-xl mr-4" />
                      <span>+212 609-0782232</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaEnvelope className="text-[#8DD3BB] text-xl mr-4" />
                      <span>ouaailelaouad@gmail.com</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="text-[#8DD3BB] text-xl mr-4" />
                      <span>Tanger, Morocco</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="font-semibold mb-4 text-gray-800">Follow Us</h4>
                    <div className="flex space-x-4">
                      <a href="#" className="text-2xl text-[#8DD3BB] hover:text-blue-600">
                        <FaFacebook />
                      </a>
                      <a href="#" className="text-2xl text-[#8DD3BB] hover:text-red-300">
                        <FaInstagram />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-800">Need Immediate Help?</h4>
                    <FaRobot className="text-2xl text-[#8DD3BB]" />
                  </div>
                  <ChatInterfaceWrapper />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extracted Chat Wrapper component
const ChatInterfaceWrapper = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="relative">
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <FaComment className="text-gray-600" />
          Chat with Our AI Assistant
        </button>
      )}
      {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} />}
    </div>
  );
};

export default ContactSection;