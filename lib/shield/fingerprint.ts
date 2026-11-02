import FingerprintJS from "@fingerprintjs/fingerprintjs";
export async function getFingerprint(){ const fp = await FingerprintJS.load(); const r = await fp.get(); return r.visitorId; }
