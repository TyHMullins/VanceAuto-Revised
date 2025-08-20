
(async function(){
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

  const state = {
    data: [],
    filtered: [],
    search: '',
    make: 'All',
    body: 'All',
    sort: 'newest'
  };

  const formatPrice = (n) => {
    if (n === null || n === undefined || isNaN(n)) return '—';
    return '$' + n.toLocaleString();
  };

  const formatMiles = (n) => {
    if (!n && n !== 0) return '—';
    return n.toLocaleString() + ' mi';
  };

  async function load() {
    try {
      const res = await fetch('data/inventory.json?ts=' + Date.now());
      state.data = await res.json();
      // Ensure a createdAt field exists for sorting by newest
      state.data.forEach(v => v.createdAt = v.createdAt || new Date().toISOString());
      buildFilters();
      apply();
    } catch (e) {
      console.error(e);
      $('#results').innerHTML = '<div class="col-12"><div class="alert alert-danger">Could not load inventory. Make sure <code>data/inventory.json</code> exists.</div></div>';
    }
  }

  function buildFilters() {
    const makes = ['All', ...Array.from(new Set(state.data.map(v => v.make).filter(Boolean))).sort()];
    const bodies = ['All', ...Array.from(new Set(state.data.map(v => v.body).filter(Boolean))).sort()];

    const makeSel = $('#filter-make');
    const bodySel = $('#filter-body');

    makeSel.innerHTML = makes.map(m => `<option>${m}</option>`).join('');
    bodySel.innerHTML = bodies.map(b => `<option>${b}</option>`).join('');

    makeSel.value = state.make;
    bodySel.value = state.body;

    makeSel.addEventListener('change', () => { state.make = makeSel.value; apply(); });
    bodySel.addEventListener('change', () => { state.body = bodySel.value; apply(); });
    $('#sort').addEventListener('change', (e)=>{ state.sort = e.target.value; apply(); });
    $('#search').addEventListener('input', (e)=>{ state.search = e.target.value.toLowerCase(); apply(); });
  }

  function apply() {
    state.filtered = state.data.filter(v => {
      const matchMake = state.make === 'All' || v.make === state.make;
      const matchBody = state.body === 'All' || v.body === state.body;
      const hay = (v.year + ' ' + v.make + ' ' + v.model + ' ' + (v.trim||'') + ' ' + (v.features||[]).join(' ') + ' ' + (v.description||'')).toLowerCase();
      const matchSearch = !state.search || hay.includes(state.search);
      return matchMake && matchBody && matchSearch;
    });

    const sorters = {
      'newest': (a,b) => new Date(b.createdAt) - new Date(a.createdAt),
      'price-asc': (a,b) => (a.price||0) - (b.price||0),
      'price-desc': (a,b) => (b.price||0) - (a.price||0),
      'miles-asc': (a,b) => (a.mileage||0) - (b.mileage||0),
      'year-desc': (a,b) => (b.year||0) - (a.year||0),
      'year-asc': (a,b) => (a.year||0) - (b.year||0),
    };
    state.filtered.sort(sorters[state.sort] || sorters['newest']);
    render();
  }

  function render() {
    const wrap = $('#results');
    if (!state.filtered.length) {
      wrap.innerHTML = '<div class="col-12"><div class="alert alert-info">No vehicles match your filters.</div></div>';
      return;
    }
    wrap.innerHTML = state.filtered.map(v => {
      const img = (v.images && v.images[0]) ? v.images[0] : 'assets/img/placeholder.svg';
      const price = formatPrice(Number(v.price));
      const miles = formatMiles(Number(v.mileage));
      const title = `${v.year||''} ${v.make||''} ${v.model||''} ${v.trim||''}`.replace(/\s+/g,' ').trim();
      const badges = [v.body, v.transmission, v.drivetrain].filter(Boolean).map(x => `<span class="badge text-bg-light badge-pill me-1">${x}</span>`).join('');
      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm rounded-4 card-vehicle">
            <div class="ratio ratio-4x3 rounded-top-4 overflow-hidden bg-light">
              <img src="${img}" alt="${title}" class="w-100 h-100 object-fit-cover">
            </div>
            <div class="card-body d-flex flex-column">
              <h3 class="h5 mb-1">${title||'Vehicle'}</h3>
              <div class="text-muted small mb-2">${miles} • ${badges}</div>
              <div class="mt-auto d-flex justify-content-between align-items-center">
                <div class="fs-5 fw-bold">${price}</div>
                <button class="btn btn-primary btn-sm" data-id="${v.id}">Details</button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Wire buttons
    $$('#results button[data-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = state.filtered.find(x => String(x.id) === String(btn.dataset.id));
        if (v) openModal(v);
      });
    });
  }

  function openModal(v) {
    $('#vehicleTitle').textContent = `${v.year||''} ${v.make||''} ${v.model||''} ${v.trim||''}`.replace(/\s+/g,' ').trim();
    $('#vehicleDesc').textContent = v.description || '';
    $('#callButton').href = 'tel:+16158496144';

    // Facts
    const facts = [
      ['Price', formatPrice(Number(v.price))],
      ['Mileage', formatMiles(Number(v.mileage))],
      ['Body', v.body],
      ['Transmission', v.transmission],
      ['Drivetrain', v.drivetrain],
      ['Exterior', v.exterior],
      ['Interior', v.interior],
      ['VIN', v.vin],
      ['Stock #', v.stock],
    ].filter(row => row[1]);
    $('#vehicleFacts').innerHTML = '<dl class="row mb-0">' + facts.map(([k, val]) => `
      <dt class="col-sm-4">${k}</dt><dd class="col-sm-8">${val}</dd>
    `).join('') + '</dl>';

    // Images
    const box = $('#vehicleImages');
    const imgs = (v.images && v.images.length) ? v.images : ['assets/img/placeholder.svg'];
    box.innerHTML = `<img src="${imgs[0]}" class="w-100 h-100 object-fit-cover" alt="${$('#vehicleTitle').textContent}">`;

    const modal = new bootstrap.Modal($('#vehicleModal'));
    modal.show();
  }

  load();
})();
