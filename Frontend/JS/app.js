const API_BASE_URL = 'https://seyat-kahani-portal-mfta-dauiv688a.vercel.app/api/auth';
//const API_BASE_URL = 'http://localhost:5000/api/auth';

const API_ROOT = 'https://seyat-kahani-portal-mfta-dauiv688a.vercel.app/api';
//const API_ROOT = 'http://localhost:5000/api';

// Google Client ID is a public identifier (not a secret) — safe to ship in frontend code.
// Replace this with your own, created at https://console.cloud.google.com/apis/credentials
// under "OAuth client ID" -> "Web application", with this site's URL added under
// "Authorized JavaScript origins".
const GOOGLE_CLIENT_ID = '282699693500-8qqd5uq7lsj7darvl26dolebkqso1s4v.apps.googleusercontent.com';

// Shared by login.html and sign-up.html — the backend's /api/auth/google endpoint
// handles both "log an existing Google user in" and "create a new one" itself, so
// both pages can point at this exact same handler.
async function handleGoogleCredential(response) {
    const errorEl = document.querySelector('#googleAuthError');
    if (errorEl) errorEl.textContent = '';

    try {
        const res = await fetch(`${API_BASE_URL}/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken: response.credential })
        });
        const data = await res.json();

        if (!res.ok) {
            if (errorEl) errorEl.textContent = data.message || 'Google sign-in failed.';
            return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        const targetUrl = data.user && data.user.role === 'doctor'
            ? '/Frontend/HTML/doctor-dashboard.html'
            : '/Frontend/HTML/patient-dashboard.html';
        window.location.href = targetUrl;
    } catch (error) {
        console.error('Google sign-in error:', error);
        if (errorEl) errorEl.textContent = 'Unable to reach the server. Please try again.';
    }
}

// The GSI script tag is async/defer, so wait for window 'load' before assuming
// `google.accounts.id` exists.
if (document.querySelector('#googleButtonContainer')) {
    window.addEventListener('load', () => {
        const container = document.querySelector('#googleButtonContainer');
        if (!container || typeof google === 'undefined' || !google.accounts?.id) return;
        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential
        });
        google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
    });
}


function switchTab(role) {
    const patientTab = document.querySelector('#patientTab');
    const doctorTab = document.querySelector('#doctorTab');
    const roleIndicator = document.querySelector('#roleIndicator');
    const roleIcon = document.querySelector('#roleIcon');
    const roleText = document.querySelector('#roleText');

    if (!patientTab || !doctorTab || !roleIndicator || !roleIcon || !roleText) {
        return;
    }

    if (role === 'patient') {
        patientTab.classList.add('active-tab');
        patientTab.classList.remove('inactive-tab');
        doctorTab.classList.add('inactive-tab');
        doctorTab.classList.remove('active-tab');
        roleText.textContent = 'Logging in as Patient';
        roleIndicator.classList.remove('doctor-mode');
        roleIcon.innerHTML = '<circle cx="12" cy="8" r="4"></circle><path d="M4 21v-1a7 7 0 0 1 14 0v1"></path>';
        return;
    }

    doctorTab.classList.add('active-tab');
    doctorTab.classList.remove('inactive-tab');
    patientTab.classList.add('inactive-tab');
    patientTab.classList.remove('active-tab');
    roleText.textContent = 'Logging in as Doctor';
    roleIndicator.classList.add('doctor-mode');
    roleIcon.innerHTML = '<path d="M19 8V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v3"></path><rect x="2" y="8" width="20" height="13" rx="2"></rect><path d="M12 12v4"></path><path d="M10 14h4"></path>';
}




    // login form validation and submission starts from here


    const loginForm = document.querySelector('#loginForm');

    if (loginForm) {
        const emailInput = loginForm.querySelector('#email');
        const passwordInput = loginForm.querySelector('#password');
        const togglePasswordButton = loginForm.querySelector('#togglePassword');
        const submitBtn = loginForm.querySelector('#submitBtn');
        const submitLabel = loginForm.querySelector('#submitLabel');
        const submitArrow = loginForm.querySelector('#submitArrow');
        const doctorTab = document.querySelector('#doctorTab');

        const createErrorElement = (input) => {
            const errorElement = document.createElement('div');
            errorElement.style.color = '#c62828';
            errorElement.style.fontSize = '0.875rem';
            errorElement.style.lineHeight = '1.3';
            errorElement.style.marginTop = '0.35rem';
            errorElement.style.minHeight = '1.1em';
            errorElement.setAttribute('aria-live', 'polite');
            input.insertAdjacentElement('afterend', errorElement);
            return errorElement;
        };

        const emailError = createErrorElement(emailInput);
        const passwordError = createErrorElement(passwordInput);

        const showError = (input, errorElement, message) => {
            errorElement.textContent = message;
            input.style.borderColor = '#c62828';
        };

        const clearError = (input, errorElement) => {
            errorElement.textContent = '';
            input.style.borderColor = '';
        };

        if (togglePasswordButton && passwordInput) {
            togglePasswordButton.addEventListener('click', () => {
                passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
            });
        }

        if (emailInput) {
            emailInput.addEventListener('input', () => clearError(emailInput, emailError));
        }

        if (passwordInput) {
            passwordInput.addEventListener('input', () => clearError(passwordInput, passwordError));
        }

        const loginServerError = document.querySelector('#loginServerError');

        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const emailValue = emailInput ? emailInput.value.trim() : '';
            const passwordValue = passwordInput ? passwordInput.value : '';
            let isValid = true;

            clearError(emailInput, emailError);
            clearError(passwordInput, passwordError);
            if (loginServerError) {
                loginServerError.textContent = '';
            }

            if (!emailValue) {
                showError(emailInput, emailError, 'Email is required.');
                isValid = false;
            } else if (!emailValue.includes('@')) {
                showError(emailInput, emailError, 'Email must contain @.');
                isValid = false;
            }

            if (!passwordValue) {
                showError(passwordInput, passwordError, 'Password is required.');
                isValid = false;
            } else if (passwordValue.length < 8) {
                showError(passwordInput, passwordError, 'Password must be at least 8 characters.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            if (submitBtn && submitLabel && submitArrow) {
                submitBtn.disabled = true;
                submitLabel.textContent = 'Signing in...';
                submitArrow.style.display = 'none';
            }

            try {
                const response = await fetch(`${API_BASE_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: emailValue, password: passwordValue })
                });

                const data = await response.json();

                if (!response.ok) {
                    if (loginServerError) {
                        loginServerError.textContent = data.message || 'Invalid Credentials!';
                    }
                    return;
                }

                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                const targetUrl = data.user && data.user.role === 'doctor'
                    ? '/Frontend/HTML/doctor-dashboard.html'
                    : '/Frontend/HTML/patient-dashboard.html';

                window.location.href = targetUrl;
            } catch (error) {
                if (loginServerError) {
                    loginServerError.textContent = 'Unable to reach the server. Please try again.';
                }
            } finally {
                if (submitBtn && submitLabel && submitArrow) {
                    submitBtn.disabled = false;
                    submitLabel.textContent = 'SIGN IN TO PORTAL';
                    submitArrow.style.display = '';
                }
            }
        });
    }

    const currentDate = document.querySelector('#currentDate');
    if (currentDate) {
        const now = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        currentDate.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }

    document.querySelectorAll('tbody tr').forEach((row) => {
        row.addEventListener('mouseenter', () => {
            row.style.transform = 'translateX(4px)';
        });
        row.addEventListener('mouseleave', () => {
            row.style.transform = 'translateX(0px)';
        });
    });

// login form validation and submission ends here


// sign in functionality starts from here 



