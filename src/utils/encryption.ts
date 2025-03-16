import CryptoJS from "crypto-js";

const SECRET_KEY = "secret-key";

export function encryptData(data: string): string {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

export function decryptData(ciphertext: string): string {
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
        return "";
    }
}
