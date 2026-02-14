import { MessageBuilder } from "seishiro";

// Set Your Variable Message
const message = new MessageBuilder("en");
// Default Variable Message
message.set("no-response-sending", "Server not response!");
message.set("no-registry", "Registry not found!");
message.set("internal-server-error", "Internal server error!");
// Costum Variable Message
message.set("database-not-connected", "Database not connected!");
message.set("you-need-login", "Kamu perlu login!");
message.set("your-credentials-has-expired", "Sesi login kamu sudah berakhir!");
message.set("chat-is-not-found", "Riwayat chat tidak ditemukan!");
message.set("location-is-not-found", "Lokasi tidak ditemukan!");
message.set("location-is-not-in-list", "Lokasi tidak ada dalam daftar kunjungan!");
message.set("location-is-already-in-list", "Lokasi sudah ada dalam daftar kunjungan!");
message.set("location-is-already-rated", "Lokasi sudah diberi rating!");
message.set("field-is-objectid", "Input {{field}} harus berupa format teks dengan 24 karakter (MongoDB ObjectId)!");
message.set("field-is-required", "Input {{field}} wajib diisi!");
message.set("field-is-string", "Format pada input {{field}} wajib berisi teks!");
message.set("field-is-number", "Format pada input {{field}} wajib berisi angka!");
message.set("field-is-boolean", "Format pada input {{field}} wajib berisi boolean!");
message.set("field-is-array", "Format pada input {{field}} wajib berisi array!");
message.set("field-is-object", "Format pada input {{field}} wajib berisi object!");
message.set("field-is-min", "Format pada input {{field}} wajib berisi minimal {{min}}!");
message.set("field-is-max", "Format pada input {{field}} wajib berisi maksimal {{max}}!");
message.set("field-is-min-length", "Format pada input {{field}} wajib berisi minimal panjang {{min_length}}!");
message.set("field-is-max-length", "Format pada input {{field}} wajib berisi maksimal panjang {{max_length}}!");
message.set("field-is-min-size", "Format pada input {{field}} wajib berisi minimal ukuran {{min_size}}!");
message.set("field-is-max-size", "Format pada input {{field}} wajib berisi maksimal ukuran {{max_size}}!");

export default message;
