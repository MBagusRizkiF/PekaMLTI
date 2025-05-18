/**
 * Form Submission Handler for Anonymous Feedback System
 * @version 1.1
 * @description Handles form submission with robust error handling and debugging
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const feedbackForm = document.getElementById('feedback-form');
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');
  const submitButton = feedbackForm?.querySelector('button[type="submit"]');

  // Validate essential elements exist
  if (!feedbackForm || !successMessage || !errorMessage || !submitButton) {
    console.error('Critical form elements missing! Check your HTML structure.');
    return;
  }

  // API Configuration
  const API_ENDPOINT = './api/masukan.php';
  const DEBUG_MODE = false; // Set to false in production, true for debugging

  /**
   * Display feedback message to user
   * @param {HTMLElement} element - The message container
   * @param {string} message - The message text
   * @param {boolean} isVisible - Whether to show the message
   */
  const showMessage = (element, message, isVisible) => {
    if (element && message) {
      element.textContent = message;
      element.style.display = isVisible ? 'block' : 'none';
    }
  };

  /**
   * Toggle submit button state
   * @param {boolean} isSubmitting - Whether form is being submitted
   */
  const toggleSubmitState = (isSubmitting) => {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? 'Mengirim...' : 'Kirim';
  };

  /**
   * Validate form inputs
   * @returns {boolean} True if validation passes
   */
  const validateForm = () => {
    const type = feedbackForm.type.value;
    const category = feedbackForm.category.value;
    const message = feedbackForm.message.value.trim();

    if (!type) {
      showMessage(errorMessage, 'Silakan pilih jenis masukan', true);
      feedbackForm.type.focus();
      return false;
    }

    if (!category) {
      showMessage(errorMessage, 'Silakan pilih kategori', true);
      feedbackForm.category.focus();
      return false;
    }

    if (message.length < 10) {
      showMessage(errorMessage, 'Pesan harus minimal 10 karakter', true);
      feedbackForm.message.focus();
      return false;
    }

    return true;
  };

  /**
   * Handle form submission
   * @param {Event} e - The submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    showMessage(successMessage, '', false);
    showMessage(errorMessage, '', false);

    // Validate inputs
    if (!validateForm()) return;

    // Prepare data
    const formData = {
      type: feedbackForm.type.value,
      category: feedbackForm.category.value,
      message: feedbackForm.message.value.trim()
    };

    if (DEBUG_MODE) {
      console.log('Submitting data:', formData);
    }

    try {
      toggleSubmitState(true);

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (DEBUG_MODE) {
        console.log('Response status:', response.status);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message || 
          `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      if (DEBUG_MODE) {
        console.log('Success response:', data);
      }

      feedbackForm.reset();
      showMessage(
        successMessage, 
        data.message || 'Terima kasih atas masukan Anda!', 
        true
      );
    } catch (error) {
      console.error('Submission error:', error);
      showMessage(
        errorMessage,
        error.message || 'Gagal mengirim masukan. Silakan coba lagi.',
        true
      );
    } finally {
      toggleSubmitState(false);
    }
  };

  // Event Listeners
  feedbackForm.addEventListener('submit', handleSubmit);

  // Debug info
  if (DEBUG_MODE) {
    console.log('Form handler initialized');
    console.log('API Endpoint:', API_ENDPOINT);
  }
});