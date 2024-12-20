import React from 'react';
import Navbar from '../components/Navbar';
import AboutSection from '../components/AboutSection';
import HeroSection from '../components/HeroSection';
import ContactSection from '../components/ContactSection';
import ReviewsSection from '../components/ReviewsSection';
import CarouselComponent from "../components/CarouselComponent";
import FooterSection from "../components/FooterSection";



const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSection/>
      <AboutSection />
      <CarouselComponent />
      <ContactSection />
      <ReviewsSection />
      <FooterSection />
    </div>
  );
};

export default Home;
