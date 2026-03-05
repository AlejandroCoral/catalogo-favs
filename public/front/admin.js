const API = "http://127.0.0.1:8000/api";
const token = localStorage.getItem("token");

// Si no hay token, afuera
if (!token) window.location.href = "login.html";

async function loadUsers() {
  const res = await fetch(API + "/users", {
    headers: { Authorization: "Bearer " + token, Accept: "application/json" }
  });

  const data = await res.json();

  if (!res.ok) {
    document.getElementById("users").innerText =
      data.message || "No autorizado (solo admin)";
    return;
  }

  const container = document.getElementById("users");
  container.innerHTML = "";

  data.forEach(u => {
    container.innerHTML += `
      <div style="background:#fff;padding:10px;margin:8px 0;border-radius:8px;">
        <b>${u.name}</b> — ${u.email}
        <span style="margin-left:10px;">Rol: ${u.is_admin ? "ADMIN" : "USER"}</span>
        ${
          u.is_admin
            ? `<button onclick="removeAdmin(${u.id})">Quitar admin</button>`
            : `<button onclick="makeAdmin(${u.id})">Hacer admin</button>`
        }
      </div>
    `;
  });
}

async function makeAdmin(id) {
  const res = await fetch(API + `/users/${id}/make-admin`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token, Accept: "application/json" }
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message || "Error");
  loadUsers();
}

async function removeAdmin(id) {
  const res = await fetch(API + `/users/${id}/remove-admin`, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token, Accept: "application/json" }
  });
  const data = await res.json();
  if (!res.ok) return alert(data.message || "Error");
  loadUsers();
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});

// Crear usuario (desde el panel admin)
const createUserForm = document.getElementById("createUserForm");

if (createUserForm) {
  createUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: document.getElementById("newName").value,
      email: document.getElementById("newEmail").value,
      password: document.getElementById("newPass").value,
      password_confirmation: document.getElementById("newPass2").value
    };

    // ✅ OPCIÓN PRO: si ya creaste el endpoint admin POST /api/users
    const res = await fetch(API + "/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      document.getElementById("createMsg").innerText =
        data.message || "Error creando usuario";
      return;
    }

    document.getElementById("createMsg").innerText = "Usuario creado ✅";
    createUserForm.reset();
    loadUsers();
  });
}

loadUsers();