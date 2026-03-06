const API = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

// asegurar admin
async function ensureAdmin() {
  const res = await fetch(API + "/profile", {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" }
  });

  if (!res.ok) return window.location.href = "login.html";

  const user = await res.json();
  if (!user.is_admin) window.location.href = "index.html";
}

function escapeHtml(str){
  return String(str ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function loadProducts() {
  const res = await fetch(API + "/products", { headers: { Accept: "application/json" } });
  const data = await res.json();

  if (!res.ok) {
    document.getElementById("products").innerText = data.message || "Error cargando productos";
    return;
  }

  const container = document.getElementById("products");
  container.innerHTML = "";

  data.forEach(p => {
    container.innerHTML += `
      <form class="card" data-id="${p.id}">
        <b>ID: ${p.id}</b>

        <div class="row">
          <div>
            <label class="muted">Nombre</label>
            <input name="name" value="${escapeHtml(p.name)}" required />
          </div>
          <div>
            <label class="muted">Precio</label>
            <input name="price" type="number" step="0.01" value="${escapeHtml(p.price)}" required />
          </div>
        </div>

        <label class="muted">Descripción</label>
        <textarea name="description" required>${escapeHtml(p.description)}</textarea>

        <label class="muted">Imagen actual</label>
        ${p.image_url ? `<img src="${escapeHtml(p.image_url)}" alt="img">` : `<p class="muted">Sin imagen</p>`}

        <label class="muted">Cambiar imagen (archivo) — Laravel → Firebase</label>
        <input type="file" name="image_file" accept="image/*" />

        <div class="actions">
          <button type="button" onclick="updateProduct(${p.id}, this)">Guardar cambios</button>
          <button type="button" onclick="uploadImage(${p.id}, this)">Subir nueva imagen</button>
          <button type="button" onclick="deleteProduct(${p.id})">Eliminar</button>
          <span class="msg muted"></span>
        </div>
      </form>
    `;
  });
}

async function updateProduct(id, btn) {
  const form = btn.closest("form");
  const msg = form.querySelector(".msg");

  const payload = {
    name: form.querySelector('[name="name"]').value,
    description: form.querySelector('[name="description"]').value,
    price: form.querySelector('[name="price"]').value,
    image_url: form.querySelector('[name="image_url"]').value
  };

  const res = await fetch(API + `/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    msg.className = "msg bad";
    msg.innerText = data.message || "Error actualizando";
    return;
  }

  msg.className = "msg ok";
  msg.innerText = "Actualizado ✅";
  loadProducts();
}

async function uploadImage(id, btn) {
  const form = btn.closest("form");
  const msg = form.querySelector(".msg");

  const fileInput = form.querySelector('[name="image_file"]');
  if (!fileInput.files.length) {
    msg.className = "msg bad";
    msg.innerText = "Selecciona un archivo primero";
    return;
  }

  const formData = new FormData();
  formData.append("image", fileInput.files[0]);

  const res = await fetch(API + `/products/${id}/image`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    },
    body: formData
  });

  const data = await res.json();
  if (!res.ok) {
    msg.className = "msg bad";
    msg.innerText = data.message || "Error subiendo imagen";
    return;
  }

  msg.className = "msg ok";
  msg.innerText = "Imagen actualizada ✅";
  loadProducts();
}

async function deleteProduct(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  const res = await fetch(API + `/products/${id}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Authorization": "Bearer " + token
    }
  });

  let data = {};
  try { data = await res.json(); } catch(e) {}

  if (!res.ok) {
    alert(data.message || "Error eliminando");
    return;
  }

  loadProducts();
}

// Crear producto
const form = document.getElementById("createProductForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  if (!token) return (window.location.href = "login.html");

  const fd = new FormData();
  fd.append("name", document.getElementById("c_name").value);
  fd.append("description", document.getElementById("c_description").value);
  fd.append("price", document.getElementById("c_price").value);

  // ✅ input file correcto
  const file = document.getElementById("c_image_file").files[0];
  if (file) fd.append("image", file);

  const res = await fetch(API + "/products", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json"
      // ⚠️ NO pongas Content-Type con FormData
    },
    body: fd
  });

  const data = await res.json();
  if (!res.ok) {
    alert(data.message || "Error creando");
    return;
  }

  alert("Producto creado ✅");
  form.reset();
  loadProducts();
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

(async () => {
  await ensureAdmin();
  await loadProducts();
})();