function showToast() {
    var toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(function() {
      toast.classList.remove('show');
    }, 3000);
  }

  function togglePassword() {
    var pwd = document.getElementById('password');
    var btn = document.getElementById('toggleBtn');
    if (pwd.type === 'password') {
      pwd.type = 'text';
      btn.textContent = 'Hide';
    } else {
      pwd.type = 'password';
      btn.textContent = 'Show';
    }
  }

  const signupTerms = document.querySelector('#terms');
  const signupForm = signupTerms ? signupTerms.closest('form') : null;

  if (signupForm) {
      const nameInput = signupForm.querySelector('#name');
      const emailInput = signupForm.querySelector('#email');
      const phoneInput = signupForm.querySelector('#phone');
      const passwordInput = signupForm.querySelector('#password');
      const termsInput = signupForm.querySelector('#terms');
      const submitButton = signupForm.querySelector('.submit-btn');

      const sanitizePhone = function(value) {
          let sanitizedValue = value.replace(/[^\d+]/g, '');

          if (sanitizedValue.startsWith('00')) {
              sanitizedValue = `+${sanitizedValue.slice(2)}`;
          }

          if (sanitizedValue.includes('+')) {
              sanitizedValue = `+${sanitizedValue.slice(1).replace(/\+/g, '')}`;
          }

          return sanitizedValue;
      };

      const formatPhone = function(value) {
          const digits = sanitizePhone(value).replace(/\D/g, '');

          if (digits.startsWith('92')) {
              const subscriberDigits = digits.slice(2, 12);
              return `+92 ${subscriberDigits.slice(0, 3)}${subscriberDigits.length > 3 ? ` ${subscriberDigits.slice(3)}` : ''}`.trim();
          }

          if (digits.startsWith('0')) {
              const localDigits = digits.slice(0, 11);
              return `${localDigits.slice(0, 4)}${localDigits.length > 4 ? ` ${localDigits.slice(4)}` : ''}`.trim();
          }

          if (digits.startsWith('3')) {
              const subscriberDigits = digits.slice(0, 10);
              return `+92 ${subscriberDigits.slice(0, 3)}${subscriberDigits.length > 3 ? ` ${subscriberDigits.slice(3)}` : ''}`.trim();
          }

          return sanitizePhone(value).slice(0, 15);
      };

      const validatePhone = function(value) {
          const phoneDigits = sanitizePhone(value).replace(/\D/g, '');

          if (!phoneDigits) {
              return '';
          }

          if (!/^(?:92|0)?3\d{9}$/.test(phoneDigits)) {
              return 'Enter a valid Pakistani phone number, e.g. +92 300 1234567.';
          }

          return '';
      };

      signupForm.removeAttribute('onsubmit');

      const fieldConfig = [
          {
              input: nameInput,
              wrapper: nameInput ? nameInput.closest('.field') : null,
              validate: function(value) {
                  if (!value) {
                      return 'Full name is required.';
                  }

                  if (value.length < 3) {
                      return 'Full name must be at least 3 characters.';
                  }

                  if (!/^[a-zA-Z\s'.-]+$/.test(value)) {
                      return 'Full name can only contain letters and common name characters.';
                  }

                  return '';
              }
          },
          {
              input: emailInput,
              wrapper: emailInput ? emailInput.closest('.field') : null,
              validate: function(value) {
                  if (!value) {
                      return 'Email is required.';
                  }

                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                      return 'Enter a valid email address.';
                  }

                  return '';
              }
          },
          {
              input: passwordInput,
              wrapper: passwordInput ? passwordInput.closest('.field') : null,
              validate: function(value) {
                  if (!value) {
                      return 'Password is required.';
                  }

                  if (value.length < 8) {
                      return 'Password must be at least 8 characters.';
                  }

                  if (!/[A-Za-z]/.test(value) || !/\d/.test(value)) {
                      return 'Password must include both letters and numbers.';
                  }

                  return '';
              }
          }
      ];

      const phoneFieldConfig = {
          input: phoneInput,
          wrapper: phoneInput ? phoneInput.closest('.field') : null,
          validate: validatePhone
      };

      fieldConfig.push(phoneFieldConfig);

      const createErrorElement = function(wrapper) {
          if (!wrapper) {
              return null;
          }

          let errorElement = wrapper.querySelector('.field-error');

          if (!errorElement) {
              errorElement = document.createElement('div');
              errorElement.className = 'field-error';
              errorElement.style.color = '#c62828';
              errorElement.style.fontSize = '0.875rem';
              errorElement.style.lineHeight = '1.3';
              errorElement.style.marginTop = '0.35rem';
              errorElement.style.minHeight = '1.1em';
              errorElement.style.display = 'block';
              errorElement.setAttribute('aria-live', 'polite');
              wrapper.appendChild(errorElement);
          }

          return errorElement;
      };

      const setErrorState = function(input, wrapper, message) {
          const errorElement = createErrorElement(wrapper);

          if (input) {
              input.style.borderColor = '#c62828';
              input.style.boxShadow = '0 0 0 1px #c62828';
              input.setAttribute('aria-invalid', 'true');
          }

          if (errorElement) {
              errorElement.textContent = message;
          }
      };

      const clearErrorState = function(input, wrapper) {
          const errorElement = wrapper ? wrapper.querySelector('.field-error') : null;

          if (input) {
              input.style.borderColor = '';
              input.style.boxShadow = '';
              input.removeAttribute('aria-invalid');
          }

          if (errorElement) {
              errorElement.textContent = '';
          }
      };

      const validateField = function(config) {
          if (!config.input) {
              return true;
          }

          const value = config.input.value.trim();
          const message = config.validate(value);

          if (message) {
              setErrorState(config.input, config.wrapper, message);
              return false;
          }

          clearErrorState(config.input, config.wrapper);
          return true;
      };

      fieldConfig.forEach(function(config) {
          if (!config.input) {
              return;
          }

          config.input.addEventListener('input', function() {
              validateField(config);
          });
      });

      if (phoneInput) {
          phoneInput.setAttribute('inputmode', 'tel');
          phoneInput.setAttribute('autocomplete', 'tel');
          phoneInput.setAttribute('maxlength', '16');

          phoneInput.addEventListener('keydown', function(event) {
              const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Tab'];

              if (event.ctrlKey || event.metaKey) {
                  return;
              }

              if (!allowedKeys.includes(event.key) && !/^\d$/.test(event.key) && event.key !== '+') {
                  event.preventDefault();
              }
          });

          phoneInput.addEventListener('input', function() {
              phoneInput.value = formatPhone(phoneInput.value);
              validateField(phoneFieldConfig);
          });
      }

      if (termsInput) {
          termsInput.addEventListener('change', function() {
              const termsError = signupForm.querySelector('.terms-error');

              if (termsInput.checked && termsError) {
                  termsError.textContent = '';
                  termsInput.style.outline = '';
                  termsInput.removeAttribute('aria-invalid');
              }
          });
      }

      const signupServerError = document.querySelector('#signupServerError');

      signupForm.addEventListener('submit', async function(event) {
          event.preventDefault();

          if (signupServerError) {
              signupServerError.textContent = '';
          }

          let isValid = true;

          fieldConfig.forEach(function(config) {
              const fieldIsValid = validateField(config);

              if (!fieldIsValid) {
                  isValid = false;
              }
          });

          if (!termsInput || !termsInput.checked) {
              let termsError = signupForm.querySelector('.terms-error');

              if (!termsError) {
                  termsError = document.createElement('div');
                  termsError.className = 'field-error terms-error';
                  termsError.style.color = '#c62828';
                  termsError.style.fontSize = '0.875rem';
                  termsError.style.lineHeight = '1.3';
                  termsError.style.marginTop = '0.35rem';
                  termsError.style.minHeight = '1.1em';
                  termsError.style.display = 'block';
                  termsError.setAttribute('aria-live', 'polite');
                  const termsRow = signupForm.querySelector('.terms-row');

                  if (termsRow) {
                      termsRow.appendChild(termsError);
                  }
              }

              if (termsError) {
                  termsError.textContent = 'You must accept the Terms of Service and Privacy Policy.';
              }

              if (termsInput) {
                  termsInput.style.outline = '1px solid #c62828';
                  termsInput.setAttribute('aria-invalid', 'true');
              }

              isValid = false;
          } else {
              const existingTermsError = signupForm.querySelector('.terms-error');

              if (existingTermsError) {
                  existingTermsError.textContent = '';
              }

              if (termsInput) {
                  termsInput.style.outline = '';
                  termsInput.removeAttribute('aria-invalid');
              }
          }

          if (!isValid) {
              return;
          }

          if (submitButton) {
              submitButton.disabled = true;
              submitButton.textContent = 'Creating Account...';
          }

          try {
              const response = await fetch(`${API_BASE_URL}/signup`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      name: nameInput.value.trim(),
                      email: emailInput.value.trim(),
                      password: passwordInput.value,
                      phone: sanitizePhone(phoneInput ? phoneInput.value : '')
                  })
              });

              const data = await response.json();

              if (!response.ok) {
                  if (signupServerError) {
                      signupServerError.textContent = data.message || 'Unable to create account.';
                  }
                  if (submitButton) {
                      submitButton.disabled = false;
                      submitButton.textContent = 'Create Account';
                  }
                  return;
              }

              showToast();
              setTimeout(function() {
                  window.location.href = '../HTML/login.html';
              }, 2000);
          } catch (error) {
              if (signupServerError) {
                  signupServerError.textContent = 'Unable to reach the server. Please try again.';
              }
              if (submitButton) {
                  submitButton.disabled = false;
                  submitButton.textContent = 'Create Account';
              }
          }
      });
  }


// sign in functionality ends here: 


// doctor dashboard functionality starts from here:




// patient directory functionality starts from here:

  // Search focus ring
  var searchInput = document.querySelector('.search-wrap input');
    if (searchInput) {
        searchInput.addEventListener('focus', function () {
            searchInput.style.boxShadow = '0 0 0 2px rgba(50,79,70,0.2)';
        });
        searchInput.addEventListener('blur', function () {
            searchInput.style.boxShadow = 'none';
        });
    }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  // Page switching
  document.querySelectorAll('.page-btn').forEach(function (btn) {
    if (btn.textContent.trim().match(/^\d+$/)) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.page-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
    }
  });

// patient directory functionality ends here:


// doctor dashboard functionality ends here:



// shared mobile navigation toggle for dashboard pages starts here:

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const sideNav = document.querySelector('.sidenav, aside.sidebar');

    function closeMobileMenu() {
        if (sideNav) {
            sideNav.classList.remove('mobile-open');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.remove('visible');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'false');
            mobileMenuToggle.setAttribute('aria-label', 'Open navigation menu');
        }
    }

    function openMobileMenu() {
        if (sideNav) {
            sideNav.classList.add('mobile-open');
        }
        if (mobileNavOverlay) {
            mobileNavOverlay.classList.add('visible');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.setAttribute('aria-expanded', 'true');
            mobileMenuToggle.setAttribute('aria-label', 'Close navigation menu');
        }
    }

    if (mobileMenuToggle && sideNav) {
        mobileMenuToggle.addEventListener('click', function () {
            const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });

        sideNav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    window.addEventListener('resize', function () {
        if (window.innerWidth > 900) {
            closeMobileMenu();
        }
    });

// shared mobile navigation toggle for dashboard pages ends here:

// patient-dashboard functionality starts from here:

  function logoutUser(event) {
    if (event) event.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/Frontend/HTML/login.html';
  }

    document.querySelectorAll('.logout-link').forEach(function (logoutLink) {
    logoutLink.addEventListener('click', logoutUser);
    });

 // Simple micro-interaction for smooth scrolling or active states
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (event) {
        const target = document.querySelector(anchor.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    //   health-vault functionality starts from here:

 // Micro-interactions for buttons
  document.querySelectorAll('button').forEach(function(button){
    button.addEventListener('mousedown', function(){ button.style.transform = 'scale(0.98)'; });
    button.addEventListener('mouseup', function(){ button.style.transform = 'scale(1)'; });
    button.addEventListener('mouseleave', function(){ button.style.transform = 'scale(1)'; });
  });


    //   health-vault functionality ends here:


    // medical-records functionality starts from here:
    
document.querySelectorAll('.doc-row').forEach(item => {
        item.addEventListener('mouseenter', () => { item.style.transform = 'translateX(4px)'; });
        item.addEventListener('mouseleave', () => { item.style.transform = 'translateX(0)'; });
    });

    // medical-records functionality ends here:

// ===================== Appointments module =====================

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
  };
}

// ---------- Booking modal (patient-dashboard.html) ----------
const bookApptBtn = document.querySelector('#bookApptBtn');
const bookingModalOverlay = document.querySelector('#bookingModalOverlay');
const closeBookingModal = document.querySelector('#closeBookingModal');
const bookingForm = document.querySelector('#bookingForm');
const doctorSelect = document.querySelector('#doctorSelect');
const bookingError = document.querySelector('#bookingError');

async function loadDoctorsIntoSelect() {
  if (!doctorSelect) return;
  try {
    const res = await fetch(`${API_ROOT}/doctors`, { headers: authHeaders() });
    const doctors = await res.json();
    doctorSelect.innerHTML = '';
    doctors.forEach((doc) => {
      const option = document.createElement('option');
      option.value = doc._id;
      option.textContent = doc.name;
      doctorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Failed to load doctors:', error);
  }
}

const closeBookingModalSecondary = document.querySelector('#closeBookingModalSecondary');

function showBookingModal() {
  if (!bookingModalOverlay) return;
  const dateInput = document.querySelector('#apptDate');
  if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);
  bookingModalOverlay.style.display = 'flex';
  bookingModalOverlay.setAttribute('aria-hidden', 'false');
  bookingModalOverlay.classList.add('visible');
  loadDoctorsIntoSelect();
}

function hideBookingModal() {
  if (!bookingModalOverlay) return;
  bookingModalOverlay.style.display = 'none';
  bookingModalOverlay.setAttribute('aria-hidden', 'true');
  bookingModalOverlay.classList.remove('visible');
  if (bookingForm) bookingForm.reset();
  if (bookingError) bookingError.textContent = '';
}

if (bookApptBtn && bookingModalOverlay) {
  bookApptBtn.addEventListener('click', showBookingModal);
}

if (closeBookingModal && bookingModalOverlay) {
  closeBookingModal.addEventListener('click', hideBookingModal);
}

if (closeBookingModalSecondary && bookingModalOverlay) {
  closeBookingModalSecondary.addEventListener('click', hideBookingModal);
}

if (bookingModalOverlay) {
  bookingModalOverlay.addEventListener('click', (event) => {
    if (event.target === bookingModalOverlay) hideBookingModal();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && bookingModalOverlay && bookingModalOverlay.style.display === 'flex') {
    hideBookingModal();
  }
});

if (bookingForm) {
  bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (bookingError) bookingError.textContent = '';

    const doctorId = doctorSelect.value;
    const date = document.querySelector('#apptDate').value;
    const time = document.querySelector('#apptTime').value;
    const reason = document.querySelector('#apptReason').value;

    try {
      const res = await fetch(`${API_ROOT}/appointments`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ doctorId, date, time, reason })
      });
      const data = await res.json();

      if (!res.ok) {
        if (bookingError) bookingError.textContent = data.message || 'Booking failed';
        return;
      }

      hideBookingModal();
      if (typeof loadMyAppointments === 'function') {
        loadMyAppointments();
      }
    } catch (error) {
      console.error('Booking error:', error);
      if (bookingError) bookingError.textContent = 'Unable to reach the server. Please try again.';
    }
  });
}

