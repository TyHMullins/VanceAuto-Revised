
(function(){
  const $ = (sel, el=document) => el.querySelector(sel);
  const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const form = $('#vehicleForm');
  const rows = $('#rows');
  const count = $('#count');
  let inventory = [];

  function uid() { return Math.random().toString(36).slice(2,10); }

  function toNum(v) { const n = Number(v); return isNaN(n) ? null : n; }

  function render() {
    count.textContent = String(inventory.length);
    rows.innerHTML = inventory.map((v, i) => `
      <tr>
        <td>${v.year||''}</td>
        <td>${v.make||''}</td>
        <td>${v.model||''}</td>
        <td>${v.price!=null?('$'+Number(v.price).toLocaleString()):'—'}</td>
        <td>${v.mileage!=null?Number(v.mileage).toLocaleString()+' mi':'—'}</td>
        <td>${v.body||''}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-secondary" data-action="edit" data-idx="${i}">Edit</button>
            <button class="btn btn-outline-danger" data-action="del" data-idx="${i}">Delete</button>
          </div>
        </td>
      </tr>
    `).join('');
    // Wire actions
    $$('#rows [data-action="del"]').forEach(btn => btn.addEventListener('click', ()=>{
      const i = Number(btn.dataset.idx);
      inventory.splice(i,1);
      render();
    }));
    $$('#rows [data-action="edit"]').forEach(btn => btn.addEventListener('click', ()=>{
      const i = Number(btn.dataset.idx);
      const v = inventory[i];
      // fill form
      Object.entries(v).forEach(([k,val])=>{
        const input = form.querySelector(`[name="${k}"]`);
        if (!input) return;
        if (k === 'images') input.value = (val||[]).join(', ');
        else if (k === 'features') input.value = (val||[]).join(', ');
        else input.value = val ?? '';
      });
      // remove so submit adds as new (or could implement save-in-place for brevity)
      inventory.splice(i,1);
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const v = Object.fromEntries(fd.entries());
    v.id = v.id || uid();
    v.year = toNum(v.year);
    v.price = toNum(v.price);
    v.mileage = toNum(v.mileage);
    v.images = (v.images||'').split(',').map(s=>s.trim()).filter(Boolean);
    v.features = (v.features||'').split(',').map(s=>s.trim()).filter(Boolean);
    v.createdAt = new Date().toISOString();
    inventory.push(v);
    form.reset();
    render();
  });

  $('#clearForm').addEventListener('click', ()=> form.reset());

  $('#downloadBtn').addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(inventory, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'inventory.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#resetBtn').addEventListener('click', ()=>{
    if (confirm('Clear all vehicles?')) { inventory = []; render(); }
  });

  $('#importBtn').addEventListener('click', ()=>{
    const file = $('#importFile').files[0];
    if (!file) return alert('Choose a JSON file first.');
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arr = JSON.parse(reader.result);
        if (!Array.isArray(arr)) throw new Error('Expected an array');
        inventory = arr;
        render();
      } catch (e) {
        alert('Could not parse JSON: ' + e.message);
      }
    };
    reader.readAsText(file);
  });

  render();
})();
