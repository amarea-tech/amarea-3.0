Nella sezione "Lista prioritaria di lancio" (`src/components/NewsletterBlock.tsx`):

1. Rimuovere l'intera colonna sinistra con il video di Sibilla (il `<motion.div>` che contiene il `<video>` e il badge "Edizione limitata").
2. Rimuovere il paragrafo descrittivo sotto il titolo: "La prima crema viso anti-age Amarea, formulata con attivi botanici ottenuti da zafferano e vinacce marchigiane recuperate tramite upcycling. Le prime quantità saranno limitate."
3. Adattare la griglia a una singola colonna centrata (rimuovere `lg:grid-cols-2`) così il contenuto rimanente (titolo, benefit, form) resta ben proporzionato.
4. Pulire gli import non più usati: `sibillaProduct`, `sibillaVideo`.

I file asset (`sibilla-video.mp4.asset.json`, `sibilla-product.jpg.asset.json`) restano per ora; posso eliminarli se confermi che non servono altrove.