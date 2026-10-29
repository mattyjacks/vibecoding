/**
 * Tri State Honey - Product Modal & Spec Viewer Controller
 * Includes embedded fallback data to ensure modal functions seamlessly offline or without local server fetch
 */
(function () {
  'use strict';

  const defaultProducts = [
    {
      "id": "tsh-1lb-bear",
      "name": "1 lb Honey Bear Bottle",
      "subtitle": "Pure Golden Honey in Iconic Squeeze Bear",
      "category": "Retail",
      "sizes": ["1 lb (16 oz)"],
      "packaging": "Iconic bear shaped squeeze bottle with flip-top cap",
      "image": "assets/images/tsh-1-lb-bear.png",
      "description": "Our signature 1 lb Honey Bear brings sweetness to every table. Perfect for supermarket shelves, specialty food markets, gift baskets, and private labeling.",
      "features": [
        "100% Pure, Unadulterated Honey with zero added corn syrup",
        "Turnkey private labeling with your custom brand & barcode",
        "Naturally non-crystallizing for ultra-long shelf stability",
        "BPA-free recyclable food grade squeeze bottle"
      ],
      "specifications": {
        "Origin": "India & Global Floral Reserves",
        "Certifications": "Certified Kosher, Halal, HACCP Safe, FDA Compliant",
        "Laboratory Tests": "Passed C3/C4 Sugar Analysis, Pollen, HRMS & NMR",
        "Moisture Content": "< 18.5%",
        "Packing": "Case of 12 or 24 bottles"
      }
    },
    {
      "id": "tsh-2lb-bottle",
      "name": "2 lb Classic Honey Bottle",
      "subtitle": "Family & Commercial Food-Service Squeeze Bottle",
      "category": "Retail",
      "sizes": ["2 lb (32 oz)"],
      "packaging": "Clear ribbed squeeze dispenser bottle",
      "image": "assets/images/tsh-2-lb-bottle.png",
      "description": "Double the pure liquid gold. Specially designed for high-turnover families, breakfast diners, restaurants, and commercial bakeries.",
      "features": [
        "Custom branded private labeling available at low minimums",
        "Clean-dispense no-drip silicone valve cap",
        "True Source Certified or conventional floral blend varieties",
        "Strictly tested to be free from lead, mercury, and chemical residues"
      ],
      "specifications": {
        "Origin": "India & Global Floral Reserves",
        "Certifications": "Kosher, Halal, HACCP, FDA Registered",
        "Testing": "NMR & HRMS verified molecular purity",
        "Color Grade": "Light Amber / Extra Light Amber",
        "Packing": "Case of 12 bottles"
      }
    },
    {
      "id": "tsh-60lb-bucket",
      "name": "60 lb Bulk Pail / Bucket",
      "subtitle": "USA Stocked Commercial Grade Pail (NJ Warehouse)",
      "category": "Bulk",
      "sizes": ["60 lb (approx. 5 gallons)"],
      "packaging": "Heavy-duty food-grade HDPE pail with tamper-evident gasket lid",
      "image": "assets/images/tsh-60-lb-bucket.png",
      "description": "The indispensable bulk workhorse for craft breweries, commercial bakeries, meaderies, and restaurant commissary kitchens. In-stock in New Jersey for lightning-fast delivery.",
      "features": [
        "Stocked and packed in NJ, USA for rapid domestic delivery",
        "Heavy-duty steel bail with comfortable plastic carry grip",
        "Available with pour-spout lid or solid tear-strip gasket lid",
        "Huge wholesale cost savings over distributor retail packs"
      ],
      "specifications": {
        "Origin": "India & USA Packed Hub",
        "Certifications": "Non-GMO, HACCP, FDA Compliant Facility",
        "Testing": "Full 4-tier laboratory purity certification with CoA",
        "Net Weight": "60 lbs (27.2 kg)",
        "Pallet Capacity": "36 pails per pallet"
      }
    },
    {
      "id": "tsh-660lb-drum",
      "name": "660 lb Industrial Steel Drum",
      "subtitle": "Industrial Food & Beverage Manufacturing Grade",
      "category": "Industrial",
      "sizes": ["660 lb (approx. 55 gallons)"],
      "packaging": "Food-grade epoxy-lined steel drum with secure locking ring",
      "image": "assets/images/tsh-660-lb-drum.png",
      "description": "Engineered for industrial beverage, barbecue glaze, confectionery, cereal, and snack food processors. Sourced direct from primary origin to undercut all domestic competitors.",
      "features": [
        "Epoxy-phenolic food grade inner lining for freshness",
        "Heavy-gauge steel with tamper-evident bolt ring closure",
        "Full batch Certificate of Analysis (CoA) provided per lot",
        "Massive volume savings for direct factory pipelines"
      ],
      "specifications": {
        "Origin": "Direct Import (India / International)",
        "Certifications": "Kosher, Halal, FDA Compliant, HACCP Verified",
        "Purity": "Zero additives, 100% natural pure honey",
        "Net Weight": "660 lbs (300 kg)",
        "Pallet Capacity": "4 drums per pallet"
      }
    },
    {
      "id": "tsh-3000lb-tote",
      "name": "3,000 lb Industrial IBC Tote",
      "subtitle": "Maximum Efficiency Liquid Gold Pallet Tank",
      "category": "Industrial",
      "sizes": ["3,000 lb (approx. 250+ gallons)"],
      "packaging": "Food grade composite IBC tote with steel cage & integrated pallet",
      "image": "assets/images/tsh-3000-lb-tote.png",
      "description": "The pinnacle of high-volume efficiency. Built-in bottom discharge valve connects directly to automated food processing pump lines for continuous manufacturing.",
      "features": [
        "Maximum savings per pound across the entire commercial honey market",
        "Galvanized steel tubular grid frame on integrated pallet base",
        "Bottom quick-connect camlock valve for automated liquid pumping",
        "Dedicated full ocean container logistics or direct LTL freight"
      ],
      "specifications": {
        "Origin": "Direct International Floral Supply",
        "Certifications": "Full FDA Compliance, HACCP Certified, Kosher & Halal",
        "Testing": "NMR Fingerprint, C3/C4 Sugar test, Microscopic Pollen",
        "Net Weight": "3,000 lbs (1,360 kg)",
        "Drain Valve": "2-inch or 3-inch butterfly valve"
      }
    }
  ];

  let productsData = defaultProducts;

  function fetchProducts() {
    fetch('assets/data/products.json')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          productsData = data;
        }
      })
      .catch(err => {
        console.info("Using embedded default product definitions.", err);
      })
      .finally(() => {
        setupModalListeners();
        setupFilterListeners();
      });
  }

  function setupFilterListeners() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.tsh-product-card');

    filterBtns.forEach(btn => {
      btn.addEventListener('click', function () {
        filterBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        const filter = this.getAttribute('data-filter');

        cards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
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
    const imgEl = document.getElementById('modalImg');
    const featsList = document.getElementById('modalFeatures');
    const specsTable = document.getElementById('modalSpecs');
    const sampleBtn = document.getElementById('modalSampleCta');

    if (titleEl) titleEl.textContent = product.name;
    if (subEl) subEl.textContent = product.subtitle;
    if (descEl) descEl.textContent = product.description;
    
    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
    }

    if (featsList && product.features) {
      featsList.innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
    }

    if (specsTable && product.specifications) {
      specsTable.innerHTML = Object.entries(product.specifications)
        .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
        .join('');
    }

    if (sampleBtn) {
      sampleBtn.onclick = function(e) {
        e.preventDefault();
        closeModal();
        const contactSection = document.getElementById('contact');
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        const subjectField = document.getElementById('inquiryProduct');
        if (subjectField) {
          for (let i = 0; i < subjectField.options.length; i++) {
            if (subjectField.options[i].text.toLowerCase().includes(product.name.toLowerCase().substring(0, 5))) {
              subjectField.selectedIndex = i;
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

  document.addEventListener('DOMContentLoaded', fetchProducts);
})();
