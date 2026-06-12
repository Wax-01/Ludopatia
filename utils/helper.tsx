import { supabase } from "@/utils/supabase";

// Convierte base64 a Uint8Array
export function base64ToUint8Array(base64: string) {
  const binary_string = atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

export async function uploadProfilePhoto(base64: string, userId: string) {
  const filePath = `profile_${userId}_${Date.now()}.jpg`;
  const fileData = base64ToUint8Array(base64);

  const { data, error } = await supabase
    .storage
    .from('PerfilPhotos')
    .upload(filePath, fileData, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  // Obtén la URL pública
  const { data: publicUrlData } = supabase
    .storage
    .from('PerfilPhotos')
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}
// En helper.tsx
export async function uploadBetPhoto(base64: string, userId: string) {
  const filePath = `${userId}/bet_${Date.now()}.jpg`;
  const fileData = base64ToUint8Array(base64); // Usa decode de base64-arraybuffer

  const { data, error } = await supabase
    .storage
    .from('Betphotos') // ← Asegúrate que este sea el nombre correcto
    .upload(filePath, fileData, {
      contentType: 'image/jpeg',
    });

  if (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }

  // IMPORTANTE: Usa getPublicUrl, NO getSignedUrl
  const { data: publicUrlData } = supabase
    .storage
    .from('Betphotos')
    .getPublicUrl(filePath);

  console.log('Public URL generated:', publicUrlData.publicUrl);
  
  return publicUrlData.publicUrl;
}