// ---------- Load + render patient's own appointments ----------
const upcomingApptContainer = document.querySelector('#upcomingApptContainer');
const userProfileName = document.querySelector('#userProfileName');
const userProfileRole = document.querySelector('#userProfileRole');
const userAvatarCircle = document.querySelector('#userAvatarCircle');
const dashboardGreeting = document.querySelector('#dashboardGreeting');
const upcomingVisitsBadge = document.querySelector('#upcomingVisitsBadge');
const upcomingVisitsValue = document.querySelector('#upcomingVisitsValue');
const recentAppointmentsContainer = document.querySelector('#recentAppointmentsContainer');
const patientDashboardSearch = document.querySelector('.search-wrap input[placeholder="Search records, doctors, or help..."]');
const viewCalendarLink = document.querySelector('#viewCalendarLink');
const patientDashboard = document.querySelector('#upcomingApptContainer');
const prescriptionValue = document.querySelector('#prescriptionValue');
const prescriptionBadge = document.querySelector('#prescriptionBadge');
const messagesValue = document.querySelector('#messagesValue');
const goalProgressValue = document.querySelector('#goalProgressValue');
const goalProgressLabel = document.querySelector('#goalProgressLabel');
const wellnessTipText = document.querySelector('#wellnessTipText');
const APPT_PAGE_SIZE = 2;
let upcomingAppointments = [];
let currentUpcomingPage = 1;
let recentAppointments = [];
let currentRecentPage = 1;

function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'P';
}

function getDisplayName(user) {
  if (!user || !user.name) return 'Patient';
  return user.name.trim();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function loadCurrentUserProfile() {
  try {
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (parsedUser?.name) {
      const fullName = getDisplayName(parsedUser);
      const firstName = fullName.split(' ')[0] || fullName;

      if (userProfileName) {
        userProfileName.textContent = fullName;
      }

      if (userProfileRole) {
        userProfileRole.textContent = parsedUser.role === 'doctor' ? 'Doctor' : 'Premium Member';
      }

      if (userAvatarCircle) {
        userAvatarCircle.textContent = getInitials(fullName);
      }

      if (dashboardGreeting) {
        const hour = new Date().getHours();
        const label = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
        dashboardGreeting.textContent = `${label}, ${firstName}`;
      }

      return;
    }

    if (userProfileName) {
      userProfileName.textContent = 'Patient';
    }
    if (userProfileRole) {
      userProfileRole.textContent = 'Premium Member';
    }
    if (userAvatarCircle) {
      userAvatarCircle.textContent = 'P';
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
    if (userProfileName) {
      userProfileName.textContent = 'Patient';
    }
    if (userProfileRole) {
      userProfileRole.textContent = 'Premium Member';
    }
    if (userAvatarCircle) {
      userAvatarCircle.textContent = 'P';
    }
  }
}

function updateUpcomingVisitsSummary() {
  if (!upcomingVisitsBadge || !upcomingVisitsValue) return;

  const validAppointments = upcomingAppointments.filter((appt) => {
    if (!appt || !appt.date) return false;
    const status = (appt.status || '').toLowerCase();
    if (['cancelled', 'completed'].includes(status)) return false;
    const appointmentDate = new Date(`${appt.date}T${appt.time || '00:00'}`);
    return !Number.isNaN(appointmentDate.getTime());
  });

  if (validAppointments.length === 0) {
    upcomingVisitsBadge.textContent = 'Next: --';
    upcomingVisitsValue.textContent = '0 Appointments';
    return;
  }

  const nextAppointment = validAppointments.sort((a, b) => {
    const first = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
    const second = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
    return first - second;
  })[0];

  const nextDate = new Date(`${nextAppointment.date}T${nextAppointment.time || '00:00'}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = nextDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dayText = diffDays <= 0 ? 'Today' : `${diffDays} day${diffDays === 1 ? '' : 's'}`;
  upcomingVisitsBadge.textContent = `Next: ${dayText}`;
  upcomingVisitsValue.textContent = `${validAppointments.length} Appointment${validAppointments.length === 1 ? '' : 's'}`;
}

function getAppointmentSortValue(appt) {
  const datePart = appt?.date || '1970-01-01';
  const timePart = appt?.time || '00:00';
  const dateTime = new Date(`${datePart}T${timePart}`);
  return Number.isNaN(dateTime.getTime()) ? 0 : dateTime.getTime();
}

function getVisibleUpcomingAppointments(appointments = []) {
  return appointments
    .filter((appt) => {
      if (!appt || !appt.date) return false;

      const status = (appt.status || '').toLowerCase();
      if (['cancelled', 'completed'].includes(status)) return false;

      const dateTime = new Date(`${appt.date}T${appt.time || '00:00'}`);
      return !Number.isNaN(dateTime.getTime());
    })
    .sort((a, b) => getAppointmentSortValue(b) - getAppointmentSortValue(a));
}

function getUpcomingPageItems() {
  const start = (currentUpcomingPage - 1) * APPT_PAGE_SIZE;
  return getFilteredPatientAppointments(upcomingAppointments).slice(start, start + APPT_PAGE_SIZE);
}

function getFilteredPatientAppointments(appointments) {
  const query = (patientDashboardSearch?.value || '').trim().toLowerCase();
  if (!query) return appointments;
  return appointments.filter((appt) => `${appt.doctor?.name || ''} ${appt.doctor?.email || ''} ${appt.reason || ''} ${appt.date || ''} ${appt.time || ''}`.toLowerCase().includes(query));
}

function renderUpcomingAppointmentsPage() {
  if (!upcomingApptContainer) return;

  const filteredAppointments = getFilteredPatientAppointments(upcomingAppointments);
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / APPT_PAGE_SIZE));
  currentUpcomingPage = Math.min(currentUpcomingPage, totalPages);

  const pageItems = getUpcomingPageItems();

  if (filteredAppointments.length === 0) {
    upcomingApptContainer.innerHTML = `<p class="appt-empty-state">${upcomingAppointments.length ? 'No appointments match your search.' : 'No upcoming appointments yet.'}</p>`;
    return;
  }

  const pager = totalPages > 1 ? `
    <div class="appt-pagination" aria-label="Appointment pagination">
      <button class="appt-page-btn" type="button" data-page="prev" ${currentUpcomingPage === 1 ? 'disabled' : ''}>Previous</button>
      <span class="appt-page-indicator">Page ${currentUpcomingPage} of ${totalPages}</span>
      <button class="appt-page-btn" type="button" data-page="next" ${currentUpcomingPage === totalPages ? 'disabled' : ''}>Next</button>
    </div>
  ` : '';

  upcomingApptContainer.innerHTML = `
    <div class="appt-page-list">
      ${pageItems.map((appt) => `
        <div class="appt-card">
          <div class="appt-avatar"></div>
          <div class="appt-details">
            <span class="appt-tag">${(appt.status || 'pending').toUpperCase()}</span>
            <h4>${escapeHtml(appt.doctor?.name || 'Unknown')}</h4>
            <div class="appt-meta">
              <span class="appt-meta-item">${appt.date || 'Date not set'}</span>
              <span class="appt-meta-item">${appt.time || 'Time not set'}</span>
            </div>
          </div>
          <div class="appt-actions">
            ${appt.status === 'pending'
              ? `<button class="btn-outline cancel-appt-btn" data-id="${appt._id}">Cancel</button>`
              : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ${pager}
  `;

  document.querySelectorAll('.cancel-appt-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.getAttribute('data-id');
      try {
        const res = await fetch(`${API_ROOT}/appointments/${id}`, {
          method: 'DELETE',
          headers: authHeaders()
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || 'Could not cancel');
          return;
        }
        loadMyAppointments();
      } catch (error) {
        console.error('Cancel error:', error);
      }
    });
  });

  document.querySelectorAll('.appt-page-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextPage = btn.getAttribute('data-page');
      if (nextPage === 'prev') {
        currentUpcomingPage = Math.max(1, currentUpcomingPage - 1);
      }
      if (nextPage === 'next') {
        currentUpcomingPage = Math.min(totalPages, currentUpcomingPage + 1);
      }
      renderUpcomingAppointmentsPage();
    });
  });
}

function renderRecentAppointmentsPage() {
  if (!recentAppointmentsContainer) return;

  const filteredAppointments = getFilteredPatientAppointments(recentAppointments);
  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / APPT_PAGE_SIZE));
  currentRecentPage = Math.min(currentRecentPage, totalPages);
  const start = (currentRecentPage - 1) * APPT_PAGE_SIZE;
  const pageItems = filteredAppointments.slice(start, start + APPT_PAGE_SIZE);

  if (filteredAppointments.length === 0) {
    recentAppointmentsContainer.innerHTML = `<p class="appt-empty-state">${recentAppointments.length ? 'No records match your search.' : 'No completed appointments yet.'}</p>`;
    return;
  }

  const pager = totalPages > 1 ? `
    <div class="appt-pagination" aria-label="Recent appointment pagination">
      <button class="appt-page-btn recent-page-btn" type="button" data-page="prev" ${currentRecentPage === 1 ? 'disabled' : ''}>Previous</button>
      <span class="appt-page-indicator">Page ${currentRecentPage} of ${totalPages}</span>
      <button class="appt-page-btn recent-page-btn" type="button" data-page="next" ${currentRecentPage === totalPages ? 'disabled' : ''}>Next</button>
    </div>
  ` : '';

  recentAppointmentsContainer.innerHTML = `
    <div class="activity-page-list">
      ${pageItems.map((appt) => `
        <div class="activity-item">
          <div class="activity-icon"><span class="icon sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><path d="m8 16 2 2 5-5"></path></svg></span></div>
          <div class="activity-body">
            <p class="title">Appointment with ${escapeHtml(appt.doctor?.name || 'Unknown doctor')}</p>
            <p class="meta">${escapeHtml(appt.date || 'Date not set')} at ${escapeHtml(appt.time || 'Time not set')} | ${escapeHtml((appt.status || 'completed').toUpperCase())}</p>
            <p class="note">Reason: ${escapeHtml(appt.reason || 'No reason provided')}</p>
          </div>
        </div>
      `).join('')}
    </div>
    ${pager}
  `;

  recentAppointmentsContainer.querySelectorAll('.recent-page-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextPage = btn.getAttribute('data-page');
      if (nextPage === 'prev') {
        currentRecentPage = Math.max(1, currentRecentPage - 1);
      }
      if (nextPage === 'next') {
        currentRecentPage = Math.min(totalPages, currentRecentPage + 1);
      }
      renderRecentAppointmentsPage();
    });
  });
}

async function loadMyAppointments() {
  if (!upcomingApptContainer) return;

  try {
    const res = await fetch(`${API_ROOT}/appointments/my`, { headers: authHeaders() });
    const appointments = await res.json();

    if (!res.ok) {
      upcomingAppointments = [];
      upcomingApptContainer.innerHTML = `<p class="appt-empty-state">${appointments.message || 'Could not load appointments'}</p>`;
      return;
    }

    recentAppointments = Array.isArray(appointments)
      ? appointments
        .filter((appt) => (appt?.status || '').toLowerCase() === 'completed')
        .sort((a, b) => getAppointmentSortValue(b) - getAppointmentSortValue(a))
      : [];
    currentRecentPage = 1;
    renderRecentAppointmentsPage();

    upcomingAppointments = Array.isArray(appointments)
      ? getVisibleUpcomingAppointments(appointments)
      : [];

    updateUpcomingVisitsSummary();
    currentUpcomingPage = 1;
    renderUpcomingAppointmentsPage();

  } catch (error) {
    console.error('Load appointments error:', error);
    upcomingAppointments = [];
    recentAppointments = [];
    upcomingApptContainer.innerHTML = '<p class="appt-empty-state">Unable to load appointments right now.</p>';
    if (recentAppointmentsContainer) {
      recentAppointmentsContainer.innerHTML = '<p class="appt-empty-state">Unable to load recent appointments right now.</p>';
    }
  }
}

async function loadPatientDashboardSummary() {
  if (!patientDashboard) return;

  if (goalProgressValue) goalProgressValue.textContent = 'Not set';
  if (goalProgressLabel) goalProgressLabel.textContent = 'No health goal recorded';
  if (messagesValue) messagesValue.textContent = 'Unavailable';

  try {
    const response = await fetch(`${API_ROOT}/medical-records/my`, { headers: authHeaders() });
    const records = await response.json();
    if (!response.ok) throw new Error(records.message || 'Could not load health summary');

    const prescriptions = Array.isArray(records) ? records.filter((record) => record.prescription?.trim()) : [];
    if (prescriptionValue) {
      prescriptionValue.textContent = `${prescriptions.length} Prescription${prescriptions.length === 1 ? '' : 's'}`;
    }
    if (prescriptionBadge) prescriptionBadge.textContent = prescriptions.length ? 'From your records' : 'None recorded';
  } catch (error) {
    console.error('Load patient dashboard summary error:', error);
    if (prescriptionValue) prescriptionValue.textContent = 'Unavailable';
    if (prescriptionBadge) prescriptionBadge.textContent = 'Could not load';
  }
}

