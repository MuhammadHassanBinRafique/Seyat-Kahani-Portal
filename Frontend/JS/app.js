const API_BASE_URL = 'https://seyat-kahani-portal-production.up.railway.app/api/auth';
// const API_BASE_URL = 'http://localhost:5000/api/auth';


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

    document.querySelectorAll('.logout-link').forEach(function (logoutLink) {
        logoutLink.addEventListener('click', function (event) {
            event.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/Frontend/HTML/login.html';
        });
    });

 // Simple micro-interaction for smooth scrolling or active states
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            console.log('Navigating to section...');
        });
    });

    // Initialize progress bar animation
    window.addEventListener('DOMContentLoaded', () => {
        const progress = document.getElementById('goalProgress');
        if (progress) {
            progress.style.width = '0%';
            setTimeout(() => {
                progress.style.width = '85%';
            }, 300);
        }
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

 const API_ROOT = 'https://seyat-kahani-portal-production.up.railway.app/api';
 // const API_ROOT = 'http://localhost:5000/api';

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
  return upcomingAppointments.slice(start, start + APPT_PAGE_SIZE);
}

function renderUpcomingAppointmentsPage() {
  if (!upcomingApptContainer) return;

  const totalPages = Math.max(1, Math.ceil(upcomingAppointments.length / APPT_PAGE_SIZE));
  currentUpcomingPage = Math.min(currentUpcomingPage, totalPages);

  const pageItems = getUpcomingPageItems();

  if (upcomingAppointments.length === 0) {
    upcomingApptContainer.innerHTML = '<p class="appt-empty-state">No upcoming appointments yet.</p>';
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
            <h4>${appt.doctor?.name || 'Unknown'}</h4>
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
        currentUpcomingPage = Math.min(Math.ceil(upcomingAppointments.length / APPT_PAGE_SIZE), currentUpcomingPage + 1);
      }
      renderUpcomingAppointmentsPage();
    });
  });
}

function renderRecentAppointmentsPage() {
  if (!recentAppointmentsContainer) return;

  const totalPages = Math.max(1, Math.ceil(recentAppointments.length / APPT_PAGE_SIZE));
  currentRecentPage = Math.min(currentRecentPage, totalPages);
  const start = (currentRecentPage - 1) * APPT_PAGE_SIZE;
  const pageItems = recentAppointments.slice(start, start + APPT_PAGE_SIZE);

  if (recentAppointments.length === 0) {
    recentAppointmentsContainer.innerHTML = '<p class="appt-empty-state">No completed appointments yet.</p>';
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

if (upcomingApptContainer) {
  loadMyAppointments();
}

loadCurrentUserProfile();

// ---------- Doctor-side: appointment.html table ----------
const doctorApptTableBody = document.querySelector('#doctorApptTableBody');

async function loadDoctorAppointments() {
  if (!doctorApptTableBody) return;

  try {
    const res = await fetch(`${API_ROOT}/appointments/my`, { headers: authHeaders() });
    const appointments = await res.json();

    if (!res.ok || appointments.length === 0) {
      doctorApptTableBody.innerHTML = `<tr><td colspan="5">No appointments found.</td></tr>`;
      return;
    }

    doctorApptTableBody.innerHTML = appointments.map((appt) => `
      <tr>
        <td>${appt.patient?.name || 'Unknown'}</td>
        <td>${appt.date} &nbsp; ${appt.time}</td>
        <td>${appt.reason}</td>
        <td><span class="badge badge-${appt.status}">${appt.status.toUpperCase()}</span></td>
        <td class="right">
          <div class="row-actions">
            ${appt.status === 'pending' ? `<button class="action-btn confirm-btn" data-id="${appt._id}">Confirm</button>` : ''}
            ${appt.status === 'confirmed' ? `<button class="action-btn complete-btn" data-id="${appt._id}">Complete</button>` : ''}
            ${['pending', 'confirmed'].includes(appt.status) ? `<button class="action-btn cancel-btn" data-id="${appt._id}">Cancel</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    const updateStatus = async (id, status) => {
      try {
        const res = await fetch(`${API_ROOT}/appointments/${id}/status`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ status })
        });
        const data = await res.json();
        if (!res.ok) {
          alert(data.message || 'Could not update status');
          return;
        }
        loadDoctorAppointments();
      } catch (error) {
        console.error('Update status error:', error);
      }
    };

    document.querySelectorAll('.confirm-btn').forEach((btn) =>
      btn.addEventListener('click', () => updateStatus(btn.getAttribute('data-id'), 'confirmed')));
    document.querySelectorAll('.complete-btn').forEach((btn) =>
      btn.addEventListener('click', () => updateStatus(btn.getAttribute('data-id'), 'completed')));
    document.querySelectorAll('.cancel-btn').forEach((btn) =>
      btn.addEventListener('click', () => updateStatus(btn.getAttribute('data-id'), 'cancelled')));

  } catch (error) {
    console.error('Load doctor appointments error:', error);
  }
}

if (doctorApptTableBody) {
  loadDoctorAppointments();
}