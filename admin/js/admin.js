/* admin.js - shared UI for offers & popular pages */
import * as FS from "./admin-firestore.js";

document.addEventListener("DOMContentLoaded", async () => 
{
  // Manage Offers
  if (document.getElementById("offerForm"))
  {
    const form = document.getElementById("offerForm");
    const offersList = document.getElementById("offersList");
    const cancelBtn = document.getElementById("cancelEdit");
    const formMsg = document.getElementById("formMsg");

    let editingId = null;

    async function loadOffers() 
    {
      offersList.innerHTML = "Loading...";
      const offers = await FS.listOffers();
      if (!offers.length) 
      {
        offersList.innerHTML = "<p class='muted'>No offers yet.</p>";
        return;
      }
      offersList.innerHTML = offers.map(o => `
        <div class="list-item" data-id="${o.id}">
          <div class="meta">
            <div>
              <strong>${o.title || "(no title)"}</strong>
              <div class="small muted">${o.description || ""}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn small edit" data-id="${o.id}">Edit</button>
            <button class="btn ghost small del" data-id="${o.id}">Delete</button>
          </div>
        </div>
      `).join('');
      attachOfferHandlers();
    }

    function attachOfferHandlers() {
      document.querySelectorAll(".edit").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          const offers = await FS.listOffers();
          const o = offers.find(x => x.id === id);
          if (!o) return;
          editingId = id;
          document.getElementById("formTitle").textContent = "Edit Offer";
          document.getElementById("title").value = o.title || "";
          document.getElementById("description").value = o.description || "";
          document.getElementById("buttonText").value = o.buttonText || "";
          document.getElementById("buttonLink").value = o.buttonLink || "";
          document.getElementById("enabled").checked = !!o.enabled;
          cancelBtn.style.display = "inline-block";
        });
      });

      document.querySelectorAll(".del").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          if (!confirm("Delete this offer?")) return;
          await FS.deleteOffer(e.target.dataset.id);
          await loadOffers();
        });
      });
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      formMsg.textContent = "Saving...";
      const payload = {
        title: document.getElementById("title").value.trim(),
        description: document.getElementById("description").value.trim(),
        buttonText: document.getElementById("buttonText").value.trim(),
        buttonLink: document.getElementById("buttonLink").value.trim(),
        enabled: document.getElementById("enabled").checked
      };
      try {
        if (editingId) {
          await FS.updateOffer(editingId, payload);
          editingId = null;
          document.getElementById("formTitle").textContent = "Create Offer";
          cancelBtn.style.display = "none";
        } else {
          await FS.createOffer(payload);
        }
        form.reset();
        formMsg.textContent = "Saved.";
        await loadOffers();
      } catch (err) {
        console.error(err);
        formMsg.textContent = "Error saving offer.";
      } finally {
        setTimeout(()=> formMsg.textContent="", 1800);
      }
    });

    cancelBtn.addEventListener("click", () => {
      editingId = null;
      form.reset();
      document.getElementById("formTitle").textContent = "Create Offer";
      cancelBtn.style.display = "none";
    });

    await loadOffers();
  }

  // Manage Popular
  if (document.getElementById("popularForm")) {
    const form = document.getElementById("popularForm");
    const popularList = document.getElementById("popularList");
    const saveBtn = document.getElementById("savePopular");
    const cancelBtn = document.getElementById("cancelPopEdit");
    const popFormMsg = document.getElementById("popFormMsg");
    let editingId = null;

    // Preview local file selection
    document.getElementById("p_image_file")?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const preview = document.getElementById("p_image_preview");
      preview.src = URL.createObjectURL(file);
      preview.style.display = "block";
    });

    async function loadPopular() {
      popularList.innerHTML = "Loading...";
      const items = await FS.listPopular();
      if (!items.length) {
        popularList.innerHTML = "<p class='muted'>No popular items yet.</p>";
        return;
      }
      popularList.innerHTML = items.map(i => `
        <div class="list-item" data-id="${i.id}">
          <div class="meta">
            <img src="${i.image || '../images/default.jpg'}" alt="${i.name || ''}" />
            <div>
              <strong>${i.name || "(no name)"}</strong>
              <div class="small muted">${i.desc || ""}</div>
            </div>
          </div>
          <div class="actions">
            <button class="btn small edit-pop" data-id="${i.id}">Edit</button>
            <button class="btn ghost small del-pop" data-id="${i.id}">Delete</button>
          </div>
        </div>
      `).join('');
      attachPopHandlers();
    }

    function attachPopHandlers() {
      document.querySelectorAll(".edit-pop").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const id = e.target.dataset.id;
          const items = await FS.listPopular();
          const it = items.find(x => x.id === id);
          if (!it) return;
          editingId = id;
          document.getElementById("popFormTitle").textContent = "Edit Popular Item";
          document.getElementById("p_name").value = it.name || "";
          document.getElementById("p_desc").value = it.desc || "";
          document.getElementById("p_image").value = it.image || "";
          document.getElementById("p_image_preview").src = it.image || "";
          document.getElementById("p_image_preview").style.display = it.image ? "block" : "none";
          cancelBtn.style.display = "inline-block";
        });
      });

      document.querySelectorAll(".del-pop").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          if (!confirm("Delete this item?")) return;
          await FS.deletePopular(e.target.dataset.id);
          await loadPopular();
        });
      });
    }

    // Use storage-helper upload if available
    let storage;
    try { storage = await import("./storage-helper.js"); } catch(e){ storage = null; }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      popFormMsg.textContent = "Saving...";

      let imageURL = document.getElementById("p_image").value;
      const file = document.getElementById("p_image_file").files[0];

      try {
        // Upload if new file selected
        if (file && storage && storage.uploadImage) {
          imageURL = await storage.uploadImage(file);
          document.getElementById("p_image").value = imageURL;
        }

        const payload = {
          name: document.getElementById("p_name").value.trim(),
          desc: document.getElementById("p_desc").value.trim(),
          image: imageURL
        };

        if (editingId) {
          await FS.updatePopular(editingId, payload);
          editingId = null;
          document.getElementById("popFormTitle").textContent = "Add Popular Item";
          cancelBtn.style.display = "none";
        } else {
          await FS.createPopular(payload);
        }
        form.reset();
        document.getElementById("p_image_preview").style.display = "none";
        popFormMsg.textContent = "Saved.";
        await loadPopular();
      } catch (err) {
        console.error(err);
        popFormMsg.textContent = "Error saving.";
      } finally {
        setTimeout(()=> popFormMsg.textContent="", 1600);
      }
    });

    cancelBtn.addEventListener("click", () => {
      editingId = null;
      form.reset();
      document.getElementById("popFormTitle").textContent = "Add Popular Item";
      cancelBtn.style.display = "none";
      document.getElementById("p_image_preview").style.display = "none";
    });

    await loadPopular();
  }

  // Dashboard live preview
  if (document.getElementById("livePreview")) 
  {
    const lp = document.getElementById("livePreview");
    try 
    {
      const offers = await FS.listOffers();
      const popular = await FS.listPopular();
      lp.innerHTML = `
        <div class="small muted">Offers: ${offers.length} · Popular items: ${popular.length}</div>
      `;
    } 
    catch (e) 
    {
      lp.textContent = "Preview unavailable";
    }
  }
});
