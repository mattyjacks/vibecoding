/**
 * Tri State Honey - Product Modal & Spec Viewer Controller
 */
(function () {
  'use strict';

  let productsData = [];

  function fetchProducts() {
    fetch('assets/data/products.json')
      .then(res => res.json())
      .then(data => {
        productsData = data;
        setupModalListeners();
      })
      .catch(err => {
        console.warn("Could not load products.json directly, fallback available.", err);
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
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalSubtitle').textContent = product.subtitle;
    document.getElementById('modalDesc').textContent = product.description;
    
    const imgEl = document.getElementById('modalImg');
    if (imgEl) {
      imgEl.src = product.image;
      imgEl.alt = product.name;
    }

    const featsList = document.getElementById('modalFeatures');
    if (featsList) {
      featsList.innerHTML = product.features.map(f => `<li>✔ ${f}</li>`).join('');
    }

    const specsTable = document.getElementById('modalSpecs');
    if (specsTable && product.specifications) {
      specsTable.innerHTML = Object.entries(product.specifications)
        .map(([k, v]) => `<tr><td style="padding:6px 0; font-weight:700; color:#475569;">${k}</td><td style="padding:6px 0; color:#0f172a;">${v}</td></tr>`)
        .join('');
    }

    const sampleBtn = document.getElementById('modalSampleCta');
    if (sampleBtn) {
      sampleBtn.setAttribute('href', `#contact?product=${encodeURIComponent(product.name)}`);
      sampleBtn.onclick = function() {
        closeModal();
        const subjectField = document.getElementById('inquiryProduct');
        if (subjectField) subjectField.value = product.name;
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
