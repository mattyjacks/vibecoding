/**
 * Tri State Honey - Product Modal, Spec Viewer & Category Filter Controller
 */
(function () {
  'use strict';

  // Inlined fallback to guarantee instant modal launch even on file:// protocol or offline
  const fallbackProducts = [
    {
      "id": "tsh-1lb-bear",
      "name": "1 lb Honey Bear Bottle",
      "subtitle": "Pure Golden Honey in Iconic Squeeze Bear",
      "category": "Retail",
      "sizes": ["1 lb (16 oz)"],
      "packaging": "Iconic bear shaped squeeze bottle with flip-top cap",
      "image": "assets/images/tsh-1-lb-bear.png",
      "description": "Our signature 1 lb Honey Bear brings sweetness to every table. Perfect for retail shelves, gift baskets, and private labeling.",
      "features": [
        "100% Pure, Unadulterated Honey",
        "Private labeling available for orders of any size",
        "Non-crystallizing long shelf life",
        "BPA-free recyclable bottle"
      ],
      "specifications": {
        "Origin": "India & Global floral reserves",
        "Standards": "Kosher, Halal, HACCP Certified, FDA Compliant",
        "Testing": "C3/C4 Sugar test, Pollen analysis, HRMS & NMR tested",
        "Moisture": "< 18.5%"
      }
    },
    {
      "id": "tsh-2lb-bottle",
      "name": "2 lb Classic Honey Bottle",
      "subtitle": "Family & Food-Service Squeeze Bottle",
      "category": "Retail",
      "sizes": ["2 lb (32 oz)"],
      "packaging": "Clear ribbed squeeze dispenser bottle",
      "image": "assets/images/tsh-2-lb-bottle.png",
      "description": "Double the pure liquid gold. Specially designed for families, breakfast diners, bakeries, and high-volume retail.",
      "features": [
        "Custom branded private labeling",
        "No-drip silicone valve dispense cap",
        "True Source Certified or conventional blends available",
        "Guaranteed zero added sugars, syrups or adulterants"
      ],
      "specifications": {
        "Origin": "India & Global floral reserves",
        "Standards": "Kosher, Halal, HACCP, FDA Registered",
        "Testing": "NMR & HRMS verified purity",
        "Color Grade": "Light Amber / Extra Light Amber"
      }
    },
    {
      "id": "tsh-60lb-bucket",
      "name": "60 lb Bulk Pail / Bucket",
      "subtitle": "USA Stocked Commercial Grade Pail",
      "category": "Food Service & Bulk",
      "sizes": ["60 lb (approx. 5 gallons)"],
      "packaging": "Heavy-duty food-grade HDPE pail with tamper-evident gasket lid",
      "image": "assets/images/tsh-60-lb-bucket.png",
      "description": "The workhorse container for bakeries, breweries, meaderies, and restaurant kitchens. In-stock in New Jersey for fast nationwide dispatch.",
      "features": [
        "Stocked and packed in NJ, USA for rapid domestic delivery",
        "Heavy duty wire bail with plastic hand grip",
        "Pour spout or solid tear-strip lid options",
        "Significant volume discounts vs retail packaging"
      ],
      "specifications": {
        "Origin": "India & USA Packed",
        "Standards": "Non-GMO, HACCP, FDA Compliant Facility",
        "Testing": "Full 4-tier laboratory purity certification",
        "Net Weight": "60 lbs (27.2 kg)"
      }
    },
    {
      "id": "tsh-660lb-drum",
      "name": "660 lb Industrial Steel Drum",
      "subtitle": "Industrial Food Manufacturing Grade",
      "category": "Manufacturing",
      "sizes": ["660 lb (approx. 55 gallons)"],
      "packaging": "Food-grade lined steel drum with secure locking ring",
      "image": "assets/images/tsh-660-lb-drum.png",
      "description": "Engineered for industrial beverage, confectionery, sauce, and cereal manufacturers. Unbeatable wholesale prices direct from source.",
      "features": [
        "Epoxy-phenolic food grade inner lining",
        "Tamper-evident bolt ring closure",
        "Full batch certificates of analysis (CoA) included",
        "Optimized for automated drum unloading and pumping"
      ],
      "specifications": {
        "Origin": "Direct Import & NJ Distribution",
        "Standards": "Kosher, Halal, HACCP, Global Food Safety Initiative",
        "Testing": "NMR spectroscopy & HRMS mass spectrometry certified",
        "Net Weight": "660 lbs (300 kg)"
      }
    },
    {
      "id": "tsh-3000lb-tote",
      "name": "3,000 lb Industrial IBC Tote",
      "subtitle": "Maximum Capacity Liquid Gold Logistics",
      "category": "Manufacturing",
      "sizes": ["3,000 lb (approx. 275 gallons / IBC Pallet)"],
      "packaging": "Rigid composite IBC container with galvanized steel cage & bottom valve",
      "image": "assets/images/tsh-3000-lb-tote.png",
      "description": "Massive volume for national food brands and co-packers. Available in full container load (FCL) multi-tote direct shipments or NJ warehouse pickup.",
      "features": [
        "Maximum cost efficiency per pound in the industry",
        "Heavy-duty galvanized steel outer cage with pallet base",
        "Integrated 2-inch or 3-inch camlock bottom discharge valve",
        "Full FCL container optimization support"
      ],
      "specifications": {
        "Origin": "India & USA Stocked",
        "Standards": "Full FDA Compliance, HACCP Certified",
        "Testing": "NMR, HRMS, C3/C4, Pollen Verified",
        "Net Weight": "3,000 lbs (1,360 kg)"
      }
    }
  ];

  let productsData = fallbackProducts;

  function fetchProducts() {
    fetch('assets/data/products.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          productsData = data;
        }
      })
      .catch(() => {
        // Fallback already assigned
      })
      .finally(() => {
        setupModalListeners();
        setupFilterListeners();
        setupCatalogSearch();
      });
  }

  function setupModalListeners() {
    const modalBackdrop = document.getElementById('tshProductModal');
    const closeBtn = document.getElementById('tshModalClose');
    const detailBtns = document.querySelectorAll('[data-product-id]');

    if (!modalBackdrop) return;

    detailBtns.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const prodId = this.getAttribute('data-product-id');
        const product = productsData.find(p => p.id === prodId);
        if (product) {
          populateModal(product);
          openModal();
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    modalBackdrop.addEventListener('click', function (e) {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modalBackdrop.classList.contains('is-active')) {
        closeModal();
      }
    });
  }

  function populateModal(product) {
    const titleEl = document.getElementById('modalTitle');
    const subEl = document.getElementById('modalSubtitle');
    const descEl = document.getElementById('modalDesc');
    const badgeEl = document.getElementById('modalCategoryBadge');
    
    if (titleEl) titleEl.textContent = product.name;
    if (subEl) subEl.textContent = product.subtitle;
    if (descEl) descEl.textContent = product.description;
    if (badgeEl) badgeEl.textContent = product.category || 'Wholesale Honey';

    const imgEl = document.getElementById('modalImg');
    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
    }

    const featsList = document.getElementById('modalFeatures');
    if (featsList) {
      featsList.innerHTML = product.features.map(f => `<li style="display:flex; align-items:center; gap:0.5rem;"><span style="color:#10b981; font-weight:800;"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 8 7 12 13 4"></polyline></svg></span> ${f}</li>`).join('');
    }

    const specsTable = document.getElementById('modalSpecs');
    if (specsTable && product.specifications) {
      specsTable.innerHTML = Object.entries(product.specifications)
        .map(([k, v]) => `<tr><td class="label">${k}</td><td class="value">${v}</td></tr>`)
        .join('');
    }

    const sampleBtn = document.getElementById('modalSampleCta');
    if (sampleBtn) {
      sampleBtn.setAttribute('href', `#contact`);
      sampleBtn.onclick = function(e) {
        closeModal();
        const select = document.getElementById('inquiryProduct');
        if (select) {
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text.includes(product.name) || select.options[i].value.includes(product.name)) {
              select.selectedIndex = i;
              break;
            }
          }
        }
      };
    }
  }

  function openModal() {
    const modalBackdrop = document.getElementById('tshProductModal');
    if (modalBackdrop) {
      modalBackdrop.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    const modalBackdrop = document.getElementById('tshProductModal');
    if (modalBackdrop) {
      modalBackdrop.classList.remove('is-active');
      document.body.style.overflow = '';
    }
  }

  // Interactive Category Filter for Products Section
  function setupFilterListeners() {
    const filterBtns = document.querySelectorAll('#productFilterBar .tsh-filter-btn');
    const productCards = document.querySelectorAll('#productsGridContainer .tsh-product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        productCards.forEach(card => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // Real-time Search in Catalog Section
  function setupCatalogSearch() {
    const searchInput = document.getElementById('catalogSearchInput');
    const catalogCards = document.querySelectorAll('#catalogGrid .tsh-catalog-card');

    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      catalogCards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const keywords = card.getAttribute('data-keywords') || '';
        if (text.includes(query) || keywords.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', fetchProducts);
})();
