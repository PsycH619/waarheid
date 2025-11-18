/**
 * Waarheid Marketing - Booking Page JavaScript
 * Interactive calendar and time slot booking
 */

document.addEventListener('DOMContentLoaded', function() {
  let currentCalendarDate = new Date();
  let selectedDate = null;
  let selectedTime = null;

  // Initialize calendar on page load
  renderBookingCalendar(currentCalendarDate);

  // Calendar navigation functions
  window.previousMonth = function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
    renderBookingCalendar(currentCalendarDate);
  };

  window.nextMonth = function() {
    currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
    renderBookingCalendar(currentCalendarDate);
  };

  // Render the calendar
  function renderBookingCalendar(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    const firstDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const prevMonthDays = prevLastDay.getDate();

    // Get available slots from DataManager
    const availableSlots = DataManager.timeslots.getAvailable();
    const slotsByDate = {};

    availableSlots.forEach(slot => {
      if (!slotsByDate[slot.date]) {
        slotsByDate[slot.date] = [];
      }
      slotsByDate[slot.date].push(slot);
    });

    let calendarHTML = `
      <div style="background: var(--color-white); padding: 2rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
          <button type="button" class="btn btn-secondary" onclick="previousMonth()" style="padding: 0.75rem 1.5rem;">
            <i class="fas fa-chevron-left"></i>
          </button>
          <h3 style="margin: 0; color: var(--color-dark); font-size: 1.5rem;">${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h3>
          <button type="button" class="btn btn-secondary" onclick="nextMonth()" style="padding: 0.75rem 1.5rem;">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem; margin-bottom: 1rem;">
          ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day =>
            `<div style="text-align: center; font-weight: 700; padding: 0.5rem; font-size: 0.9rem; color: var(--color-text-light);">${day}</div>`
          ).join('')}
        </div>

        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.5rem;">
    `;

    // Previous month days
    const startDay = firstDayOfWeek === 0 ? 0 : firstDayOfWeek;
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      calendarHTML += `
        <div style="padding: 1rem; text-align: center; opacity: 0.3; background: var(--color-light); border-radius: 8px; min-height: 60px;">
          <div style="font-size: 1rem;">${day}</div>
        </div>
      `;
    }

    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= totalDays; day++) {
      const currentDate = new Date(year, month, day);
      currentDate.setHours(0, 0, 0, 0);
      const dateStr = currentDate.toISOString().split('T')[0];
      const daySlots = slotsByDate[dateStr] || [];
      const isPast = currentDate < today;
      const isToday = currentDate.getTime() === today.getTime();
      const hasSlots = daySlots.length > 0;
      const isSelected = selectedDate === dateStr;

      calendarHTML += `
        <div onclick="${hasSlots && !isPast ? `selectDate('${dateStr}')` : ''}" style="
          padding: 1rem;
          background: ${isSelected ? 'var(--color-primary)' : isToday ? 'rgba(197, 0, 119, 0.1)' : 'var(--color-light)'};
          border: ${isSelected ? '2px solid var(--color-primary)' : isToday ? '2px solid var(--color-primary)' : '1px solid var(--color-border)'};
          border-radius: 8px;
          cursor: ${hasSlots && !isPast ? 'pointer' : 'default'};
          transition: all 0.2s;
          opacity: ${isPast ? '0.4' : hasSlots ? '1' : '0.6'};
          min-height: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        " ${hasSlots && !isPast ? `onmouseover="this.style.background='rgba(197, 0, 119, 0.2)'" onmouseout="this.style.background='${isSelected ? 'var(--color-primary)' : isToday ? 'rgba(197, 0, 119, 0.1)' : 'var(--color-light)'}'"` : ''}>
          <div style="font-weight: ${isToday || isSelected ? '700' : '500'}; font-size: 1rem; color: ${isSelected ? 'white' : 'var(--color-dark)'};">
            ${day}
          </div>
          ${hasSlots && !isSelected ? `
            <div style="margin-top: 0.25rem; font-size: 0.7rem; color: #10b981; font-weight: 600;">
              ${daySlots.length} slot${daySlots.length > 1 ? 's' : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    // Next month days
    const remainingCells = 42 - (startDay + totalDays);
    for (let i = 1; i <= remainingCells; i++) {
      calendarHTML += `
        <div style="padding: 1rem; text-align: center; opacity: 0.3; background: var(--color-light); border-radius: 8px; min-height: 60px;">
          <div style="font-size: 1rem;">${i}</div>
        </div>
      `;
    }

    calendarHTML += `
        </div>
        <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(16, 185, 129, 0.1); border-radius: 8px; border: 1px solid #10b981;">
          <p style="margin: 0; font-size: 0.9rem; color: #10b981; text-align: center;">
            <i class="fas fa-info-circle"></i> Click on a date with available slots to select your preferred time
          </p>
        </div>
      </div>
    `;

    const container = document.getElementById('booking-calendar');
    if (container) {
      container.innerHTML = calendarHTML;
    }
  }

  // Select a date and show available slots
  window.selectDate = function(dateStr) {
    selectedDate = dateStr;
    selectedTime = null;
    renderBookingCalendar(currentCalendarDate);
    showTimeSlots(dateStr);
  };

  // Show available time slots for selected date
  function showTimeSlots(dateStr) {
    const availableSlots = DataManager.timeslots.getAvailable();
    const daySlots = availableSlots.filter(slot => slot.date === dateStr);

    const selectedDateObj = new Date(dateStr);
    const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    let slotsHTML = `
      <div style="background: var(--color-white); padding: 2rem; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-top: 2rem;">
        <h3 style="margin: 0 0 1.5rem 0; color: var(--color-dark);">
          <i class="fas fa-clock"></i> Select Your Preferred Time
        </h3>
        <p style="margin: 0 0 1.5rem 0; color: var(--color-text-light);">
          Available slots for <strong>${formattedDate}</strong>
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem;">
    `;

    if (daySlots.length > 0) {
      daySlots.forEach(slot => {
        const isSelected = selectedTime === slot.id;
        slotsHTML += `
          <button type="button" onclick="selectTimeSlot('${slot.id}', '${slot.startTime}')" style="
            padding: 1rem;
            background: ${isSelected ? 'var(--color-primary)' : 'var(--color-light)'};
            color: ${isSelected ? 'white' : 'var(--color-dark)'};
            border: 2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'};
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          " onmouseover="if(!this.classList.contains('selected')) this.style.background='rgba(197, 0, 119, 0.1)'" onmouseout="if(!this.classList.contains('selected')) this.style.background='var(--color-light)'">
            <i class="fas fa-clock"></i> ${slot.startTime}
          </button>
        `;
      });
    } else {
      slotsHTML += `
        <p style="grid-column: 1 / -1; text-align: center; color: var(--color-text-light); padding: 2rem;">
          No available slots for this date. Please select another date.
        </p>
      `;
    }

    slotsHTML += `
        </div>
      </div>
    `;

    const container = document.getElementById('time-slots-container');
    if (container) {
      container.innerHTML = slotsHTML;
      container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // Select a time slot
  window.selectTimeSlot = function(slotId, time) {
    selectedTime = slotId;
    document.getElementById('selected-date').value = selectedDate;
    document.getElementById('selected-time').value = time;
    document.getElementById('selected-slot-id').value = slotId;
    showTimeSlots(selectedDate);

    // Show confirmation message
    const confirmationDiv = document.getElementById('selection-confirmation');
    if (confirmationDiv) {
      const dateObj = new Date(selectedDate);
      confirmationDiv.innerHTML = `
        <div style="background: rgba(16, 185, 129, 0.1); padding: 1rem; border-radius: 8px; border: 1px solid #10b981; margin-top: 1rem;">
          <p style="margin: 0; color: #10b981; font-weight: 600;">
            <i class="fas fa-check-circle"></i> Selected: ${dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${time}
          </p>
        </div>
      `;
    }
  };

  // Form submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Validate that date and time are selected
      if (!selectedDate || !selectedTime) {
        alert('Please select a date and time for your consultation.');
        return;
      }

      // Get form data
      const formData = {
        name: document.getElementById('booking-name').value,
        email: document.getElementById('booking-email').value,
        phone: document.getElementById('booking-phone').value,
        company: document.getElementById('booking-company').value,
        service: document.getElementById('booking-service').value,
        preferredDate: selectedDate,
        preferredTime: document.getElementById('selected-time').value,
        timeSlotId: selectedTime,
        message: document.getElementById('booking-message').value
      };

      try {
        // Create consultation
        const consultation = DataManager.consultations.create(formData);

        // Book the time slot
        DataManager.timeslots.book(selectedTime, consultation.id);

        // Show success message
        alert('Your consultation has been booked successfully! We will send you a confirmation email shortly.');

        // Reset form
        bookingForm.reset();
        selectedDate = null;
        selectedTime = null;
        renderBookingCalendar(currentCalendarDate);
        document.getElementById('time-slots-container').innerHTML = '';
        document.getElementById('selection-confirmation').innerHTML = '';

      } catch (error) {
        alert('Error booking consultation: ' + error.message);
      }
    });
  }

  console.log('Waarheid Booking Page - Interactive Calendar Loaded');
});
