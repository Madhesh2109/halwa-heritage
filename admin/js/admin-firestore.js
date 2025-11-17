/* admin-firestore.js */
import { db } from "../../firebase/firebase-config.js";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/* OFFERS */
export async function listOffers() {
  const snap = await getDocs(collection(db, "offers"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createOffer(data) {
  return await addDoc(collection(db, "offers"), data);
}

export async function updateOffer(id, data) {
  return await updateDoc(doc(db, "offers", id), data);
}

export async function deleteOffer(id) {
  return await deleteDoc(doc(db, "offers", id));
}

/* POPULAR */
export async function listPopular() {
  const snap = await getDocs(collection(db, "popular_week"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createPopular(data) {
  return await addDoc(collection(db, "popular_week"), data);
}

export async function updatePopular(id, data) {
  return await updateDoc(doc(db, "popular_week", id), data);
}

export async function deletePopular(id) {
  return await deleteDoc(doc(db, "popular_week", id));
}

/* PRODUCTS */
export async function getProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function addProduct(data) {
  return await addDoc(collection(db, "products"), data);
}

export async function updateProduct(id, data) {
  return await updateDoc(doc(db, "products", id), data);
}

export async function deleteProduct(id) {
  return await deleteDoc(doc(db, "products", id));
}

/* ORDERS */
export async function getOrders()
{
  try
  {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      createdAt: d.data().createdAt?.toDate() || new Date()
    }));
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
}

export async function updateOrderStatus(id, status) {
  return await updateDoc(doc(db, "orders", id), { 
    status,
    updatedAt: serverTimestamp()
  });
}

export async function deleteOrder(id) 
{
  return await deleteDoc(doc(db, "orders", id));
}

/* FEEDBACKS */
export async function getFeedbacks() {
  const q = query(collection(db, "feedbacks"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ 
    id: d.id, 
    ...d.data(),
    createdAt: d.data().createdAt?.toDate() || new Date()
  }));
}

export async function deleteFeedback(id) {
  return await deleteDoc(doc(db, "feedbacks", id));
}

export async function updateFeedbackStatus(id, status) {
  return await updateDoc(doc(db, "feedbacks", id), { status });
}