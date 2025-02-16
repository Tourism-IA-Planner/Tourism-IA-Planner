import React from 'react';
import DatePicker from "react-datepicker";
import { motion, AnimatePresence } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";

const StyledDatePicker = ({ selected, onChange, selectsStart, selectsEnd, startDate, endDate, minDate, customInput, placeholderText }) => {
  const CalendarContainer = ({ className, children }) => {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`${className} custom-calendar-container`}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="date-picker-wrapper">
      <style>
        {`
          .date-picker-wrapper {
            width: 100%;
            height: 48px; /* Fixed height to match your inputs */
          }

          .react-datepicker-wrapper,
          .react-datepicker__input-container {
            width: 100%;
            height: 100%;
          }

          .react-datepicker__input-container input {
            width: 100%;
            height: 100%;
          }

          .react-datepicker-popper {
            z-index: 100;
          }

          .react-datepicker {
            font-family: inherit;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            overflow: hidden;
            width: 320px; /* Fixed width for the calendar */
          }

          .react-datepicker__month-container {
            width: 100%;
          }

          .react-datepicker__header {
            background-color: #8DD3BB;
            border-bottom: none;
            padding-top: 0.75rem;
            width: 100%;
          }

          .react-datepicker__current-month {
            color: white;
            font-weight: 600;
            font-size: 1rem;
            padding-bottom: 0.5rem;
          }

          .react-datepicker__day-names {
            display: flex;
            justify-content: space-around;
            margin-bottom: 0.5rem;
          }

          .react-datepicker__day-name {
            color: white;
            font-weight: 500;
            width: 2rem;
            line-height: 2rem;
            margin: 0;
          }

          .react-datepicker__month {
            margin: 0.4rem;
          }

          .react-datepicker__day {
            width: 2rem;
            line-height: 2rem;
            margin: 0;
            transition: all 0.2s ease;
            border-radius: 0.375rem;
          }

          .react-datepicker__day:hover {
            background-color: #8DD3BB;
            color: white;
          }

          .react-datepicker__day--selected,
          .react-datepicker__day--in-range {
            background-color: #8DD3BB !important;
            color: white !important;
          }

          .react-datepicker__day--keyboard-selected {
            background-color: #8DD3BB50;
          }

          .react-datepicker__navigation {
            top: 0.75rem;
          }

          .react-datepicker__navigation-icon::before {
            border-color: white;
          }

          .react-datepicker__day--in-selecting-range {
            background-color: #8DD3BB90;
            color: white;
          }

          .react-datepicker__triangle {
            display: none;
          }

          .custom-calendar-container {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }

          /* Ensure week rows maintain consistent height */
          .react-datepicker__week {
            display: flex;
            justify-content: space-around;
            height: 2.25rem;
          }
        `}
      </style>
      <DatePicker
        selected={selected}
        onChange={onChange}
        selectsStart={selectsStart}
        selectsEnd={selectsEnd}
        startDate={startDate}
        endDate={endDate}
        minDate={minDate}
        calendarContainer={CalendarContainer}
        customInput={customInput}
        placeholderText={placeholderText}
        dateFormat="dd-MM-yyyy"
        showPopperArrow={false}
      />
    </div>
  );
};

export default StyledDatePicker;