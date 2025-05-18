(() => {
  const ADMIN_PASSWORD = 'adminsimpul'; // Change as needed or load from backend in production
  const TIMEZONE_OFFSET = 7; // GMT+7

  const adminPasswordPrompt = document.getElementById('admin-password-prompt');
  const adminLoginBtn = document.getElementById('admin-login-btn');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminPasswordError = document.getElementById('admin-password-error');
  const adminPanel = document.getElementById('admin-panel');
  const feedbackList = document.getElementById('feedback-list');
  const clearDataBtn = document.getElementById('clear-data-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');

  // Function to escape HTML for safe output
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  // Render feedback list
  function renderFeedbacks(feedbacks) {
    if (!feedbacks || feedbacks.length === 0) {
      feedbackList.innerHTML = '<p class="no-feedback">Belum ada masukan yang dikirim.</p>';
      return;
    }
    feedbackList.innerHTML = '';
    feedbacks.forEach(fb => {
      const fbItem = document.createElement('div');
      fbItem.className = 'feedback-item';
      fbItem.innerHTML = `
        <div class="feedback-info"><strong>Jenis:</strong> ${escapeHtml(fb.type)} | <strong>Kategori:</strong> ${escapeHtml(fb.category)} | <strong>Waktu:</strong> ${new Date(fb.timestamp).toLocaleString('id-ID')}</div>
        <div class="feedback-message">${escapeHtml(fb.message).replace(/\n/g, '<br>')}</div>
      `;
      feedbackList.appendChild(fbItem);
    });
  }

  // Fetch all feedback from backend API
  async function fetchFeedbacks() {
    try {
      const response = await fetch('../api/masukan.php', {
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + ADMIN_PASSWORD)
        }
      });
      if (!response.ok) {
        throw new Error('Gagal mengambil data masukan');
      }
      const data = await response.json();
      renderFeedbacks(data);
    } catch (error) {
      feedbackList.innerHTML = '<p class="no-feedback">Tidak dapat memuat data masukan.</p>';
      console.error(error);
    }
  }

  // Delete all feedback (admin only)
  async function clearAllFeedback() {
    if (!confirm('Anda yakin ingin menghapus semua data masukan? Data yang sudah dihapus tidak bisa dikembalikan.')) return;
    try {
      const response = await fetch('../api/masukan', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Basic ' + btoa('admin:' + ADMIN_PASSWORD)
        }
      });
      if (!response.ok) {
        throw new Error('Gagal menghapus data');
      }
      await fetchFeedbacks();
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus data.');
      console.error(error);
    }
  }

  // Admin login handler
  adminLoginBtn.addEventListener('click', () => {
    const enteredPassword = adminPasswordInput.value;
    if (enteredPassword === ADMIN_PASSWORD) {
      adminPasswordPrompt.style.display = 'none';
      adminPanel.style.display = 'block';
      adminPasswordError.style.display = 'none';
      fetchFeedbacks();
    } else {
      adminPasswordError.style.display = 'block';
      adminPasswordInput.focus();
      adminPasswordInput.select();
    }
  });

  // Admin logout handler
  adminLogoutBtn.addEventListener('click', () => {
    adminPanel.style.display = 'none';
    adminPasswordPrompt.style.display = 'flex';
    adminPasswordInput.value = '';
    adminPasswordError.style.display = 'none';
    feedbackList.innerHTML = '';
    adminPasswordInput.focus();
  });
  
  // Clear data button click
  clearDataBtn.addEventListener('click', clearAllFeedback);
})();
