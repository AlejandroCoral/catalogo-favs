import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

//const API = "http://127.0.0.1:8000/api";
const API = "https://catalogo-favs-production.up.railway.app/api";

const token = localStorage.getItem("token");

if (!token) window.location.href = "login.html";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBduveofhdf5SU9c53bcjM7u8msitgNbU8",
  storageBucket: "catalogo-favs.firebasestorage.app",
  projectId: "catalogo-favs",
  storageBucket: "catalogo-favs.appspot.com",
  messagingSenderId: "1018674986767",
  appId: "1:1018674986767:web:39fa2feee97d9af6b4487a"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// asegurar admin
async function ensureAdmin() {
  const res = await fetch(API + "/profile", {
    headers: {
      Authorization: "Bearer " + token,
      Accept: "application/json"
    }
  });

  if (!res.ok) return window.location.href = "login.html";

  const user = await res.json();
  if (!user.is_admin) window.location.href = "index.html";
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadProducts() {
  const res = await fetch(API + "/products", {
    headers: { Accept: "application/json" }
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("products").innerText =
      data.message || "Error cargando productos";
    return;
  }

  const container = document.getElementById("products");
  container.innerHTML = "";

  data.forEach((p) => {
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

        <label class="muted">image_url (pega URL Firebase o pública)</label>
        <input name="image_url" value="${escapeHtml(p.image_url)}" placeholder="https://firebasestorage..." />

        ${p.image_url ? `<img src="${p.image_url}" alt="img">` : `<p class="muted">Sin imagen</p>`}

        <label class="muted">Subir imagen (archivo)</label>
        <input type="file" name="image_file" accept="image/*" />

        <div class="actions">
          <button type="button" onclick="updateProduct(${p.id}, this)">Guardar cambios</button>
          <button type="button" onclick="uploadImage(${p.id}, this)">Subir imagen</button>
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
    image_url: form.querySelector('[name="image_url"]').value || null
  };

  const res = await fetch(API + `/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + token
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
  const imageUrlInput = form.querySelector('[name="image_url"]');

  if (!fileInput.files.length) {
    msg.className = "msg bad";
    msg.innerText = "Selecciona un archivo primero";
    return;
  }

  const file = fileInput.files[0];

  if (!file.type.startsWith("image/")) {
    msg.className = "msg bad";
    msg.innerText = "Solo se permiten imágenes";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    msg.className = "msg bad";
    msg.innerText = "La imagen no debe superar 2 MB";
    return;
  }

  try {
    msg.className = "msg muted";
    msg.innerText = "Subiendo imagen a Firebase...";

    const ext = file.name.split(".").pop();
    const fileName = `products/${id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    imageUrlInput.value = downloadURL;

    const res = await fetch(API + `/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        name: form.querySelector('[name="name"]').value,
        description: form.querySelector('[name="description"]').value,
        price: form.querySelector('[name="price"]').value,
        image_url: downloadURL
      })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.className = "msg bad";
      msg.innerText = data.message || "Error guardando URL en producto";
      return;
    }

    msg.className = "msg ok";
    msg.innerText = "Imagen subida a Firebase y guardada ✅";
    loadProducts();

  } catch (error) {
    console.error("Firebase error completo:", error);
    msg.className = "msg bad";
    msg.innerText = "Error subiendo imagen a Firebase: " + (error.message || "desconocido");
  }
}

async function deleteProduct(id) {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

  const res = await fetch(API + `/products/${id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: "Bearer " + token
    }
  });

  let data = {};
  try {
    data = await res.json();
  } catch (e) {}

  if (!res.ok) {
    alert(data.message || "Error eliminando");
    return;
  }

  loadProducts();
}

// Crear producto
document.getElementById("createProductForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById("c_name").value,
    description: document.getElementById("c_description").value,
    price: document.getElementById("c_price").value,
    image_url: document.getElementById("c_image_url").value || null
  };

  const res = await fetch(API + "/products", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: "Bearer " + token
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  const msg = document.getElementById("createMsg");

  if (!res.ok) {
    msg.className = "bad";
    msg.innerText = data.message || "Error creando";
    return;
  }

  msg.className = "ok";
  msg.innerText = "Producto creado ✅";
  e.target.reset();
  loadProducts();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

window.updateProduct = updateProduct;
window.uploadImage = uploadImage;
window.deleteProduct = deleteProduct;

(async () => {
  await ensureAdmin();
  await loadProducts();
})();