if (upcomingApptContainer) {
  loadMyAppointments();
  loadPatientDashboardSummary();
}

patientDashboardSearch?.addEventListener('input', () => {
  currentUpcomingPage = 1;
  currentRecentPage = 1;
  renderUpcomingAppointmentsPage();
  renderRecentAppointmentsPage();
});

document.querySelector('#fabBtn')?.addEventListener('click', showBookingModal);

loadCurrentUserProfile();

// ---------- Doctor-side: appointment.html table ----------
const doctorApptTableBody = document.querySelector('#doctorApptTableBody');
const doctorApptSearch = document.querySelector('.search-wrap input');
const doctorApptTabs = document.querySelectorAll('.tabs button');
const doctorApptFooterText = document.querySelector('#doctorApptFooterText');
const doctorApptPagination = document.querySelector('.pagination');
const doctorApptStats = {
  total: document.querySelector('#doctorTotalSlots'),
  completed: document.querySelector('#doctorCompletedToday'),
  cancelled: document.querySelector('#doctorCancelled')
};
const DOCTOR_APPT_PAGE_SIZE = 4;
let doctorAppointments = [];
let doctorAppointmentTab = 'upcoming';
let doctorAppointmentPage = 1;

const formatAppointmentDate = (date) => {
  if (!date) return 'Date not set';
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

const formatAppointmentTime = (time) => {
  if (!time) return 'Time not set';
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${String(hours % 12 || 12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`;
};

const getDoctorAppointmentView = () => {
  const query = (doctorApptSearch?.value || '').trim().toLowerCase();
  return doctorAppointments
    .filter((appt) => {
      const isUpcoming = ['pending', 'confirmed'].includes(appt.status);
      const matchesTab = doctorAppointmentTab === 'upcoming'
        ? isUpcoming
        : doctorAppointmentTab === 'past'
          ? appt.status === 'completed'
          : appt.status === 'cancelled';
      const searchable = `${appt.patient?.name || ''} ${appt.patient?._id || ''} ${appt.reason || ''} ${appt.date || ''}`.toLowerCase();
      return matchesTab && (!query || searchable.includes(query));
    })
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
};

const statusBadgeClass = (status) => `badge-${status || 'pending'}`;

function renderDoctorAppointmentTable() {
  if (!doctorApptTableBody) return;
  const appointments = getDoctorAppointmentView();
  const totalPages = Math.max(1, Math.ceil(appointments.length / DOCTOR_APPT_PAGE_SIZE));
  doctorAppointmentPage = Math.min(doctorAppointmentPage, totalPages);
  const start = (doctorAppointmentPage - 1) * DOCTOR_APPT_PAGE_SIZE;
  const pageItems = appointments.slice(start, start + DOCTOR_APPT_PAGE_SIZE);

  doctorApptTableBody.innerHTML = pageItems.length === 0
    ? '<tr><td colspan="5" class="table-message">No appointments match this view.</td></tr>'
    : pageItems.map((appt) => {
      const patientName = appt.patient?.name || 'Unknown patient';
      const initials = escapeHtml(getInitials(patientName));
      const nextAction = appt.status === 'pending'
        ? '<button class="action-btn status-action" data-status="confirmed" title="Confirm appointment">Confirm</button>'
        : appt.status === 'confirmed'
          ? '<button class="action-btn status-action" data-status="completed" title="Mark appointment completed">Complete</button>'
          : '';
      const canCancel = ['pending', 'confirmed'].includes(appt.status);
      return `<tr>
        <td><div class="patient-cell"><div class="avatar">${initials}</div><div><p class="patient-name">${escapeHtml(patientName)}</p><p class="patient-id">ID: #${escapeHtml(String(appt.patient?._id || appt._id).slice(-6).toUpperCase())}</p></div></div></td>
        <td><div class="dt-row">${formatAppointmentDate(appt.date)}</div><div class="dt-row">${formatAppointmentTime(appt.time)}</div></td>
        <td><div class="type-cell"><span class="dot"></span>${escapeHtml(appt.reason || 'Consultation')}</div></td>
        <td><span class="badge ${statusBadgeClass(appt.status)}">${escapeHtml((appt.status || 'pending').toUpperCase())}</span></td>
        <td class="right"><div class="row-actions">
          ${nextAction}
          ${canCancel ? '<button class="action-btn status-action" data-status="cancelled" title="Cancel appointment">Cancel</button>' : ''}
          ${['pending', 'confirmed', 'completed'].includes(appt.status) && appt.patient?._id ? `<button class="action-btn add-record-btn" title="Add medical record" data-patient-id="${escapeHtml(appt.patient._id)}" data-appointment-id="${escapeHtml(appt._id)}" data-patient-name="${escapeHtml(patientName)}">Record</button>` : ''}
        </div></td>
      </tr>`;
    }).join('');

  if (doctorApptFooterText) {
    const first = appointments.length ? start + 1 : 0;
    const last = Math.min(start + DOCTOR_APPT_PAGE_SIZE, appointments.length);
    doctorApptFooterText.textContent = `Showing ${first}-${last} of ${appointments.length} appointments`;
  }
  if (doctorApptPagination) {
    doctorApptPagination.innerHTML = `<button class="page-btn" data-page="prev" ${doctorAppointmentPage === 1 ? 'disabled' : ''} aria-label="Previous page">&#8249;</button>
      ${Array.from({ length: totalPages }, (_, index) => `<button class="page-num ${index + 1 === doctorAppointmentPage ? 'current' : ''}" data-page="${index + 1}">${index + 1}</button>`).join('')}
      <button class="page-btn" data-page="next" ${doctorAppointmentPage === totalPages ? 'disabled' : ''} aria-label="Next page">&#8250;</button>`;
  }
  doctorApptTableBody.querySelectorAll('.status-action').forEach((button) => {
    button.addEventListener('click', () => updateDoctorAppointmentStatus(button.closest('tr').dataset.id, button.dataset.status));
  });
  pageItems.forEach((appt, index) => {
    const row = doctorApptTableBody.rows[index];
    if (row) row.dataset.id = appt._id;
  });
  doctorApptTableBody.querySelectorAll('.add-record-btn').forEach((button) => button.addEventListener('click', () => openDoctorRecordForm(button.dataset)));
  doctorApptPagination?.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => {
    const target = button.dataset.page;
    doctorAppointmentPage = target === 'prev' ? doctorAppointmentPage - 1 : target === 'next' ? doctorAppointmentPage + 1 : Number(target);
    renderDoctorAppointmentTable();
  }));
}

