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

        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();

            const emailValue = emailInput ? emailInput.value.trim() : '';
            const passwordValue = passwordInput ? passwordInput.value : '';
            let isValid = true;

            clearError(emailInput, emailError);
            clearError(passwordInput, passwordError);

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

            const targetUrl = doctorTab && doctorTab.classList.contains('active-tab')
                ? '../HTML/doctor-dashboard.html'
                : '../HTML/patient-dashboard.html';

            window.location.href = targetUrl;
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
      const passwordInput = signupForm.querySelector('#password');
      const termsInput = signupForm.querySelector('#terms');
      const submitButton = signupForm.querySelector('.submit-btn');

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

      signupForm.addEventListener('submit', function(event) {
          event.preventDefault();

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
              submitButton.textContent = 'Redirecting...';
          }

          window.location.href = '../HTML/login.html';
      });
  }


// sign in functionality ends here: 


// doctor dashboard functionality starts from here:




// patient directory functionality starts from here:

  // Search focus ring
  var searchInput = document.querySelector('.search-wrap input');
  searchInput.addEventListener('focus', function () {
    searchInput.style.boxShadow = '0 0 0 2px rgba(50,79,70,0.2)';
  });
  searchInput.addEventListener('blur', function () {
    searchInput.style.boxShadow = 'none';
  });

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



// patient-dashboard functionality starts from here:

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

    //   Health-vault functionality starts from here:

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

// patient-dashboard functionality ends here: