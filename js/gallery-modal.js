/**
 * IMPRENTA GIPE - PORTFOLIO GALLERY & MODAL VIEWER
 * Filtrado dinámico de proyectos, visor lightbox con especificaciones técnicas
 * de acabados especiales y vinculación directa con el cotizador.
 */

document.addEventListener('DOMContentLoaded', () => {
  const filterButtons = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('project-detail-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Modal content elements
  const modalImg = document.getElementById('modal-project-img');
  const modalTitle = document.getElementById('modal-project-title');
  const modalCategory = document.getElementById('modal-project-category');
  const modalDesc = document.getElementById('modal-project-desc');
  const modalFinishes = document.getElementById('modal-project-finishes');
  const modalSpecs = document.getElementById('modal-project-specs');
  const modalQuoteCta = document.getElementById('modal-quote-cta');

  // Filter gallery items
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      galleryItems.forEach(item => {
        const itemCategory = item.dataset.category;
        if (filterValue === 'all' || itemCategory === filterValue) {
          item.style.display = 'block';
          item.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // Open modal with item details
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const data = {
        title: item.dataset.title || 'Proyecto Gráfico Premium',
        category: item.dataset.categoryName || 'Impresión Comercial',
        img: item.querySelector('img')?.src || '',
        desc: item.dataset.desc || 'Proyecto elaborado con los más altos estándares de calidad gráfica y acabados de lujo.',
        finishes: item.dataset.finishes ? item.dataset.finishes.split('|') : ['Barniz UV', 'Laminado Mate'],
        substrate: item.dataset.substrate || 'Couché 350g',
        leadTime: item.dataset.leadtime || '4 días hábiles',
        targetProduct: item.dataset.productKey || 'tarjetas_luxury'
      };

      if (modal && modalTitle) {
        modalTitle.textContent = data.title;
        modalCategory.textContent = data.category;
        modalImg.src = data.img;
        modalDesc.textContent = data.desc;

        // Render finishes pills
        modalFinishes.innerHTML = data.finishes.map(f => `
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-400/15 border border-amber-400/30 text-amber-300">
            <i class="fa-solid fa-sparkles text-[10px]"></i> ${f}
          </span>
        `).join('');

        modalSpecs.innerHTML = `
          <div class="grid grid-cols-2 gap-4 mt-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
            <div><span class="text-gray-400 block">Sustrato:</span> <strong class="text-white">${data.substrate}</strong></div>
            <div><span class="text-gray-400 block">Tiempo de Entrega:</span> <strong class="text-white">${data.leadTime}</strong></div>
          </div>
        `;

        if (modalQuoteCta) {
          modalQuoteCta.onclick = () => {
            closeModal();
            // Scroll to calculator
            const calcSection = document.getElementById('cotizador');
            if (calcSection) {
              calcSection.scrollIntoView({ behavior: 'smooth' });
              // Select product radio
              const targetRadio = document.querySelector(`input[name="product"][value="${data.targetProduct}"]`);
              if (targetRadio) {
                targetRadio.checked = true;
                targetRadio.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          };
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Close modal function
  function closeModal() {
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  // Close on outer click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });
});