async function updateDoctorAppointmentStatus(id, status) {
  try {
    const res = await fetch(`${API_ROOT}/appointments/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify({ status }) });
    const data = await res.json();
    if (!res.ok) { alert(data.message || 'Could not update status'); return; }
    await loadDoctorAppointments();
  } catch (error) { console.error('Update status error:', error); }
}

async function loadDoctorAppointments() {
  if (!doctorApptTableBody) return;
  try {
    const res = await fetch(`${API_ROOT}/appointments/my`, { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Could not load appointments');
    doctorAppointments = Array.isArray(data) ? data : [];
    const today = new Date().toISOString().slice(0, 10);
    doctorApptStats.total && (doctorApptStats.total.textContent = doctorAppointments.filter((appt) => appt.date === today).length);
    doctorApptStats.completed && (doctorApptStats.completed.textContent = doctorAppointments.filter((appt) => appt.date === today && appt.status === 'completed').length);
    doctorApptStats.cancelled && (doctorApptStats.cancelled.textContent = doctorAppointments.filter((appt) => appt.status === 'cancelled').length);
    renderDoctorAppointmentTable();
  } catch (error) {
    console.error('Load doctor appointments error:', error);
    doctorApptTableBody.innerHTML = `<tr><td colspan="5" class="table-message">${escapeHtml(error.message || 'Unable to load appointments.')}</td></tr>`;
  }
}

doctorApptTabs.forEach((tab) => tab.addEventListener('click', () => {
  doctorApptTabs.forEach((item) => item.classList.remove('active'));
  tab.classList.add('active');
  doctorAppointmentTab = tab.textContent.trim().toLowerCase();
  doctorAppointmentPage = 1;
  renderDoctorAppointmentTable();
}));
doctorApptSearch?.addEventListener('input', () => { doctorAppointmentPage = 1; renderDoctorAppointmentTable(); });
if (doctorApptTableBody) loadDoctorAppointments();

// ===================== Patient directory (patient-directory.html, doctor only) =====================
const patientTableBody = document.querySelector('#patientTableBody');

if (patientTableBody) {
  let allPatients = [];
  let doctorAppointments = [];
  let patientFilter = 'all';
  let patientPage = 1;
  const patientPageSize = 5;
  const urgentReviewList = document.querySelector('#urgentReviewList');
  const urgentReviewCount = document.querySelector('#urgentReviewCount');
  const distributionChart = document.querySelector('#patientDistributionChart');
  const distributionTotal = document.querySelector('#patientDistributionTotal');
  const distributionLegend = document.querySelector('#patientDistributionLegend');
  const patientPagination = document.querySelector('#patientPagination');
  const appointmentUndoBar = document.querySelector('#appointmentUndoBar');
  let undoTimer;

  // Dates arrive as "YYYY-MM-DD". Build the Date from parts so timezones can't shift the day.
  const formatVisitDate = (dateStr) => {
    if (!dateStr) return '—';
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const setPatientMessage = (message) => {
    patientTableBody.innerHTML = `<tr><td colspan="5" style="padding:24px;">${escapeHtml(message)}</td></tr>`;
  };

  const renderPatients = () => {
    const filtered = allPatients.filter((p) =>
      patientFilter === 'upcoming' ? p.hasUpcoming :
      patientFilter === 'completed' ? p.lastVisit :
      true);
    const totalPages = Math.max(1, Math.ceil(filtered.length / patientPageSize));
    patientPage = Math.min(patientPage, totalPages);
    const start = (patientPage - 1) * patientPageSize;
    const visible = filtered.slice(start, start + patientPageSize);

    const kpiTotal = document.querySelector('#kpiTotalPatients');
    const kpiUpcoming = document.querySelector('#kpiUpcoming');
    const kpiSeen = document.querySelector('#kpiSeen');
    const countText = document.querySelector('#patientCountText');

    if (kpiTotal) kpiTotal.textContent = allPatients.length;
    if (kpiUpcoming) kpiUpcoming.textContent = allPatients.filter((p) => p.hasUpcoming).length;
    if (kpiSeen) kpiSeen.textContent = allPatients.filter((p) => p.lastVisit).length;
    if (countText) {
      const first = filtered.length ? start + 1 : 0;
      const last = Math.min(start + patientPageSize, filtered.length);
      countText.textContent = `Showing ${first}-${last} of ${filtered.length} patient${filtered.length === 1 ? '' : 's'}`;
    }

    if (visible.length === 0) {
      setPatientMessage(allPatients.length === 0
        ? 'No patients yet. Patients appear here once they book an appointment with you.'
        : 'No patients match this filter.');
      return;
    }

    patientTableBody.innerHTML = visible.map((p) => `
      <tr>
        <td>
          <div class="patient-cell">
            <div class="patient-initials">${escapeHtml(getInitials(p.name))}</div>
            <div>
              <p class="p-name">${escapeHtml(p.name)}</p>
              <p class="p-meta">${p.totalAppointments} appointment${p.totalAppointments === 1 ? '' : 's'}</p>
            </div>
          </div>
        </td>
        <td class="id-mono">${escapeHtml(p.email)}</td>
        <td class="visit-date">${formatVisitDate(p.lastVisit)}</td>
        <td><span class="status-pill ${p.hasUpcoming ? 'followup' : 'stable'}">${p.hasUpcoming ? 'Upcoming' : 'Completed'}</span></td>
        <td class="action-cell">
          <button class="row-action" aria-label="Appointment actions" aria-expanded="false">
            <span class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg></span>
          </button>
          <div class="row-menu" hidden>
            <button type="button" class="delete-appointment" data-id="${escapeHtml(p.latestAppointmentId)}">Delete appointment</button>
          </div>
        </td>
      </tr>
    `).join('');

    patientTableBody.querySelectorAll('.row-action').forEach((button) => {
      button.addEventListener('click', () => {
        const menu = button.nextElementSibling;
        const isOpen = !menu.hidden;
        patientTableBody.querySelectorAll('.row-menu').forEach((item) => { item.hidden = true; });
        patientTableBody.querySelectorAll('.row-action').forEach((item) => item.setAttribute('aria-expanded', 'false'));
        menu.hidden = isOpen;
        button.setAttribute('aria-expanded', String(!isOpen));
      });
    });
    patientTableBody.querySelectorAll('.delete-appointment').forEach((button) => {
      button.addEventListener('click', () => deleteAppointment(button.dataset.id));
    });

    if (patientPagination) {
      patientPagination.innerHTML = `<button class="page-btn" data-page="prev" ${patientPage === 1 ? 'disabled' : ''} aria-label="Previous page">&#8249;</button>
        ${Array.from({ length: totalPages }, (_, index) => `<button class="page-btn ${index + 1 === patientPage ? 'active' : ''}" data-page="${index + 1}">${index + 1}</button>`).join('')}
        <button class="page-btn" data-page="next" ${patientPage === totalPages ? 'disabled' : ''} aria-label="Next page">&#8250;</button>`;
      patientPagination.querySelectorAll('[data-page]').forEach((button) => button.addEventListener('click', () => {
        const target = button.dataset.page;
        patientPage = target === 'prev' ? patientPage - 1 : target === 'next' ? patientPage + 1 : Number(target);
        renderPatients();
      }));
    }
  };

  const showUndo = (appointmentId, expiresAt) => {
    if (!appointmentUndoBar) return;
    window.clearTimeout(undoTimer);
    const remainingMs = Math.max(0, new Date(expiresAt).getTime() - Date.now());
    if (!remainingMs) return;
    appointmentUndoBar.hidden = false;
    appointmentUndoBar.innerHTML = `Appointment deleted. <button type="button" id="undoAppointment">Undo</button>`;
    appointmentUndoBar.querySelector('#undoAppointment').addEventListener('click', async () => {
      try {
        const response = await fetch(`${API_ROOT}/appointments/${encodeURIComponent(appointmentId)}/undo-delete`, {
          method: 'POST',
          headers: authHeaders()
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not undo deletion');
        appointmentUndoBar.hidden = true;
        await loadPatients();
      } catch (error) {
        console.error('Undo appointment deletion error:', error);
        appointmentUndoBar.textContent = error.message || 'Could not undo deletion.';
      }
    });
    undoTimer = window.setTimeout(() => {
      appointmentUndoBar.hidden = true;
      appointmentUndoBar.textContent = '';
    }, remainingMs);
  };

  async function deleteAppointment(appointmentId) {
    if (!appointmentId || !window.confirm('Delete this appointment? You can undo this for 5 minutes.')) return;
    try {
      const response = await fetch(`${API_ROOT}/appointments/${encodeURIComponent(appointmentId)}/doctor-delete`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not delete appointment');
      showUndo(data.appointmentId, data.expiresAt);
      await loadPatients();
    } catch (error) {
      console.error('Delete appointment error:', error);
      window.alert(error.message || 'Could not delete appointment.');
    }
  }

  const formatReviewDate = (date, time) => {
    const dateValue = new Date(`${date}T${time || '00:00'}`);
    return Number.isNaN(dateValue.getTime()) ? date : dateValue.toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  };

  const renderReviews = () => {
    const pending = doctorAppointments.filter((appointment) => appointment.status === 'pending');
    if (urgentReviewCount) urgentReviewCount.textContent = `${pending.length} New`;
    if (!urgentReviewList) return;
    if (!pending.length) {
      urgentReviewList.innerHTML = '<p class="table-message">No pending reviews.</p>';
      return;
    }

    urgentReviewList.innerHTML = pending.slice(0, 5).map((appointment) => {
      const patientName = appointment.patient?.name || 'Unknown patient';
      const isUrgent = /urgent|emergency/i.test(appointment.reason || '');
      return `<div class="review-item ${isUrgent ? 'urgent' : 'normal'}">
        <div class="rdot"></div>
        <div>
          <p class="r-title">Appointment: ${escapeHtml(patientName)}</p>
          <p class="r-desc">${escapeHtml(appointment.reason || 'Consultation')} · ${escapeHtml(formatReviewDate(appointment.date, appointment.time))}</p>
          <button class="r-action approve-review" data-id="${escapeHtml(appointment._id)}">Approve Slot</button>
        </div>
      </div>`;
    }).join('');

    urgentReviewList.querySelectorAll('.approve-review').forEach((button) => {
      button.addEventListener('click', async () => {
        button.disabled = true;
        await updateDoctorAppointmentStatus(button.dataset.id, 'confirmed');
        await loadPatients();
      });
    });
  };

  const renderDistribution = () => {
    const total = allPatients.length;
    const groups = [
      { label: 'Upcoming', count: allPatients.filter((patient) => patient.hasUpcoming).length, color: 'var(--primary-container)' },
      { label: 'Seen', count: allPatients.filter((patient) => !patient.hasUpcoming && patient.lastVisit).length, color: 'var(--status-success)' },
      { label: 'No completed visit', count: allPatients.filter((patient) => !patient.hasUpcoming && !patient.lastVisit).length, color: 'var(--status-pending)' }
    ];
    if (distributionTotal) distributionTotal.textContent = total;
    if (distributionChart) {
      let offset = 0;
      const stops = groups.map((group) => {
        const percentage = total ? (group.count / total) * 100 : 0;
        const stop = `${group.color} ${offset}% ${offset + percentage}%`;
        offset += percentage;
        return stop;
      });
      distributionChart.style.background = total ? `conic-gradient(${stops.join(', ')})` : 'var(--surface-container-high)';
    }
    if (distributionLegend) {
      distributionLegend.innerHTML = groups.map((group) => {
        const percentage = total ? Math.round((group.count / total) * 100) : 0;
        return `<div class="legend-row">
          <div class="left"><div class="legend-dot" style="background:${group.color};"></div><span class="legend-label">${escapeHtml(group.label)}</span></div>
          <span class="pct">${percentage}%</span>
        </div>`;
      }).join('');
    }
  };

  async function loadPatients() {
    try {
      const [patientsRes, appointmentsRes, profileRes] = await Promise.all([
        fetch(`${API_ROOT}/patients`, { headers: authHeaders() }),
        fetch(`${API_ROOT}/appointments/my`, { headers: authHeaders() }),
        fetch(`${API_ROOT}/users/me`, { headers: authHeaders() })
      ]);
      const data = await patientsRes.json();

      if (!patientsRes.ok) {
        setPatientMessage(data.message || 'Could not load patients');
        return;
      }

      const appointments = await appointmentsRes.json();
      doctorAppointments = appointmentsRes.ok && Array.isArray(appointments) ? appointments : [];
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        const doctor = profileData.user;
        const name = document.querySelector('#doctorName');
        const role = document.querySelector('#doctorRole');
        const avatar = document.querySelector('#doctorAvatar');
        if (name) name.textContent = doctor.name;
        if (role) role.textContent = doctor.role === 'doctor' ? 'Doctor' : doctor.role;
        if (avatar) avatar.textContent = getInitials(doctor.name);
      }
      allPatients = Array.isArray(data) ? data : [];
      renderReviews();
      renderDistribution();
      renderPatients();
    } catch (error) {
      console.error('Load patients error:', error);
      setPatientMessage('Unable to reach the server. Please try again.');
    }
  }

  // The shared handler earlier in this file already toggles the .active class on tabs;
  // this one only decides which patients to show.
  document.querySelectorAll('.tab-btn[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      patientFilter = btn.getAttribute('data-filter');
      patientPage = 1;
      renderPatients();
    });
  });

  loadPatients();
}

// ===================== Doctor dashboard overview (doctor-dashboard.html) =====================
const scheduleTableBody = document.querySelector('#scheduleTableBody');

