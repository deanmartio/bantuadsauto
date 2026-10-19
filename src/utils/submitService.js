import { SUBMIT_URL } from '../config';

export const isSubmitEnabled = () => Boolean(SUBMIT_URL);

// Sends the ZIP to the KawanBantu intake endpoint. No Content-Type header on purpose:
// a plain-text body keeps this a "simple" request, so the browser skips the CORS
// preflight that Apps Script cannot answer.
export async function submitToKawanBantu({ ngoName, submissionDate, adCount, mode, postLinks, zipName, zipBase64 }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 120000);
  let res;
  try {
    res = await fetch(SUBMIT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'submit', ngoName, submissionDate, adCount, mode, postLinks, zipName, zipBase64 }),
      signal: controller.signal,
    });
  } catch (err) {
    throw new Error(err.name === 'AbortError'
      ? 'Pengiriman terlalu lama. Cek koneksi internet lalu coba lagi.'
      : 'Tidak bisa terhubung ke server KawanBantu. Cek koneksi internet lalu coba lagi.');
  } finally {
    clearTimeout(timer);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    throw new Error('Respons server tidak bisa dibaca. Coba lagi, atau download ZIP dan kirim via WhatsApp.');
  }
  if (!data.ok) throw new Error(data.error || 'Gagal mengirim. Coba lagi, atau download ZIP dan kirim via WhatsApp.');
  return data;
}
