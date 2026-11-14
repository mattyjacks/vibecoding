window.VCAD2 = window.VCAD2 || {};

window.VCAD2.AuthGate = {
  SESSION_KEY: 'vcad2_auth_unlocked',

  getRequiredPassword() {
    // Supports injected window.VCAD2_ENV.PRODUCTION_PASSWORD or localStorage override
    const envPass = window.VCAD2_ENV && window.VCAD2_ENV.PRODUCTION_PASSWORD;
    return (envPass !== undefined ? envPass : localStorage.getItem('vcad2_prod_password')) || '';
  },

  init() {
    const required = this.getRequiredPassword();
    const overlay = document.getElementById('auth-gate');
    if (!overlay) return;

    if (!required || sessionStorage.getItem(this.SESSION_KEY) === required) {
      overlay.classList.add('hidden');
      return;
    }

    overlay.classList.remove('hidden');
    const input = document.getElementById('auth-password-input');
    const err = document.getElementById('auth-error');
    const btn = document.getElementById('btn-auth-unlock');

    const attempt = () => {
      if (input.value === required) {
        sessionStorage.setItem(this.SESSION_KEY, required);
        overlay.classList.add('hidden');
        err.textContent = '';
      } else {
        err.textContent = 'Invalid production password.';
        input.value = '';
        input.focus();
      }
    };

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') attempt();
    });
  }
};
