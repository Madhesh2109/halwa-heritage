/* products-admin.js */
import * as FS from "./admin-firestore.js";
import { uploadImage } from "./storage-helper.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("productForm");
  const preview = document.getElementById("prod_image_preview");
  const list = document.getElementById("productsList");
  const msg = document.getElementById("prodFormMsg");

  let editingId = null;

  // Preview
  document.getElementById("prod_image_file")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  });

  // Load products
  async function loadProducts() {
    list.innerHTML = "Loading...";
    const products = await FS.getProducts();
    if (!products.length) {
      list.innerHTML = "<p class='muted'>No products yet.</p>";
      return;
    }
    list.innerHTML = products.map(p => `
      <div class="list-item" data-id="${p.id}">
        <div class="meta">
          <img src="${p.image || '../images/default.jpg'}" />
          <div>
            <strong>${p.name}</strong>
            <div class="small muted">₹${p.price} — ${p.category}</div>
          </div>
        </div>

        <div class="actions">
          <button class="btn small edit" data-id="${p.id}">Edit</button>
          <button class="btn ghost small del" data-id="${p.id}">Delete</button>
        </div>
      </div>
    `).join('');

    attachHandlers();
  }

  // Handlers for edit/delete
  function attachHandlers() {
    document.querySelectorAll(".edit").forEach(b => {
      b.addEventListener("click", async () => {
        const id = b.dataset.id;
        const products = await FS.getProducts();
        const p = products.find(x => x.id === id);
        if (!p) return;

        editingId = id;
        document.getElementById("prod_name").value = p.name || "";
        document.getElementById("prod_price").value = p.price || 0;
        document.getElementById("prod_category").value = p.category || "";
        document.getElementById("prod_image").value = p.image || "";

        preview.src = p.image || "";
        preview.style.display = p.image ? "block" : "none";
        document.getElementById("cancelProdEdit").style.display = "inline-block";
      });
    });

    document.querySelectorAll(".del").forEach(b => {
      b.addEventListener("click", async () => {
        if (!confirm("Delete this product?")) return;
        await FS.deleteProduct(b.dataset.id);
        await loadProducts();
      });
    });
  }

  // Save product
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    msg.textContent = "Saving...";

    let imageUrl = document.getElementById("prod_image").value;
    const file = document.getElementById("prod_image_file").files[0];

    try {
      if (file) {
        imageUrl = await uploadImage(file);
        document.getElementById("prod_image").value = imageUrl;
      }

      const payload = {
        name: document.getElementById("prod_name").value.trim(),
        price: Number(document.getElementById("prod_price").value || 0),
        category: document.getElementById("prod_category").value.trim(),
        image: imageUrl
      };

      if (editingId) {
        await FS.updateProduct(editingId, payload);
        editingId = null;
        document.getElementById("cancelProdEdit").style.display = "none";
      } else {
        await FS.addProduct(payload);
      }

      form.reset();
      preview.style.display = "none";
      msg.textContent = "Saved.";

      await loadProducts();
      setTimeout(() => msg.textContent = "", 1500);
    } catch (err) {
      console.error(err);
      msg.textContent = "Error saving.";
    }
  });

  await loadProducts();
});