if (scheduleTableBody) {
  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const statusBadgeClass = (status) => ({
    pending: 'status-progress',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }[status] || 'status-confirmed');

  const capitalizeStatus = (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : '';

  function renderGreetingAndDate(user) {
    const greetingEl = document.querySelector('#doctorGreeting');
    const dateEl = document.querySelector('#currentDate');
    if (greetingEl && user) {
      const firstName = (user.name || '').split(' ')[0];
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
      greetingEl.textContent = `${greeting}${firstName ? ', ' + firstName : ''}`;
    }
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    }
  }

  function renderSchedule(appointments) {
    const today = todayStr();
    const todays = appointments
      .filter((a) => a.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));

    const todayCountText = document.querySelector('#todayCountText');
    if (todayCountText) {
      todayCountText.textContent = todays.length === 0
        ? 'No appointments scheduled for today.'
        : `You have ${todays.length} appointment${todays.length === 1 ? '' : 's'} scheduled for today.`;
    }

    if (todays.length === 0) {
      scheduleTableBody.innerHTML = '<tr><td colspan="5" style="padding:20px;">No appointments scheduled for today.</td></tr>';
      return;
    }

    scheduleTableBody.innerHTML = todays.map((appt) => {
      const name = appt.patient?.name || 'Unknown';
      return `
        <tr>
          <td class="time-cell">${escapeHtml(appt.time)}</td>
          <td><div class="patient-cell"><div class="avatar-sm" style="background-color: var(--sage-light); color: var(--forest-deep);">${escapeHtml(getInitials(name))}</div><span class="name">${escapeHtml(name)}</span></div></td>
          <td class="type-cell">${escapeHtml(appt.reason || '—')}</td>
          <td><span class="status-badge ${statusBadgeClass(appt.status)}">${escapeHtml(capitalizeStatus(appt.status))}</span></td>
          <td><a class="more-btn" href="/Frontend/HTML/appointment.html" style="text-decoration:none; display:inline-flex;" aria-label="Manage in Appointments">
            <span class="icon"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"></circle><circle cx="12" cy="12" r="1.5"></circle><circle cx="12" cy="19" r="1.5"></circle></svg></span>
          </a></td>
        </tr>
      `;
    }).join('');
  }

  function renderStatsFromAppointments(appointments) {
    const today = todayStr();
    const todays = appointments.filter((a) => a.date === today);

    const statTodayVisits = document.querySelector('#statTodayVisits');
    const statPending = document.querySelector('#statPending');
    const statCompletedToday = document.querySelector('#statCompletedToday');

    if (statTodayVisits) statTodayVisits.textContent = todays.length;
    if (statPending) statPending.textContent = appointments.filter((a) => a.status === 'pending').length;
    if (statCompletedToday) statCompletedToday.textContent = todays.filter((a) => a.status === 'completed').length;
  }

  function renderInsightsChart(appointments) {
    const chartArea = document.querySelector('#insightsChartArea');
    if (!chartArea) return;

    // Last 7 days including today, in chronological order.
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const count = appointments.filter((a) => a.date === key && a.status !== 'cancelled').length;
      days.push({ label: d.toLocaleDateString('en-US', { weekday: 'short' }), count });
    }

    const maxCount = Math.max(1, ...days.map((d) => d.count));

    chartArea.innerHTML = `
      <div class="grid-lines"><div></div><div></div><div></div><div></div></div>
      ${days.map((d) => `
        <div class="bar-col">
          ${d.count > 0 ? `<div class="bar-tooltip">${d.count} appointment${d.count === 1 ? '' : 's'}</div>` : ''}
          <div class="bar" style="height: ${Math.max(4, (d.count / maxCount) * 100)}%;"></div>
          <span class="bar-label">${escapeHtml(d.label)}</span>
        </div>
      `).join('')}
    `;
  }

  async function loadDoctorSchedule() {
    try {
      const res = await fetch(`${API_ROOT}/appointments/my`, { headers: authHeaders() });
      const appointments = await res.json();

      if (!res.ok) {
        scheduleTableBody.innerHTML = `<tr><td colspan="5" style="padding:20px;">${escapeHtml(appointments.message || 'Could not load schedule')}</td></tr>`;
        return;
      }

      renderSchedule(appointments);
      renderStatsFromAppointments(appointments);
      renderInsightsChart(appointments);
    } catch (error) {
      console.error('Load doctor schedule error:', error);
      scheduleTableBody.innerHTML = '<tr><td colspan="5" style="padding:20px;">Unable to reach the server. Please try again.</td></tr>';
    }
  }

  function renderRecentPatients(patients) {
    const list = document.querySelector('#recentPatientsList');
    const statTotalPatients = document.querySelector('#statTotalPatients');
    if (statTotalPatients) statTotalPatients.textContent = patients.length;
    if (!list) return;

    if (patients.length === 0) {
      list.innerHTML = '<p style="padding:12px 4px;">No patients yet.</p>';
      return;
    }

    // "Recent" = most recently seen first; patients with no completed visit yet go last.
    const sorted = [...patients].sort((a, b) => (b.lastVisit || '').localeCompare(a.lastVisit || ''));
    const top3 = sorted.slice(0, 3);

    list.innerHTML = top3.map((p) => `
      <div class="patient-row">
        <div class="patient-info">
          <div class="avatar-patient" style="display:flex; align-items:center; justify-content:center; color: var(--forest-deep); font-weight:700;">${escapeHtml(getInitials(p.name))}</div>
          <div>
            <p>${escapeHtml(p.name)}</p>
            <p>${p.lastVisit ? 'Last visit: ' + new Date(p.lastVisit).toLocaleDateString() : 'No visits yet'}</p>
          </div>
        </div>
        <a class="folder-btn" href="/Frontend/HTML/patient-directory.html" style="text-decoration:none; display:inline-flex;" aria-label="Open in Patient Directory">
          <span class="icon sm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg></span>
        </a>
      </div>
    `).join('');
  }

  async function loadRecentPatients() {
    try {
      const res = await fetch(`${API_ROOT}/patients`, { headers: authHeaders() });
      const patients = await res.json();

      if (!res.ok) {
        const list = document.querySelector('#recentPatientsList');
        if (list) list.innerHTML = `<p style="padding:12px 4px;">${escapeHtml(patients.message || 'Could not load patients')}</p>`;
        return;
      }

      renderRecentPatients(patients);
    } catch (error) {
      console.error('Load recent patients error:', error);
      const list = document.querySelector('#recentPatientsList');
      if (list) list.innerHTML = '<p style="padding:12px 4px;">Unable to reach the server. Please try again.</p>';
    }
  }

  const directoryBtn = document.querySelector('#allPatientDirectoryBtn');
  if (directoryBtn) {
    directoryBtn.addEventListener('click', () => {
      window.location.href = '/Frontend/HTML/patient-directory.html';
    });
  }

  const dashboardUserRaw = localStorage.getItem('user');
  renderGreetingAndDate(dashboardUserRaw ? JSON.parse(dashboardUserRaw) : null);
  loadDoctorSchedule();
  loadRecentPatients();
}

const doctorRecordModal = document.querySelector('#doctorRecordModal');
const doctorRecordForm = document.querySelector('#doctorRecordForm');

function openDoctorRecordForm(data) {
  if (!doctorRecordModal || !doctorRecordForm) return;
  doctorRecordForm.reset();
  document.querySelector('#doctorRecordPatientId').value = data.patientId || '';
  document.querySelector('#doctorRecordAppointmentId').value = data.appointmentId || '';
  document.querySelector('#doctorRecordPatient').textContent = `For ${data.patientName || 'patient'}`;
  document.querySelector('#doctorRecordError').textContent = '';
  doctorRecordModal.classList.add('is-open');
  doctorRecordModal.setAttribute('aria-hidden', 'false');
  document.querySelector('#doctorRecordDiagnosis').focus();
}

function closeDoctorRecordForm() {
  if (!doctorRecordModal) return;
  doctorRecordModal.classList.remove('is-open');
  doctorRecordModal.setAttribute('aria-hidden', 'true');
}

if (doctorRecordForm) {
  document.querySelector('#closeDoctorRecordModal').addEventListener('click', closeDoctorRecordForm);
  doctorRecordModal.addEventListener('click', (event) => {
    if (event.target === doctorRecordModal) closeDoctorRecordForm();
  });
  doctorRecordForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const errorElement = document.querySelector('#doctorRecordError');
    errorElement.textContent = '';
    const submitButton = doctorRecordForm.querySelector('[type="submit"]');
    submitButton.disabled = true;

    try {
      const response = await fetch(`${API_ROOT}/medical-records`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          patientId: document.querySelector('#doctorRecordPatientId').value,
          appointmentId: document.querySelector('#doctorRecordAppointmentId').value,
          diagnosis: document.querySelector('#doctorRecordDiagnosis').value.trim(),
          notes: document.querySelector('#doctorRecordNotes').value.trim(),
          prescription: document.querySelector('#doctorRecordPrescription').value.trim()
        })
      });
      const data = await response.json();
      if (!response.ok) {
        errorElement.textContent = data.message || 'Could not save medical record.';
        return;
      }
      closeDoctorRecordForm();
      loadDoctorAppointments();
    } catch (error) {
      console.error('Create medical record error:', error);
      errorElement.textContent = 'Unable to reach the server. Please try again.';
    } finally {
      submitButton.disabled = false;
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeDoctorRecordForm();
  });
}

// ===================== Shared profile card =====================

