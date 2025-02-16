import React, { useState, useContext, useEffect, useRef } from "react";
import {
  MapPin,
  Hotel,
  List,
  Plane,
  Clock,
  Star,
  Heart,
  MessageSquare,
  X,
  Send,
} from "lucide-react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { PreferencesContext } from "../contexts/PreferencesContext";
import { useSearchParams } from "react-router-dom";
import emailjs from "@emailjs/browser";
import { Dialog } from "@headlessui/react";
const FeedbackDialog = React.memo(
  ({
    isOpen,
    onClose,
    formRef,
    feedbackForm,
    handleInputChange,
    handleSubmit,
    isSending,
    sendStatus,
  }) => (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={onClose}
          as={motion.div}
          className="relative z-50"
          static
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />

          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-xl"
            >
              <button
                onClick={onClose}
                disabled={isSending}
                className="absolute top-4 right-4 p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>

              <Dialog.Title className="text-xl font-bold mb-4">
                Share Your Feedback
              </Dialog.Title>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={feedbackForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={feedbackForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={feedbackForm.message}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSending}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 flex items-center"
                  >
                    {isSending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>

                {sendStatus === "success" && (
                  <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                    Feedback sent successfully! Thank you!
                  </div>
                )}

                {sendStatus === "error" && (
                  <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                    Failed to send feedback. Please try again.
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  )
);
const Plan = () => {
  const {
    preferences,
    generatedPlans,
    addToFavorites,
    favorites = [],
  } = useContext(PreferencesContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [isFavoriting, setIsFavoriting] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const formRef = useRef();

  const MAD_RATE = 1;

  useEffect(() => {
    const urlIndex = parseInt(searchParams.get("planIndex")) || 0;
    setSelectedPlanIndex(Math.min(urlIndex, (generatedPlans?.length || 1) - 1));
  }, [generatedPlans, searchParams]);

  useEffect(() => {
    setSearchParams({ planIndex: selectedPlanIndex }, { replace: true });
  }, [selectedPlanIndex, setSearchParams]);

  const handleAddToFavorites = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);
    try {
      await addToFavorites(selectedPlanIndex);
    } catch (error) {
      console.error("Error adding to favorites", error);
    } finally {
      setIsFavoriting(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setSendStatus(null);

    try {
      await emailjs.sendForm(
        "service_riipxc4",
        "template_omy9iet",
        formRef.current,
        "_DwsBrRywtSPiDULH"
      );

      setSendStatus("success");
      setFeedbackForm({ name: "", email: "", message: "" });
      setTimeout(() => setIsFeedbackDialogOpen(false), 2000);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      setSendStatus("error");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setFeedbackForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!generatedPlans || generatedPlans.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-screen items-center justify-center"
      >
        <p className="text-gray-600 text-lg animate-pulse">
          No travel plans generated yet. Please set your preferences first.
        </p>
      </motion.div>
    );
  }

  const currentPlan = generatedPlans[selectedPlanIndex];
  const currentPreference = preferences[preferences.length - 1];
  const breakdown = currentPlan.breakdown;
  const budgetScore = Math.round(
    (currentPlan.total_cost / currentPreference.budget) * 100
  );
  const planItems = currentPlan.plan;

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cardHoverVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  return (
    <div className="pt-24 px-4 pb-12 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <FeedbackDialog
        isOpen={isFeedbackDialogOpen}
        onClose={() => setIsFeedbackDialogOpen(false)}
        formRef={formRef}
        feedbackForm={feedbackForm}
        handleInputChange={handleInputChange}
        handleSubmit={handleFeedbackSubmit}
        isSending={isSending}
        sendStatus={sendStatus}
      />

      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={fadeInUpVariants}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedPlanIndex}
            className="flex justify-center mb-6 space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {generatedPlans.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setSelectedPlanIndex(index)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg flex items-center space-x-2 shadow-md transition-colors duration-300 ${
                  selectedPlanIndex === index
                    ? "bg-gradient-to-r from-teal-400 to-teal-500 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Star
                  className={`w-5 h-5 ${
                    selectedPlanIndex === index ? "text-white" : "text-teal-500"
                  }`}
                />
                <span>Plan {index + 1}</span>
              </motion.button>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              { icon: Hotel, title: "Hotels", value: breakdown.hotels_total },
              {
                icon: List,
                title: "Activities",
                value: breakdown.activities_total,
              },
              {
                icon: Plane,
                title: "Transport",
                value: breakdown.transport_total,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={cardHoverVariants}
                whileHover="hover"
                className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-md transform transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <item.icon className="text-teal-500 w-6 h-6" />
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {Math.floor(item.value * MAD_RATE)} MAD
                </p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {planItems.map((cityPlan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-gray-50 p-6 rounded-lg border-l-4 border-teal-400 shadow-md transition-all duration-300 ${
                    activeSection === index
                      ? "ring-2 ring-teal-400 ring-opacity-50"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveSection(activeSection === index ? null : index)
                  }
                >
                  <div className="flex flex-col md:flex-row justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <MapPin className="text-teal-500 w-6 h-6" />
                      <h4 className="text-xl font-semibold">{cityPlan.city}</h4>
                    </div>
                    <motion.div
                      className="flex items-center space-x-4 mt-4 md:mt-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                        {cityPlan.days_spent} jour
                        {cityPlan.days_spent > 1 ? "s" : ""}
                      </span>
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {(activeSection === index || activeSection === null) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-6">
                          <div className="flex items-center space-x-3 mb-2">
                            <Hotel className="text-teal-500 w-5 h-5" />
                            <h5 className="font-medium">Hotel</h5>
                          </div>
                          <motion.div
                            className="bg-white p-4 rounded-lg shadow-sm"
                            whileHover={{ scale: 1.01 }}
                          >
                            <p className="font-medium">{cityPlan.hotel.name}</p>
                            <p className="text-gray-600">
                              {Math.floor(
                                cityPlan.hotel.pricePerNight * MAD_RATE
                              )}{" "}
                              MAD/night
                            </p>
                          </motion.div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-3 mb-4">
                            <Clock className="text-teal-500 w-5 h-5" />
                            <h5 className="font-medium">Activities</h5>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cityPlan.activities.map((activity, actIndex) => (
                              <motion.div
                                key={actIndex}
                                className="bg-white p-4 rounded-lg shadow-sm flex justify-between items-center"
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: actIndex * 0.1 }}
                              >
                                <span className="text-gray-700">
                                  {activity.name}
                                </span>
                                <span className="font-medium">
                                  {Math.floor(activity.price * MAD_RATE)} MAD
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <motion.div
            className="mt-8 bg-gradient-to-br from-blue-50 to-white p-6 rounded-lg shadow-lg"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold mb-2">Total Cost</h3>
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">
                  {Math.floor(currentPlan.total_cost * MAD_RATE)} MAD
                </p>
              </div>
              <div className="mt-4 md:mt-0 w-32">
                <CircularProgressbar
                  value={budgetScore}
                  text={`${budgetScore}%`}
                  styles={buildStyles({
                    pathColor: `rgba(141, 211, 187, ${budgetScore / 100})`,
                    textColor: "#2dd4bf",
                    trailColor: "#d6d6d6",
                  })}
                />
                <p className="text-center mt-2 text-sm">Budget Usage</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-8 flex justify-center space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button
            onClick={handleAddToFavorites}
            disabled={
              isFavoriting ||
              favorites.some((f) => f.idPlan === selectedPlanIndex)
            }
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg shadow-md transition-all duration-300 ${
              favorites.some((f) => f.idPlan === selectedPlanIndex)
                ? "bg-gray-300 cursor-not-allowed"
                : isFavoriting
                ? "bg-gray-200 cursor-wait"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Heart
              className={`w-5 h-5 ${
                favorites.some((f) => f.idPlan === selectedPlanIndex)
                  ? "text-red-500"
                  : ""
              }`}
            />
            <span>
              {favorites.some((f) => f.idPlan === selectedPlanIndex)
                ? "Added to favorites"
                : isFavoriting
                ? "Adding..."
                : "Add to favorites"}
            </span>
          </motion.button>

          <motion.button
            onClick={() => setIsFeedbackDialogOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-white text-gray-600 hover:bg-gray-50 shadow-md transition-all duration-300"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Give Your Feedback</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Plan;
