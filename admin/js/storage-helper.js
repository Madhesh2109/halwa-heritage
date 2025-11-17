/* storage-helper.js */
import { app } from "../../firebase/firebase-config.js";
import 
{
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

const storage = getStorage(app);

export async function uploadImage(file) 
{
  if (!file) return null;
  const path = `admin_uploads/${Date.now()}_${file.name.replace(/\s+/g,'_')}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