if (document.querySelector('.profile-block, .profile, .user-chip')) {
  const profileTriggers = document.querySelectorAll('.profile-block, .profile, .user-chip');
  const profileCardStyle = document.createElement('style');
  profileCardStyle.textContent = `
    .profile-card-overlay { position: fixed; inset: 0; z-index: 2000; display: grid; place-items: center; padding: 20px; background: rgba(24, 28, 27, 0.58); opacity: 0; visibility: hidden; transition: opacity .2s ease, visibility .2s ease; }
    .profile-card-overlay.is-open { opacity: 1; visibility: visible; }
    .profile-card { position: relative; width: min(100%, 480px); max-height: min(760px, calc(100vh - 40px)); overflow-y: auto; padding: 28px; color: var(--on-surface, #181c1b); background: var(--surface, #fff); border: 1px solid var(--outline-variant, #c1c8c4); border-radius: var(--radius-lg, 12px); box-shadow: 0 24px 70px rgba(24, 28, 27, .24); font-family: var(--font-primary, sans-serif); transform: translateY(10px); transition: transform .2s ease; }
    .profile-card-overlay.is-open .profile-card { transform: translateY(0); }
    .profile-card-close { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border: 0; border-radius: var(--radius-full, 999px); color: var(--on-surface, #181c1b); background: transparent; font-size: 26px; line-height: 1; cursor: pointer; }
    .profile-card-close:hover, .profile-card-close:focus-visible { background: var(--secondary-container, #cde9dd); outline: none; }
    .profile-card-heading { margin: 0 0 20px; text-align: center; }
    .profile-card-avatar-wrap { position: relative; width: 88px; height: 88px; margin: 4px auto 14px; }
    .profile-card-avatar { width: 88px; height: 88px; display: grid; place-items: center; overflow: hidden; border-radius: var(--radius-full, 999px); color: var(--on-primary, #fff); background: var(--primary, #324f46); font-size: 26px; font-weight: 700; }
    .profile-card-avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-card-edit { position: absolute; right: -4px; bottom: -4px; width: 34px; height: 34px; display: grid; place-items: center; border: 2px solid var(--surface, #fff); border-radius: var(--radius-full, 999px); color: var(--on-primary, #fff); background: var(--primary, #324f46); cursor: pointer; }
    .profile-card-heading h2 { margin: 0; color: var(--on-surface, #181c1b); font-size: 24px; }
    .profile-card-heading p { margin: 4px 0 0; color: var(--on-surface-variant, #414845); font-size: 14px; }
    .profile-card-section { margin-top: 20px; }
    .profile-card-section h3 { margin: 0 0 10px; color: var(--on-surface, #181c1b); font-size: 16px; }
    .profile-card-field { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; color: var(--on-surface-variant, #414845); font-size: 13px; font-weight: 600; }
    .profile-card-field input { min-height: 44px; width: 100%; padding: 10px 12px; border: 1px solid var(--outline-variant, #c1c8c4); border-radius: var(--radius, 4px); color: var(--on-surface, #181c1b); background: var(--surface, #fff); font: inherit; font-weight: 400; }
    .profile-card-field input:focus { border-color: var(--primary, #324f46); outline: 2px solid var(--secondary-container, #cde9dd); }
    .profile-card-field input:disabled { color: var(--on-surface-variant, #414845); background: var(--surface-container-highest, #f1f4f2); }
    .profile-card-inline { display: flex; gap: 8px; align-items: end; }
    .profile-card-inline .profile-card-field { flex: 1; }
    .profile-card-button { min-height: 44px; padding: 10px 14px; border: 1px solid var(--primary, #324f46); border-radius: var(--radius, 4px); color: var(--on-primary, #fff); background: var(--primary, #324f46); font-weight: 700; cursor: pointer; }
    .profile-card-button.secondary { color: var(--primary, #324f46); background: var(--surface, #fff); }
    .profile-card-button.danger { width: 100%; border-color: var(--error, #ba1a1a); color: #fff; background: var(--error, #ba1a1a); }
    .profile-card-button.logout { width: 100%; margin-top: 10px; color: var(--on-surface, #181c1b); border-color: var(--outline-variant, #c1c8c4); background: var(--surface-container-highest, #f1f4f2); }
    .profile-card-message { min-height: 18px; margin: 8px 0 0; color: var(--status-success, #2e7d32); font-size: 12px; opacity: 0; transition: opacity .2s ease; }
    .profile-card-message.is-visible { opacity: 1; }
    .profile-card-error { min-height: 18px; margin: 8px 0 0; color: var(--error, #ba1a1a); font-size: 12px; }
    .profile-card-email-row { display: flex; gap: 8px; align-items: center; }
    .profile-card-email-row .profile-card-field { flex: 1; }
    .profile-card-badge { flex-shrink: 0; padding: 4px 8px; border-radius: var(--radius-full, 999px); color: var(--error, #ba1a1a); background: var(--error-container, #ffdad6); font-size: 11px; font-weight: 700; }
    .profile-card-badge.is-verified { color: var(--status-success, #2e7d32); background: var(--secondary-container, #cde9dd); }
    .profile-card-divider { height: 1px; margin: 24px 0 18px; background: var(--outline-variant, #c1c8c4); }
    .profile-card-delete-panel { display: none; margin-top: 10px; padding: 12px; border: 1px solid var(--error, #ba1a1a); border-radius: var(--radius, 4px); background: var(--error-container, #ffdad6); }
    .profile-card-delete-panel.is-visible { display: block; }
      .profile-card-delete-panel p { margin: 0 0 8px; color: var(--error, #ba1a1a); font-size: 12px; }
      .profile-card-delete-panel p.profile-card-message { color: var(--status-success, #2e7d32); }
    .profile-card-delete-panel input { min-height: 44px; width: 100%; padding: 10px; border: 1px solid var(--error, #ba1a1a); border-radius: var(--radius, 4px); margin-bottom: 8px; }
    .profile-card-delete-panel .profile-card-button { width: 100%; margin-top: 8px; }
    .profile-card-delete-panel .profile-card-button:disabled { cursor: not-allowed; opacity: .5; }
    @media (max-width: 480px) { .profile-card-overlay { padding: 10px; } .profile-card { max-height: calc(100vh - 20px); padding: 24px 18px; } .profile-card-inline, .profile-card-email-row { align-items: stretch; flex-direction: column; } .profile-card-inline .profile-card-button, .profile-card-email-row .profile-card-badge { width: 100%; text-align: center; } }
  `;
  document.head.appendChild(profileCardStyle);

  const storedProfile = localStorage.getItem('user');
  let profileUser = {};
  try {
    profileUser = storedProfile ? JSON.parse(storedProfile) : {};
  } catch (error) {
    console.error('Failed to read profile data:', error);
  }

  // Defaults to true so old sessions (before this feature existed, with no
  // authProvider/hasPassword stored yet) keep behaving exactly as before until
  // the fresh GET /users/me call below corrects it.
  let currentHasPassword = profileUser.hasPassword !== false;

  const profileName = getDisplayName(profileUser);
  const profileRole = profileUser.role === 'doctor' ? 'Doctor' : 'Premium Member';
  const profileEmail = profileUser.email || '';
  const isDoctorProfile = profileUser.role === 'doctor';
  const profileCardOverlay = document.createElement('div');
  profileCardOverlay.className = 'profile-card-overlay';
  profileCardOverlay.setAttribute('aria-hidden', 'true');
  profileCardOverlay.innerHTML = `
    <section class="profile-card" role="dialog" aria-modal="true" aria-labelledby="profileCardName">
      <button type="button" class="profile-card-close" aria-label="Close profile">&times;</button>
      <div class="profile-card-heading">
        <div class="profile-card-avatar-wrap">
          <div class="profile-card-avatar" id="profileCardAvatar">${escapeHtml(getInitials(profileName))}</div>
          <button type="button" class="profile-card-edit" id="profileCardEdit" aria-label="Choose profile photo">&#9998;</button>
          <input type="file" id="profileCardPhotoInput" accept="image/*" hidden>
        </div>
        <h2 id="profileCardName">${escapeHtml(profileName)}</h2>
        <p id="profileCardRole">${escapeHtml(profileRole)}</p>
      </div>
      <form id="profileCardForm" class="profile-card-section">
        <div class="profile-card-inline">
          <label class="profile-card-field">Full Name<input id="profileCardFullName" type="text" value="${escapeHtml(profileName)}" autocomplete="name" required></label>
          <button type="submit" class="profile-card-button">Save</button>
        </div>
        <p class="profile-card-message" id="profileCardNameMessage" aria-live="polite"></p>
      </form>
      ${isDoctorProfile ? `
        <div class="profile-card-section" id="profileCardDoctorFields">
          <h3>Professional Details</h3>
          <label class="profile-card-field">Specialization<input id="profileCardSpecialization" type="text" placeholder="Your specialization"></label>
          <label class="profile-card-field">License Number<input id="profileCardLicense" type="text" placeholder="Your license number"></label>
        </div>
      ` : ''}
      <div class="profile-card-section">
        <div class="profile-card-email-row">
          <label class="profile-card-field">Email<input type="email" value="${escapeHtml(profileEmail)}" disabled></label>
          <span class="profile-card-badge${profileUser.emailVerified ? ' is-verified' : ''}">${profileUser.emailVerified ? 'Verified' : 'Not Verified'}</span>
        </div>
        <button type="button" class="profile-card-button secondary" id="profileCardVerify" style="width:100%;margin-top:10px;">Send Verification Email</button>
        <p class="profile-card-message" id="profileCardVerifyMessage" aria-live="polite"></p>
      </div>
      <form id="profileCardPasswordForm" class="profile-card-section" novalidate>
        <h3>Change Password</h3>
        <label class="profile-card-field">Current Password<input id="profileCardCurrentPassword" type="password" autocomplete="current-password" required></label>
        <label class="profile-card-field">New Password<input id="profileCardNewPassword" type="password" autocomplete="new-password" minlength="6" required></label>
        <label class="profile-card-field">Confirm New Password<input id="profileCardConfirmPassword" type="password" autocomplete="new-password" minlength="6" required></label>
        <p class="profile-card-error" id="profileCardPasswordError" aria-live="polite"></p>
        <button type="submit" class="profile-card-button" style="width:100%;">Update Password</button>
        <p class="profile-card-message" id="profileCardPasswordMessage" aria-live="polite"></p>
      </form>
      <div class="profile-card-divider"></div>
      <div class="profile-card-section">
        <button type="button" class="profile-card-button danger" id="profileCardDelete">Delete Account</button>
        <div class="profile-card-delete-panel" id="profileCardDeletePanel">
          <p>Type DELETE and enter your password to permanently delete your account.</p>
          <input id="profileCardDeleteInput" type="text" autocomplete="off" aria-label="Type DELETE to confirm">
          <input id="profileCardDeletePassword" type="password" autocomplete="current-password" placeholder="Your password" aria-label="Your password">
          <div id="profileCardDeleteGoogleBtn" style="display:none; margin-bottom:8px;"></div>
          <button type="button" class="profile-card-button danger" id="profileCardConfirmDelete" disabled>Confirm Delete</button>
          <p class="profile-card-message" id="profileCardDeleteMessage" aria-live="polite"></p>
        </div>
      </div>
      <button type="button" class="profile-card-button logout logout-link">Logout</button>
    </section>
  `;
  document.body.appendChild(profileCardOverlay);

  const profileCardName = profileCardOverlay.querySelector('#profileCardName');
  const profileCardRole = profileCardOverlay.querySelector('#profileCardRole');
  const profileCardAvatar = profileCardOverlay.querySelector('#profileCardAvatar');
  const profileCardFullName = profileCardOverlay.querySelector('#profileCardFullName');

  function closeProfileCard() {
    profileCardOverlay.classList.remove('is-open');
    profileCardOverlay.setAttribute('aria-hidden', 'true');
  }

  function showProfileMessage(element, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add('is-visible');
    window.setTimeout(() => element.classList.remove('is-visible'), 2000);
  }

  function syncHeaderProfile(user) {
    const fullName = getDisplayName(user);
    const role = user.role === 'doctor' ? 'Doctor' : 'Premium Member';
    document.querySelectorAll('.profile-block, .profile, .user-chip').forEach((profileElement) => {
      const nameElement = profileElement.querySelector('.profile-name, .name, p:first-of-type');
      const roleElement = profileElement.querySelector('.profile-role, .role, .profile-id, p:nth-of-type(2)');
      const avatarElement = profileElement.querySelector('.avatar-circle, .avatar-patient, img');
      if (nameElement) nameElement.textContent = fullName;
      if (roleElement) roleElement.textContent = role;
      if (avatarElement && avatarElement.tagName !== 'IMG') avatarElement.textContent = getInitials(fullName);
    });
  }

  profileTriggers.forEach((trigger) => {
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('tabindex', '0');
    trigger.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      profileCardOverlay.classList.add('is-open');
      profileCardOverlay.setAttribute('aria-hidden', 'false');
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        profileCardOverlay.classList.add('is-open');
        profileCardOverlay.setAttribute('aria-hidden', 'false');
      }
    });
  });

  profileCardOverlay.querySelector('.profile-card-close').addEventListener('click', closeProfileCard);
  profileCardOverlay.addEventListener('click', (event) => {
    if (event.target === profileCardOverlay) closeProfileCard();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && profileCardOverlay.classList.contains('is-open')) closeProfileCard();
  });

  profileCardOverlay.querySelector('#profileCardEdit').addEventListener('click', () => {
    profileCardOverlay.querySelector('#profileCardPhotoInput').click();
  });
  profileCardOverlay.querySelector('#profileCardPhotoInput').addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      profileCardAvatar.innerHTML = `<img src="${reader.result}" alt="Profile photo preview">`;
    });
    reader.readAsDataURL(file);
  });

  profileCardOverlay.querySelector('#profileCardForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const fullName = profileCardFullName.value.trim();
    if (!fullName) {
      profileCardFullName.focus();
      return;
    }

    const nameMessageEl = profileCardOverlay.querySelector('#profileCardNameMessage');

    try {
      const res = await fetch(`${API_ROOT}/users/me`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ name: fullName })
      });
      const data = await res.json();

      if (!res.ok) {
        showProfileMessage(nameMessageEl, data.message || 'Could not update name');
        return;
      }

      profileUser.name = fullName;
      localStorage.setItem('user', JSON.stringify(profileUser));
      profileCardName.textContent = fullName;
      if (!profileCardAvatar.querySelector('img')) {
        profileCardAvatar.textContent = getInitials(fullName);
      }
      syncHeaderProfile(profileUser);
      showProfileMessage(nameMessageEl, 'Name updated successfully');
    } catch (error) {
      console.error('Update name error:', error);
      showProfileMessage(nameMessageEl, 'Unable to reach the server. Please try again.');
    }
  });

  profileCardOverlay.querySelector('#profileCardVerify').addEventListener('click', () => {
    showProfileMessage(profileCardOverlay.querySelector('#profileCardVerifyMessage'), 'Verification email would be sent');
  });

  profileCardOverlay.querySelector('#profileCardPasswordForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentPassword = profileCardOverlay.querySelector('#profileCardCurrentPassword').value;
    const newPassword = profileCardOverlay.querySelector('#profileCardNewPassword').value;
    const confirmPassword = profileCardOverlay.querySelector('#profileCardConfirmPassword').value;
    const errorElement = profileCardOverlay.querySelector('#profileCardPasswordError');
    const messageElement = profileCardOverlay.querySelector('#profileCardPasswordMessage');

    // Client-side checks first — catches obvious mistakes without even hitting the server.
    if (newPassword.length < 6 || newPassword !== confirmPassword) {
      errorElement.textContent = newPassword.length < 6 ? 'New password must be at least 6 characters.' : 'Passwords do not match.';
      return;
    }
    errorElement.textContent = '';

    try {
      const res = await fetch(`${API_ROOT}/users/me/password`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        // Server-side checks (e.g. wrong current password) surface here instead.
        errorElement.textContent = data.message || 'Could not update password';
        return;
      }

      showProfileMessage(messageElement, 'Password updated successfully');
      event.target.reset();
    } catch (error) {
      console.error('Change password error:', error);
      errorElement.textContent = 'Unable to reach the server. Please try again.';
    }
  });

  const deletePanel = profileCardOverlay.querySelector('#profileCardDeletePanel');
  const deleteInput = profileCardOverlay.querySelector('#profileCardDeleteInput');
  const deletePasswordInput = profileCardOverlay.querySelector('#profileCardDeletePassword');
  const deleteGoogleContainer = profileCardOverlay.querySelector('#profileCardDeleteGoogleBtn');
  const confirmDelete = profileCardOverlay.querySelector('#profileCardConfirmDelete');
  const deleteMessageEl = profileCardOverlay.querySelector('#profileCardDeleteMessage');

  profileCardOverlay.querySelector('#profileCardDelete').addEventListener('click', () => {
    deletePanel.classList.add('is-visible');
    deleteInput.focus();
  });

  // A pure Google account has no password to re-enter, so "proof of intent" has to
  // come from signing in with Google again, right now — not from a password field
  // that doesn't exist. This renders a real Google button in its place, once the
  // user has typed DELETE, and only renders it once (GSI doesn't like being asked
  // to render into the same container repeatedly).
  function renderDeleteGoogleButton() {
    if (deleteGoogleContainer.dataset.rendered) return;
    if (typeof google === 'undefined' || !google.accounts?.id) {
      deleteGoogleContainer.innerHTML = '<p style="color:var(--error,#ba1a1a);font-size:12px;margin:0 0 8px;">Google sign-in is still loading — please wait a moment.</p>';
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        try {
          const res = await fetch(`${API_ROOT}/users/me`, {
            method: 'DELETE',
            headers: authHeaders(),
            body: JSON.stringify({ idToken: response.credential })
          });
          const data = await res.json();

          if (!res.ok) {
            showProfileMessage(deleteMessageEl, data.message || 'Could not delete account');
            return;
          }

          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '../HTML/login.html';
        } catch (error) {
          console.error('Delete account (Google) error:', error);
          showProfileMessage(deleteMessageEl, 'Unable to reach the server. Please try again.');
        }
      }
    });
    google.accounts.id.renderButton(deleteGoogleContainer, { theme: 'outline', size: 'medium', text: 'continue_with' });
    deleteGoogleContainer.dataset.rendered = '1';
  }

  function updateDeleteButtonState() {
    const deleteTyped = deleteInput.value.trim() === 'DELETE';

    if (currentHasPassword) {
      deletePasswordInput.style.display = '';
      deleteGoogleContainer.style.display = 'none';
      confirmDelete.style.display = '';
      confirmDelete.disabled = !deleteTyped || deletePasswordInput.value.length === 0;
    } else {
      // No password exists on this account — the generic password-based confirm
      // button doesn't apply here at all; the Google button below IS the confirm step.
      deletePasswordInput.style.display = 'none';
      confirmDelete.style.display = 'none';
      deleteGoogleContainer.style.display = deleteTyped ? '' : 'none';
      if (deleteTyped) renderDeleteGoogleButton();
    }
  }
  deleteInput.addEventListener('input', updateDeleteButtonState);
  deletePasswordInput.addEventListener('input', updateDeleteButtonState);
  updateDeleteButtonState();

  confirmDelete.addEventListener('click', async () => {
    const password = deletePasswordInput.value;

    try {
      const res = await fetch(`${API_ROOT}/users/me`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ password })
      });
      const data = await res.json();

      if (!res.ok) {
        showProfileMessage(deleteMessageEl, data.message || 'Could not delete account');
        return;
      }

      // Account is gone — clear local session and send them to login, same as logout.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '../HTML/login.html';
    } catch (error) {
      console.error('Delete account error:', error);
      showProfileMessage(deleteMessageEl, 'Unable to reach the server. Please try again.');
    }
  });

  profileCardOverlay.querySelector('.logout-link').addEventListener('click', logoutUser);
  syncHeaderProfile(profileUser);

  // --- Branch the card's UI by how this account actually authenticates ---
  // localStorage may be stale (an older session from before this feature existed,
  // or hasPassword changing within this same session), so refresh from the server
  // once and apply the real picture rather than trusting what's cached.
  const passwordFormHeading = profileCardOverlay.querySelector('#profileCardPasswordForm h3');
  const passwordSubmitBtn = profileCardOverlay.querySelector('#profileCardPasswordForm button[type="submit"]');
  const emailInputEl = profileCardOverlay.querySelector('.profile-card-email-row input[type="email"]');
  const emailBadgeEl = profileCardOverlay.querySelector('.profile-card-badge');
  const verifyBtn = profileCardOverlay.querySelector('#profileCardVerify');

  function applyAuthProviderUI(user) {
    currentHasPassword = user.hasPassword !== false;

    if (currentPasswordField) {
      const label = currentPasswordField.closest('label');
      if (label) label.style.display = currentHasPassword ? '' : 'none';
      currentPasswordField.required = currentHasPassword;
    }
    if (passwordFormHeading) {
      passwordFormHeading.textContent = currentHasPassword ? 'Change Password' : 'Set a Password';
    }
    if (passwordSubmitBtn) {
      passwordSubmitBtn.textContent = currentHasPassword ? 'Update Password' : 'Set Password';
    }

    if (emailInputEl && user.email) emailInputEl.value = user.email;
    if (emailBadgeEl) {
      emailBadgeEl.textContent = user.emailVerified ? 'Verified' : 'Not Verified';
      emailBadgeEl.classList.toggle('is-verified', !!user.emailVerified);
    }
    // Google already verifies the email before this app ever sees it — there's
    // nothing for a "send verification email" button to do for that account.
    if (verifyBtn) verifyBtn.style.display = user.emailVerified ? 'none' : '';

    updateDeleteButtonState();
  }

  const currentPasswordField = profileCardOverlay.querySelector('#profileCardCurrentPassword');

  (async () => {
    try {
      const res = await fetch(`${API_ROOT}/users/me`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) return; // keep whatever localStorage had; not worth surfacing an error for a background refresh

      profileUser = { ...profileUser, ...data.user };
      localStorage.setItem('user', JSON.stringify(profileUser));
      applyAuthProviderUI(profileUser);
    } catch (error) {
      console.error('Refresh profile error:', error);
      // Network hiccup on a background refresh — the card still works with
      // whatever was already in localStorage, just possibly slightly stale.
    }
  })();
}

