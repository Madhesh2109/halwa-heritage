// firebase/firestore.js
import { db } from "./firebase-config.js";
import 
{
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// 🧠 Fetch all products from Firestore
export async function getProducts() 
{
  const productsCol = collection(db, "products");
  const snapshot = await getDocs(productsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// ➕ Add a new product
export async function addProduct(productData) 
{
  await addDoc(collection(db, "products"), productData);
}

// ✏️ Update an existing product
export async function updateProduct(id, updatedData) 
{
  const docRef = doc(db, "products", id);
  await updateDoc(docRef, updatedData);
}

// ❌ Delete a product
export async function deleteProduct(id) 
{
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
}
