# TODO: Pengembangan Game Winter Survival 2D

## Overview
Menambangkan fitur: tampilan icon untuk pohon, hewan, dll.; hewan bergerak; lebih banyak fungsi; tungku untuk melelehkan salju; kumpul herbal untuk buat teh; predator (hewan buas) dengan aman di bushcraft.

## Ukuran Gambar (Pixel)
- pohon.png: 20x20 (untuk wood)
- hewan.png: 20x20 (untuk food)
- herbal.png: 15x15 (untuk herbal)
- serigala.png: 20x20 (untuk predator)
- shelter.png: 30x30 (untuk bushcraft shelter)
- player.png: 20x20 (untuk player, opsional)

## Lokasi Gambar
Gambar-gambar tersebut ditempatkan di folder yang sama dengan index.html dan game.js, yaitu di root folder proyek: c:/Users/User/Documents/app-html/winter-survival-2d

## AI Prompts for Assets (Bahasa Inggris)
Gunakan prompt berikut untuk generate assets menggunakan AI image generator seperti DALL-E, Midjourney, atau Stable Diffusion. Pastikan ukuran sesuai dan gaya pixel art sederhana untuk game 2D.

- **pohon.png (20x20)**: "Simple pixel art icon of an evergreen tree in a snowy winter forest, brown trunk with green needles, covered in light snow, 20x20 pixels, top-down view, minimalistic style for 2D game."
- **hewan.png (20x20)**: "Simple pixel art icon of a deer or rabbit in a winter landscape, brown fur with white accents, standing still, 20x20 pixels, side view, minimalistic style for 2D survival game."
- **herbal.png (15x15)**: "Simple pixel art icon of a medicinal herb plant, green leaves with small flowers, growing in snow, 15x15 pixels, top-down view, minimalistic style for 2D game."
- **serigala.png (20x20)**: "Simple pixel art icon of a wolf predator, gray fur with white underbelly, snarling or walking, 20x20 pixels, side view, minimalistic style for 2D survival game."
- **shelter.png (30x30)**: "Simple pixel art icon of a bushcraft shelter made from wood and branches, like a lean-to tent in snowy forest, brown wood with green foliage cover, 30x30 pixels, top-down view, minimalistic style for 2D game."
- **player.png (20x20, opsional)**: "Simple pixel art icon of a human survivor in winter clothing, red jacket and pants, holding a backpack, 20x20 pixels, side view, minimalistic style for 2D game."

## Steps
- [x] Beri ukuran gambar ke pengguna
- [x] Edit index.html: Tambah <img> tags untuk gambar-gambar tersebut
- [x] Edit game.js: Tambah resource 'herbal' dan update generateResource
- [x] Edit game.js: Buat hewan (food) bergerak dengan properti speed and direction
- [x] Edit game.js: Tambah predator (serigala) yang bergerak dan menyerang player jika tidak di shelter
- [x] Edit game.js: Tambah bushcraft shelter yang bisa dibuat dari kayu, melindungi dari predator
- [x] Edit game.js: Tambah crafting teh dari herbal + air, tambah inventory 'tea'
- [x] Edit game.js: Ganti fillRect dengan drawImage untuk resources, player, campfire, dll.
- [x] Edit game.js: Tambah fungsi consume teh (tekan 3), update HUD
- [x] Edit game.js: Update handleInteraction untuk herbal, shelter, dll.
- [x] Edit game.js: Tambah kompor untuk memasak daging dan memanaskan air
- [x] Edit index.html: Update HUD untuk menampilkan daging matang dan air panas
- [x] Edit index.html: Update kontrol untuk kompor dan item baru
- [x] Edit style.css: Tambah styling jika perlu untuk HUD baru (herbal, tea) - No additional styling needed
- [x] Edit game.js: Tambah AI untuk hewan - predator berburu hewan makanan dan pemain, hewan makanan melarikan diri dari predator
- [x] Edit game.js: Tambah mekanisme predator menyerang hewan makanan, menghilangkan hewan dan mengisi ulang kelaparan predator
- [x] Test game: Jalankan index.html, cek semua fitur baru