// ===================== Medical records =====================

const medicalRecordList = document.querySelector('#medicalRecordList');
const recordSearchInput = document.querySelector('.search-box input[placeholder="Search records, doctors..."]');
const recordModal = document.querySelector('#medicalRecordModal');
const recordFilterButton = document.querySelector('#recordFilterButton');
const recordSortButton = document.querySelector('#recordSortButton');
const loadPreviousRecordsButton = document.querySelector('#loadPreviousRecords');
const recordPageSize = 5;
let medicalRecords = [];
let visibleRecordCount = recordPageSize;
let recordFilterMode = 'all';
let recordSortDescending = true;

function formatRecordDate(value) {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderMedicalRecordSummary(records) {
  const total = document.querySelector('#recordTotal');
  const latestDate = document.querySelector('#recordLatestDate');
  const prescriptionCount = document.querySelector('#recordPrescriptionCount');
  const doctorCount = document.querySelector('#recordDoctorCount');
  const newBadge = document.querySelector('#recordNewBadge');

  if (total) total.textContent = records.length;
  if (latestDate) latestDate.textContent = records[0] ? `Last: ${formatRecordDate(records[0].createdAt)}` : 'Last: --';
  if (prescriptionCount) prescriptionCount.textContent = records.filter((record) => record.prescription).length;
  if (doctorCount) doctorCount.textContent = new Set(records.map((record) => record.doctor?._id || record.doctor)).size;
  if (newBadge) newBadge.textContent = records.length ? `${records.length} LIVE` : 'EMPTY';
}

function getFilteredMedicalRecords() {
  const query = (recordSearchInput?.value || '').trim().toLowerCase();
  return medicalRecords
    .filter((record) => recordFilterMode === 'all' || Boolean(record.prescription?.trim()))
    .filter((record) => [
      record.diagnosis,
      record.notes,
      record.prescription,
      record.doctor?.name,
      record.doctor?.email
    ].some((value) => String(value || '').toLowerCase().includes(query)))
    .sort((first, second) => {
      const firstDate = new Date(first.createdAt || 0).getTime();
      const secondDate = new Date(second.createdAt || 0).getTime();
      return recordSortDescending ? secondDate - firstDate : firstDate - secondDate;
    });
}

function updateMedicalRecordControls(filteredCount) {
  if (loadPreviousRecordsButton) {
    const hasMore = visibleRecordCount < filteredCount;
    loadPreviousRecordsButton.disabled = !hasMore;
    loadPreviousRecordsButton.textContent = hasMore ? 'Load Previous Records' : 'All Records Loaded';
  }
  if (recordFilterButton) {
    recordFilterButton.classList.toggle('active', recordFilterMode === 'prescriptions');
    recordFilterButton.title = recordFilterMode === 'all' ? 'Show records with prescriptions' : 'Show all records';
  }
  if (recordSortButton) {
    recordSortButton.classList.toggle('active', !recordSortDescending);
    recordSortButton.title = recordSortDescending ? 'Sort oldest first' : 'Sort newest first';
  }
}

function renderMedicalRecords() {
  if (!medicalRecordList) return;

  const filteredRecords = getFilteredMedicalRecords();
  const recordsToRender = filteredRecords.slice(0, visibleRecordCount);
  updateMedicalRecordControls(filteredRecords.length);

  if (!filteredRecords.length) {
    medicalRecordList.innerHTML = `<p class="record-state">${recordFilterMode === 'prescriptions' ? 'No records with prescriptions found.' : 'No medical records found.'}</p>`;
    return;
  }

  medicalRecordList.innerHTML = recordsToRender.map((record) => `
    <div>
      <div class="doc-row">
        <div class="doc-icon"><svg class="icon" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="13" x2="15" y2="13"></line><line x1="9" y1="17" x2="13" y2="17"></line></svg></div>
        <div class="doc-info">
          <h5 class="doc-title">${escapeHtml(record.diagnosis)}</h5>
          <p class="doc-meta">${escapeHtml(formatRecordDate(record.createdAt))} &bull; ${escapeHtml(record.doctor?.name || 'Care team')}</p>
        </div>
        <div class="doc-status"><span class="status-badge status-reviewed">DOCUMENTED</span></div>
        <button class="view-btn view-record-detail" type="button" data-id="${escapeHtml(record._id)}">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          View details
        </button>
      </div>
    </div>
  `).join('');

  medicalRecordList.querySelectorAll('.view-record-detail').forEach((button) => {
    button.addEventListener('click', () => openMedicalRecord(button.dataset.id));
  });
}

function setRecordModalValue(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value || 'Not provided';
}

function closeMedicalRecord() {
  if (!recordModal) return;
  recordModal.classList.remove('is-open');
  recordModal.setAttribute('aria-hidden', 'true');
}

async function openMedicalRecord(recordId) {
  if (!recordModal || !recordId) return;
  try {
    const response = await fetch(`${API_ROOT}/medical-records/${encodeURIComponent(recordId)}`, { headers: authHeaders() });
    const record = await response.json();
    if (!response.ok) {
      alert(record.message || 'Could not load this medical record.');
      return;
    }

    setRecordModalValue('#recordModalTitle', record.diagnosis);
    setRecordModalValue('#recordModalDate', formatRecordDate(record.createdAt));
    setRecordModalValue('#recordModalDoctor', record.doctor?.name || record.doctor?.email || 'Care team');
    setRecordModalValue('#recordModalDiagnosis', record.diagnosis);
    setRecordModalValue('#recordModalNotes', record.notes);
    setRecordModalValue('#recordModalPrescription', record.prescription);
    recordModal.classList.add('is-open');
    recordModal.setAttribute('aria-hidden', 'false');
  } catch (error) {
    console.error('Load medical record error:', error);
    alert('Unable to reach the server. Please try again.');
  }
}

async function loadMedicalRecords() {
  if (!medicalRecordList) return;
  try {
    const response = await fetch(`${API_ROOT}/medical-records/my`, { headers: authHeaders() });
    const data = await response.json();
    if (!response.ok) {
      medicalRecordList.innerHTML = `<p class="record-state record-error">${escapeHtml(data.message || 'Could not load medical records.')}</p>`;
      return;
    }
    medicalRecords = Array.isArray(data) ? data : [];
    renderMedicalRecordSummary(medicalRecords);
    renderMedicalRecords();
  } catch (error) {
    console.error('Load medical records error:', error);
    medicalRecordList.innerHTML = '<p class="record-state record-error">Unable to reach the server. Please try again.</p>';
  }
}

if (medicalRecordList) {
  loadMedicalRecords();
  recordSearchInput?.addEventListener('input', () => {
    visibleRecordCount = recordPageSize;
    renderMedicalRecords();
  });
  loadPreviousRecordsButton?.addEventListener('click', () => {
    visibleRecordCount += recordPageSize;
    renderMedicalRecords();
  });
  recordFilterButton?.addEventListener('click', () => {
    recordFilterMode = recordFilterMode === 'all' ? 'prescriptions' : 'all';
    visibleRecordCount = recordPageSize;
    renderMedicalRecords();
  });
  recordSortButton?.addEventListener('click', () => {
    recordSortDescending = !recordSortDescending;
    visibleRecordCount = recordPageSize;
    renderMedicalRecords();
  });
  document.querySelector('#closeRecordModal')?.addEventListener('click', closeMedicalRecord);
  recordModal?.addEventListener('click', (event) => {
    if (event.target === recordModal) closeMedicalRecord();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMedicalRecord();
  });
}