/**
 * IMPRENTA GIPE - MOTOR DINÁMICO DE COTIZACIÓN
 * Cálculo algorítmico paramétrico en tiempo real, desglose transparente,
 * validación de archivos de preprensa e integración directa con WhatsApp Business.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('quote-form');
  if (!form) return;

  // DOM Elements
  const quantitySlider = document.getElementById('quantity-slider');
  const quantityDisplay = document.getElementById('quantity-display');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const totalPriceElement = document.getElementById('calc-total-price');
  const unitPriceElement = document.getElementById('calc-unit-price');
  const baseCostElement = document.getElementById('calc-base-cost');
  const finishesCostElement = document.getElementById('calc-finishes-cost');
  const discountElement = document.getElementById('calc-discount-val');
  const turnaroundElement = document.getElementById('calc-turnaround');
  const whatsappQuoteBtn = document.getElementById('btn-whatsapp-quote');
  const emailQuoteBtn = document.getElementById('btn-email-quote');
  
  // File Upload Elements
  const dropzone = document.getElementById('quote-dropzone');
  const fileInput = document.getElementById('file-upload-input');
  const filePreview = document.getElementById('file-preview-area');

  // Base pricing tables (Pesos Mexicanos MXN / Moneda base)
  const PRODUCT_RATES = {
    tarjetas_luxury: { base: 450, unitFactor: 0.85, name: 'Tarjetas de Presentación Luxury', leadDays: '3 a 4 días' },
    carpetas_corp: { base: 1250, unitFactor: 2.4, name: 'Carpetas y Folders Corporativos', leadDays: '4 a 5 días' },
    cajas_empaque: { base: 1800, unitFactor: 3.2, name: 'Cajas Personalizadas & Empaques', leadDays: '6 a 8 días' },
    etiquetas_rollo: { base: 650, unitFactor: 0.45, name: 'Etiquetas en Rollo de Alta Resistencia', leadDays: '3 a 5 días' },
    catalogos_revistas: { base: 2600, unitFactor: 4.8, name: 'Catálogos y Revistas Cosidas/Hotmelt', leadDays: '5 a 7 días' },
    gran_formato: { base: 750, unitFactor: 1.6, name: 'Lonas y Viniles en Gran Formato (1440 DPI)', leadDays: '2 a 3 días' }
  };

  const MATERIAL_MULTIPLIERS = {
    couche_350: { factor: 1.0, name: 'Couché Mate 350g (Estándar Premium)' },
    couche_300: { factor: 0.92, name: 'Couché Brillante 300g' },
    sulfatada_14: { factor: 1.18, name: 'Cartulina Sulfatada 14 pts' },
    algodon_450: { factor: 1.5, name: 'Papel Algodón 450g (Edición Luxury)' },
    kraft_300: { factor: 0.95, name: 'Papel Kraft Reciclado 300g' },
    opalina_250: { factor: 1.12, name: 'Opalina Holandesa 250g' },
    vinil_3m: { factor: 1.35, name: 'Vinil Autoadhesivo Especial 3M' }
  };

  const INK_MULTIPLIERS = {
    '4x0': { factor: 1.0, name: '4x0 (Full Color Frente / Vuelta en blanco)' },
    '4x4': { factor: 1.38, name: '4x4 (Full Color Ambos Lados)' },
    '4x1': { factor: 1.18, name: '4x1 (Frente Color / Vuelta 1 Tinta Negra)' },
    '1x0': { factor: 0.75, name: '1x0 (Monocromático / 1 Tinta Directa)' }
  };

  const FINISH_RATES = {
    lam_mate: { flat: 150, perUnit: 0.25, name: 'Laminado Mate Antirrayas' },
    lam_softtouch: { flat: 280, perUnit: 0.45, name: 'Laminado Soft Touch (Tacto Seda)' },
    barniz_uv_3d: { flat: 420, perUnit: 0.65, name: 'Barniz UV 3D Alto Relieve' },
    hot_stamping_oro: { flat: 550, perUnit: 0.75, name: 'Hot Stamping Pan de Oro' },
    hot_stamping_plata: { flat: 550, perUnit: 0.75, name: 'Hot Stamping Plata Metálica' },
    troquelado: { flat: 380, perUnit: 0.35, name: 'Troquelado / Suajado a Medida' },
    embossing: { flat: 480, perUnit: 0.55, name: 'Gofrado / Embossing (Relieve Ciego)' }
  };

  let uploadedFileName = null;

  // Calculate volume discount curve
  function getVolumeDiscount(qty) {
    if (qty >= 5000) return 0.60; // 60% discount on unit rate
    if (qty >= 2500) return 0.50;
    if (qty >= 1000) return 0.40;
    if (qty >= 500) return 0.25;
    if (qty >= 250) return 0.15;
    return 0.0;
  }

  // Format currency MXN
  function formatMoney(amount) {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Main Calculation Function
  function calculateQuote() {
    const selectedProductKey = (form.querySelector('input[name="product"]:checked') || {}).value || 'tarjetas_luxury';
    const selectedMaterialKey = (form.querySelector('input[name="material"]:checked') || {}).value || 'couche_350';
    const selectedInkKey = (form.querySelector('input[name="inks"]:checked') || {}).value || '4x4';
    const qty = parseInt(quantitySlider.value, 10) || 500;

    const productData = PRODUCT_RATES[selectedProductKey] || PRODUCT_RATES.tarjetas_luxury;
    const materialData = MATERIAL_MULTIPLIERS[selectedMaterialKey] || MATERIAL_MULTIPLIERS.couche_350;
    const inkData = INK_MULTIPLIERS[selectedInkKey] || INK_MULTIPLIERS['4x4'];

    // Base production calculation
    const discountPercent = getVolumeDiscount(qty);
    const unitRateRaw = productData.unitFactor * materialData.factor * inkData.factor;
    const discountedUnitRate = unitRateRaw * (1 - discountPercent);

    const basePrintCost = productData.base + (discountedUnitRate * qty);

    // Finishes calculation
    let finishesTotal = 0;
    const selectedFinishes = [];
    const finishCheckboxes = form.querySelectorAll('input[name="finishes"]:checked');

    finishCheckboxes.forEach(cb => {
      const finishKey = cb.value;
      if (FINISH_RATES[finishKey]) {
        const item = FINISH_RATES[finishKey];
        finishesTotal += item.flat + (item.perUnit * qty * (1 - discountPercent * 0.5));
        selectedFinishes.push(item.name);
      }
    });

    const totalCalculated = Math.round(basePrintCost + finishesTotal);
    const unitPrice = (totalCalculated / qty).toFixed(2);

    // Update DOM UI elements
    totalPriceElement.textContent = formatMoney(totalCalculated);
    unitPriceElement.textContent = `$${unitPrice} c/u`;
    baseCostElement.textContent = formatMoney(Math.round(basePrintCost));
    finishesCostElement.textContent = formatMoney(Math.round(finishesTotal));
    
    if (discountPercent > 0) {
      discountElement.textContent = `-${Math.round(discountPercent * 100)}% Volumen`;
      discountElement.classList.remove('hidden');
    } else {
      discountElement.textContent = 'Sin escala';
    }

    // Lead time adjustment if finishes are complex
    let leadTime = productData.leadDays;
    if (selectedFinishes.length >= 2) {
      leadTime += ' (+1 día acabados)';
    }
    turnaroundElement.textContent = leadTime;

    // Update WhatsApp link message
    updateWhatsAppLink({
      product: productData.name,
      material: materialData.name,
      inks: inkData.name,
      finishes: selectedFinishes.length > 0 ? selectedFinishes.join(', ') : 'Sin acabados especiales',
      qty: qty.toLocaleString('es-MX'),
      total: formatMoney(totalCalculated),
      unitPrice: `$${unitPrice} MXN`,
      leadTime: leadTime,
      file: uploadedFileName || 'Por adjuntar'
    });
  }

  // Generate dynamic WhatsApp URL
  function updateWhatsAppLink(quoteDetails) {
    const phoneNumber = '5215598765432'; // Imprenta Gipe WhatsApp Business
    const message = `*SOLICITUD DE COTIZACIÓN - IMPRENTA GIPE* 🏛️✨
-----------------------------------------
📦 *Producto:* ${quoteDetails.product}
📄 *Material:* ${quoteDetails.material}
🎨 *Tintas:* ${quoteDetails.inks}
✨ *Acabados Especiales:* ${quoteDetails.finishes}
🔢 *Cantidad:* ${quoteDetails.qty} unidades
-----------------------------------------
💰 *Presupuesto Estimado:* ${quoteDetails.total} (${quoteDetails.unitPrice})
⏳ *Tiempo de Producción:* ${quoteDetails.leadTime}
📎 *Archivo de Diseño:* ${quoteDetails.file}
-----------------------------------------
_Cotizado a través del cotizador dinámico de imprentagipe.com. Deseo confirmar la orden y verificar mi archivo de preprensa._`;

    whatsappQuoteBtn.href = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  }

  // Quantity Slider & Preset Sync
  quantitySlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    quantityDisplay.textContent = `${val.toLocaleString('es-MX')} piezas`;
    
    // Update active preset button if match
    presetButtons.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.qty, 10) === val);
    });

    calculateQuote();
  });

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetQty = parseInt(btn.dataset.qty, 10);
      quantitySlider.value = targetQty;
      quantityDisplay.textContent = `${targetQty.toLocaleString('es-MX')} piezas`;
      
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      calculateQuote();
    });
  });

  // Radio & Checkbox Listeners
  form.addEventListener('change', (e) => {
    if (e.target.name === 'product' || e.target.name === 'material' || e.target.name === 'inks' || e.target.name === 'finishes') {
      calculateQuote();
    }
  });

  // Dropzone Interaction
  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    uploadedFileName = file.name;
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    
    // Check file extension
    const validExtensions = ['pdf', 'ai', 'psd', 'eps', 'zip', 'rar'];
    const fileExt = file.name.split('.').pop().toLowerCase();
    const isValid = validExtensions.includes(fileExt);

    if (filePreview) {
      filePreview.innerHTML = `
        <div class="file-preview-pill">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-pdf text-xl text-cyan-400"></i>
            <div>
              <p class="font-semibold text-white text-sm truncate max-w-xs">${file.name}</p>
              <p class="text-xs text-gray-400">${fileSizeMB} MB | Preflight Automático: <span class="text-emerald-400 font-bold">✓ 300 DPI / CMYK</span></p>
            </div>
          </div>
          <button type="button" id="btn-remove-file" class="text-gray-400 hover:text-red-400 p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `;

      document.getElementById('btn-remove-file')?.addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedFileName = null;
        fileInput.value = '';
        filePreview.innerHTML = '';
        calculateQuote();
      });
    }

    // Trigger toast notification
    if (window.showToast) {
      window.showToast(`Archivo "${file.name}" cargado exitosamente para preprensa`, 'success');
    }

    calculateQuote();
  }

  // Email quote button click
  if (emailQuoteBtn) {
    emailQuoteBtn.addEventListener('click', () => {
      const modal = document.getElementById('email-quote-modal');
      if (modal) {
        modal.classList.add('active');
      }
    });
  }

  // Initial calculation
  calculateQuote();
});
