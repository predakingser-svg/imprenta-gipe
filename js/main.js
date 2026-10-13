/**
 * IMPRENTA GIPE - ARCHIVO PRINCIPAL DE INTERACCIÓN & UX/UI
 * Manejo de navegación, menú móvil, tabs de servicios, 3D Tilt Card,
 * sistema de notificaciones toast y formularios de contacto.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification System
  window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    
    let icon = 'fa-circle-info text-cyan-400';
    if (type === 'success') icon = 'fa-circle-check text-emerald-400';
    if (type === 'warning') icon = 'fa-triangle-exclamation text-amber-400';

    toast.innerHTML = `
      <i class="fa-solid ${icon} text-lg"></i>
      <span class="text-sm font-medium text-white">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('hidden');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        icon.className = isOpen ? 'fa-solid fa-bars text-xl' : 'fa-solid fa-xmark text-xl';
      }
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars text-xl';
      });
    });
  }

  // 3. Navbar Sticky Glassmorphism
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('bg-black/85', 'shadow-2xl', 'border-b', 'border-white/10');
      header?.classList.remove('bg-transparent');
    } else {
      header?.classList.remove('bg-black/85', 'shadow-2xl', 'border-b', 'border-white/10');
      header?.classList.add('bg-transparent');
    }
  });

  // 4. Hero 3D Card Tilt Interaction
  const card3d = document.getElementById('hero-tilt-card');
  const reflectionOverlay = document.getElementById('card-reflection');

  if (card3d) {
    const handleTilt = (e) => {
      const rect = card3d.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      card3d.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (reflectionOverlay) {
        const posX = (x / rect.width) * 100;
        const posY = (y / rect.height) * 100;
        reflectionOverlay.style.background = `radial-gradient(circle at ${posX}% ${posY}%, rgba(255,255,255,0.3) 0%, rgba(252,246,186,0.15) 40%, transparent 70%)`;
      }
    };

    const resetTilt = () => {
      card3d.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (reflectionOverlay) {
        reflectionOverlay.style.background = '';
      }
    };

    card3d.parentElement?.addEventListener('mousemove', handleTilt);
    card3d.parentElement?.addEventListener('mouseleave', resetTilt);
  }

  // 5. Catalog Category Tab Switching
  const catalogTabs = document.querySelectorAll('.catalog-tab-btn');
  const catalogContents = document.querySelectorAll('.catalog-content-panel');

  catalogTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      catalogTabs.forEach(t => t.classList.remove('active'));
      catalogContents.forEach(c => c.classList.add('hidden'));

      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
        targetPanel.style.animation = 'fadeIn 0.4s ease';
      }
    });
  });

  // 6. Pre-press Technical Guide Tabs
  const guideTabs = document.querySelectorAll('.guide-tab-btn');
  const guidePanels = document.querySelectorAll('.guide-panel');

  guideTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      guideTabs.forEach(t => t.classList.remove('active', 'border-cyan-400', 'text-white'));
      guideTabs.forEach(t => t.classList.add('text-gray-400', 'border-transparent'));
      guidePanels.forEach(p => p.classList.add('hidden'));

      tab.classList.add('active', 'border-cyan-400', 'text-white');
      tab.classList.remove('text-gray-400', 'border-transparent');

      const targetPanelId = tab.dataset.guide;
      const panel = document.getElementById(targetPanelId);
      if (panel) {
        panel.classList.remove('hidden');
        panel.style.animation = 'fadeIn 0.35s ease';
      }
    });
  });

  // 7. Base Templates Download Simulator
  const downloadTemplateBtns = document.querySelectorAll('.btn-download-template');
  downloadTemplateBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const templateName = btn.dataset.template || 'Plantilla Gráfica Oficial';
      const fileType = btn.dataset.format || 'PDF/AI';

      window.showToast(`Descargando "${templateName}" (.${fileType.toLowerCase()}) con márgenes de corte y sangría configurados...`, 'success');

      // Trigger dummy download after brief delay
      setTimeout(() => {
        const dummyBlob = new Blob([
          `PLANTILLA TÉCNICA OFICIAL - IMPRENTA GIPE\nProducto: ${templateName}\nFormato: ${fileType}\nSangrado: 3mm exterior perimetral\nSeguridad: 4mm interior\nModo de Color: CMYK Fogra39\nResolución: 300 DPI\nImprenta Gipe - www.imprentagipe.com`
        ], { type: 'text/plain' });
        const dummyUrl = URL.createObjectURL(dummyBlob);
        const a = document.createElement('a');
        a.href = dummyUrl;
        a.download = `ImprentaGipe_Plantilla_${templateName.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dummyUrl);
      }, 700);
    });
  });

  // 8. Contact Form Handling
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name')?.value || 'Cliente';
      const submitBtn = contactForm.querySelector('button[type="submit"]');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando solicitud...';
      }

      setTimeout(() => {
        window.showToast(`¡Gracias ${name}! Tu solicitud de cotización ha sido recibida. Un asesor se comunicará contigo en menos de 15 minutos.`, 'success');
        contactForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane mr-2"></i> Enviar Consulta / Solicitar Visita';
        }
      }, 1200);
    });
  }

  // 9. Email Quote Modal Form Handling
  const emailModalForm = document.getElementById('email-quote-form');
  const emailModal = document.getElementById('email-quote-modal');
  const closeEmailModalBtn = document.getElementById('close-email-modal');

  if (closeEmailModalBtn && emailModal) {
    closeEmailModalBtn.addEventListener('click', () => {
      emailModal.classList.remove('active');
    });
  }

  if (emailModalForm && emailModal) {
    emailModalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('email-recipient-input')?.value;
      emailModal.classList.remove('active');
      window.showToast(`Cotización formal detallada enviada exitosamente a: ${email}`, 'success');
      emailModalForm.reset();
    });
  }
});
