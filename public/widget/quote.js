(function() {
  'use strict';
  
  // Get reseller ID from script URL
  const scriptTag = document.currentScript || document.querySelector('script[src*="widget/quote.js"]');
  const urlParams = new URLSearchParams(scriptTag.src.split('?')[1]);
  const resellerId = urlParams.get('reseller') || 'default';
  
  // Widget configuration - in production this would be fetched from API
  const widgetConfig = {
    resellerId: resellerId,
    branding: {
      primaryColor: '#2563eb',
      companyName: 'Premium Insurance Partners',
      logoUrl: ''
    },
    products: [
      { id: 'auto', name: 'Auto Protection', enabled: true },
      { id: 'home', name: 'Home Protection', enabled: true },
      { id: 'multi', name: 'Multi-Vehicle Plan', enabled: true }
    ]
  };

  // Create widget HTML
  function createWidget() {
    const widgetId = `tpa-quote-widget-${resellerId}`;
    const container = document.getElementById(widgetId);
    
    if (!container) {
      console.error('TPA Quote Widget: Container element not found');
      return;
    }

    const html = `
      <div class="tpa-widget-content">
        <div class="tpa-widget-header">
          ${widgetConfig.branding.logoUrl ? 
            `<img src="${widgetConfig.branding.logoUrl}" alt="${widgetConfig.branding.companyName}" class="tpa-widget-logo">` : 
            ''
          }
          <h3>${widgetConfig.branding.companyName || 'Get Your Quote'}</h3>
          <p>Comprehensive protection plans</p>
        </div>
        
        <form class="tpa-widget-form" id="tpa-widget-form-${resellerId}">
          <div class="tpa-form-group">
            <label for="tpa-name-${resellerId}">Full Name *</label>
            <input type="text" id="tpa-name-${resellerId}" name="name" required placeholder="Enter your full name">
          </div>
          
          <div class="tpa-form-group">
            <label for="tpa-email-${resellerId}">Email Address *</label>
            <input type="email" id="tpa-email-${resellerId}" name="email" required placeholder="your@email.com">
          </div>
          
          <div class="tpa-form-group">
            <label for="tpa-product-${resellerId}">Protection Plan *</label>
            <select id="tpa-product-${resellerId}" name="product" required>
              <option value="">Select a plan...</option>
              ${widgetConfig.products.filter(p => p.enabled).map(product => 
                `<option value="${product.id}">${product.name}</option>`
              ).join('')}
            </select>
          </div>
          
          <div class="tpa-form-group">
            <label for="tpa-vin-${resellerId}">VIN Number (Optional)</label>
            <input type="text" id="tpa-vin-${resellerId}" name="vin" maxlength="17" placeholder="Enter VIN for auto quotes">
          </div>
          
          <button type="submit" class="tpa-submit-btn" style="background-color: ${widgetConfig.branding.primaryColor}">
            Get Free Quote
          </button>
          
          <p class="tpa-disclaimer">No obligation • Instant results • Secure & confidential</p>
        </form>
        
        <div class="tpa-success-message" id="tpa-success-${resellerId}" style="display: none;">
          <h4>Thank you!</h4>
          <p>Your quote request has been submitted. We'll contact you shortly with your personalized quote.</p>
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Add form submission handler
    const form = document.getElementById(`tpa-widget-form-${resellerId}`);
    const successMessage = document.getElementById(`tpa-success-${resellerId}`);

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        resellerId: resellerId,
        name: formData.get('name'),
        email: formData.get('email'),
        product: formData.get('product'),
        vin: formData.get('vin'),
        source: 'widget',
        timestamp: new Date().toISOString()
      };

      // In production, this would submit to the API
      console.log('Quote request submitted:', data);
      
      // Show success message
      form.style.display = 'none';
      successMessage.style.display = 'block';

      // Optional: Send to parent window for tracking
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'tpa-widget-quote-submitted',
          data: data
        }, '*');
      }
    });
  }

  // Add widget styles
  function addStyles() {
    const styleId = `tpa-widget-styles-${resellerId}`;
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      #tpa-quote-widget-${resellerId} {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 400px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        background: white;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      
      #tpa-quote-widget-${resellerId} .tpa-widget-header {
        text-align: center;
        margin-bottom: 20px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-widget-logo {
        height: 40px;
        margin-bottom: 10px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-widget-header h3 {
        margin: 0 0 5px 0;
        color: ${widgetConfig.branding.primaryColor};
        font-size: 18px;
        font-weight: 600;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-widget-header p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-widget-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-form-group {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-form-group label {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-form-group input,
      #tpa-quote-widget-${resellerId} .tpa-form-group select {
        padding: 10px 12px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-form-group input:focus,
      #tpa-quote-widget-${resellerId} .tpa-form-group select:focus {
        outline: none;
        border-color: ${widgetConfig.branding.primaryColor};
        box-shadow: 0 0 0 3px ${widgetConfig.branding.primaryColor}20;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-submit-btn {
        background: ${widgetConfig.branding.primaryColor};
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: opacity 0.2s;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-submit-btn:hover {
        opacity: 0.9;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-disclaimer {
        text-align: center;
        font-size: 12px;
        color: #6b7280;
        margin: 10px 0 0 0;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-success-message {
        text-align: center;
        padding: 20px;
        background: #f0f9ff;
        border: 1px solid #0ea5e9;
        border-radius: 6px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-success-message h4 {
        margin: 0 0 10px 0;
        color: #0ea5e9;
        font-size: 16px;
      }
      
      #tpa-quote-widget-${resellerId} .tpa-success-message p {
        margin: 0;
        color: #075985;
        font-size: 14px;
      }
    `;
    
    document.head.appendChild(style);
  }

  // Initialize widget when DOM is ready
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        addStyles();
        createWidget();
      });
    } else {
      addStyles();
      createWidget();
    }
  }

  init();
})();