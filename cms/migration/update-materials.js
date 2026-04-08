import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';

const REMOTE_URL = process.env.REMOTE_STRAPI_URL || 'https://cms-production-06af.up.railway.app';
const ADMIN_EMAIL = process.env.REMOTE_ADMIN_EMAIL || 'richard@twd.agency';
const ADMIN_PASSWORD = process.env.REMOTE_ADMIN_PASSWORD || '!nquisitioN666';
const UPLOADS_DIR = 'D:\\uploads';

let jwt = null;

async function login() {
  const res = await axios.post(`${REMOTE_URL}/admin/login`, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });
  jwt = res.data.data.token;
  return jwt;
}

async function uploadImage(filePath, altText) {
  const form = new FormData();
  form.append('files', fs.createReadStream(filePath), {
    filename: path.basename(filePath),
    contentType: filePath.endsWith('.png') ? 'image/png' : 'image/jpeg',
  });
  form.append('fileInfo', JSON.stringify({
    name: path.basename(filePath),
    alternativeText: altText,
  }));
  const res = await axios.post(`${REMOTE_URL}/api/upload`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${jwt}`,
    },
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    timeout: 60000,
  });
  return res.data[0];
}

function text(t, opts = {}) {
  return { type: 'text', text: t, ...opts };
}
function paragraph(children) {
  return { type: 'paragraph', children: Array.isArray(children) ? children : [children] };
}
function heading(level, t) {
  return { type: 'heading', level, children: [text(t)] };
}
function imageBlock(img) {
  return {
    type: 'image',
    image: {
      name: img.name,
      alternativeText: img.alternativeText || '',
      url: img.url,
      width: img.width,
      height: img.height,
      formats: img.formats || {},
      hash: img.hash,
      ext: img.ext,
      mime: img.mime,
      size: img.size,
    },
    children: [{ type: 'text', text: '' }],
  };
}

async function getExistingPages() {
  const res = await axios.get(
    `${REMOTE_URL}/content-manager/collection-types/api::material-landing-page.material-landing-page?page=1&pageSize=50`,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  return res.data.results || res.data.data || [];
}

async function updatePage(documentId, data) {
  const res = await axios.put(
    `${REMOTE_URL}/content-manager/collection-types/api::material-landing-page.material-landing-page/${documentId}`,
    data,
    { headers: { Authorization: `Bearer ${jwt}` } }
  );
  return res.data;
}

function findImage(patterns) {
  for (const p of patterns) {
    const full = path.join(UPLOADS_DIR, p);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

const materialData = {
  'pet-recycling': {
    heroSubtitle: 'Buy & Sell PET plastic worldwide at WasteTrade. We specialise in PET Recycling in the UK, where you get the best prices for your PET plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/12/PET-plastic-bottles.jpg', '2022/12/PET-plastic-bottles-scaled.jpg'], alt: 'PET plastic bottles', afterSection: 0 },
      { patterns: ['2022/12/PET-granules.jpg', '2022/12/PET-granules-scaled.jpg'], alt: 'PET granules', afterSection: 1 },
      { patterns: ['2022/02/PET-Bottle-3.jpeg', '2022/02/PET-Bottles-4.jpeg'], alt: 'PET bottle recycling', afterSection: 2 },
      { patterns: ['2022/12/PET-plastic-straps-baled.jpg'], alt: 'PET plastic straps baled', afterSection: 3 },
    ],
    faqs: [
      { question: 'Is polyethylene terephthalate or PET safe?', answer: 'Yes, PET is considered safe for food and beverage packaging. It is approved by health authorities worldwide, including the FDA and EFSA. PET does not contain BPA or phthalates, and it is one of the most tested and regulated plastic materials for consumer use.' },
      { question: 'What are some examples of polyethylene terephthalate?', answer: 'Common examples include plastic water and fizzy drink bottles, food containers, polyester clothing fibres, packaging trays, and clear clamshell food packaging.' },
      { question: 'What is polyethylene terephthalate made out of?', answer: 'PET is formed by combining ethylene glycol and terephthalic acid through a polycondensation reaction. These raw materials are derived from petroleum-based feedstocks.' },
      { question: 'What is polyethylene terephthalate used for?', answer: 'PET is used for beverage bottles, food packaging, synthetic fibres (polyester), engineering resins, thermoformed packaging, and various industrial applications.' },
      { question: 'What are the advantages of polyethylene terephthalate?', answer: 'PET is lightweight, strong, transparent, shatterproof, has excellent barrier properties against moisture and gases, and is highly recyclable. It also has a low carbon footprint compared to alternative materials.' },
      { question: 'Can polyethylene terephthalate be recycled?', answer: 'Yes, PET is one of the most recyclable plastics. It can be recycled back into bottles, packaging, polyester fibre for clothing and carpets, and other useful products. WasteTrade connects PET waste generators with ethical recyclers worldwide.' },
    ],
  },
  'hdpe-recycling': {
    heroSubtitle: 'Buy & Sell HDPE plastic worldwide at WasteTrade. We specialise in HDPE Recycling in the UK, where you get the best prices for your HDPE plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/03/Buy-HDPE.jpg'], alt: 'HDPE material', afterSection: 0 },
      { patterns: ['2022/03/HDPE-Pipe-Buy.jpg'], alt: 'HDPE pipe', afterSection: 1 },
      { patterns: ['2022/03/HDPE-Waste-For-Sale.jpg'], alt: 'HDPE waste for sale', afterSection: 2 },
      { patterns: ['2022/05/HDPE1.jpeg', '2022/05/HDPE2.jpeg'], alt: 'HDPE recycling', afterSection: 3 },
    ],
    faqs: [
      { question: 'What is HDPE plastic?', answer: 'HDPE (High-Density Polyethylene) is a thermoplastic polymer made from the monomer ethylene. It is known for being lightweight, strong, impact resistant, and chemically resistant.' },
      { question: 'What is HDPE used for?', answer: 'HDPE is used for milk bottles, detergent bottles, pipes, playground equipment, plastic lumber, geomembranes, and various packaging applications.' },
      { question: 'Can HDPE be recycled?', answer: 'Yes, HDPE is one of the easiest plastics to recycle. It is identified by the recycling number 2 and can be recycled into bottles, pipes, plastic lumber, and other products.' },
      { question: 'Is HDPE environmentally friendly?', answer: 'HDPE is highly recyclable and uses less energy to produce than many alternative materials. Recycling HDPE reduces carbon emissions and keeps valuable plastic out of landfill.' },
    ],
  },
  'ldpe-recycling': {
    heroSubtitle: 'Buy & Sell LDPE plastic worldwide at WasteTrade. We specialise in LDPE Recycling in the UK, where you get the best prices for your LDPE plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/02/LDPE-Film-90-10-80-20-3.jpeg'], alt: 'LDPE film', afterSection: 0 },
      { patterns: ['2022/02/LDPE-Film-90-10-80-20-4.jpeg'], alt: 'LDPE film rolls', afterSection: 1 },
    ],
    faqs: [
      { question: 'What is LDPE plastic?', answer: 'LDPE (Low-Density Polyethylene) is a thermoplastic polymer made from the monomer ethylene. It is flexible, lightweight, and resistant to impact and chemicals.' },
      { question: 'What is LDPE used for?', answer: 'LDPE is used for plastic bags, shrink wrap, stretch film, squeezable bottles, coatings for packaging, and agricultural films.' },
      { question: 'Can LDPE be recycled?', answer: 'Yes, LDPE can be recycled. It is marked with recycling number 4. Recycled LDPE is used for bin liners, floor tiles, furniture, and plastic lumber.' },
    ],
  },
  'pp-recycling': {
    heroSubtitle: 'We connect buyers & sellers of Polypropylene around the world. Get the best prices for Polypropylene waste material throughout the world.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/05/PP1-1-1-2.jpg', '2022/05/PP1-1-1.jpg'], alt: 'Polypropylene material', afterSection: 0 },
    ],
    faqs: [
      { question: 'What is polypropylene plastic?', answer: 'Polypropylene (PP) is a thermoplastic polymer made from the monomer propylene. It is tough, lightweight, chemical resistant and moisture resistant.' },
      { question: 'What is polypropylene used for?', answer: 'PP is used for food packaging, automotive parts, textiles, medical equipment, laboratory equipment, and a wide range of consumer goods.' },
      { question: 'Can polypropylene be recycled?', answer: 'Yes, PP is recyclable and is identified by recycling number 5. Recycled PP is used in automotive parts, garden furniture, storage bins, and industrial fibres.' },
    ],
  },
  'pvc-recycling': {
    heroSubtitle: 'Buy & Sell PVC plastic worldwide at WasteTrade. We specialise in PVC Recycling in the UK, where you get the best prices for your PVC plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/03/Buy-PVC.jpg'], alt: 'PVC material', afterSection: 0 },
      { patterns: ['2022/05/PVC-Plastic-scaled-1-1-2.jpg'], alt: 'PVC plastic', afterSection: 2 },
    ],
    faqs: [
      { question: 'What is PVC plastic?', answer: 'PVC (Polyvinyl Chloride) is a synthetic thermoplastic polymer made by combining chlorine and ethylene to form vinyl chloride monomer. It is the third-most widely produced plastic.' },
      { question: 'What is PVC used for?', answer: 'PVC is used in construction (pipes, window frames, flooring), healthcare (IV bags, tubing), automotive components, electrical cable insulation, and credit cards.' },
      { question: 'Can PVC be recycled?', answer: 'Yes, PVC can be recycled through both mechanical and feedstock recycling processes. Recycled PVC is used in pipes, flooring, and various construction products.' },
      { question: 'Is PVC safe?', answer: 'PVC is safe when manufactured and used properly. It is widely approved for use in food packaging, medical devices, and water pipes by regulatory authorities worldwide.' },
    ],
  },
  'eps-recycling': {
    heroSubtitle: 'Buy & Sell EPS plastic worldwide at WasteTrade. We specialise in EPS Recycling in the UK, where you get the best prices for your EPS plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/05/EPS1.jpeg'], alt: 'Expanded polystyrene', afterSection: 0 },
      { patterns: ['2022/05/EPS2.jpeg'], alt: 'EPS packaging', afterSection: 1 },
      { patterns: ['2022/05/EPS3.jpeg'], alt: 'EPS recycling', afterSection: 2 },
    ],
    faqs: [
      { question: 'What is expanded polystyrene?', answer: 'Expanded polystyrene (EPS) is a lightweight, rigid foam plastic made by expanding beads of polystyrene with pentane gas. It is approximately 98% air.' },
      { question: 'What is EPS used for?', answer: 'EPS is used for protective packaging, food containers, insulation boards, construction materials, and geofoam in civil engineering.' },
      { question: 'Can EPS be recycled?', answer: 'Yes, EPS can be recycled. It is compressed to reduce volume then melted and reformed. Recycled EPS is used in picture frames, architectural mouldings, and other products.' },
    ],
  },
  'pc-recycling': {
    heroSubtitle: 'Buy & Sell PC plastic worldwide at WasteTrade. We specialise in PC Recycling in the UK, where you get the best prices for your PC plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/03/Buy-Polycarbonate.jpg'], alt: 'Polycarbonate material', afterSection: 0 },
      { patterns: ['2022/03/Polycarbonate-Price.jpg'], alt: 'Polycarbonate plastic', afterSection: 1 },
    ],
    faqs: [
      { question: 'What is polycarbonate plastic?', answer: 'Polycarbonate (PC) is an impact-resistant thermoplastic with excellent optical clarity. It is extremely durable and can withstand high temperatures.' },
      { question: 'What is polycarbonate used for?', answer: 'PC is used in safety glasses, electronic components, automotive headlight lenses, CDs/DVDs, medical devices, and bulletproof glass.' },
      { question: 'Can polycarbonate be recycled?', answer: 'Yes, polycarbonate can be recycled by shredding, melting and reforming into recycled plastic pellet. WasteTrade connects PC waste generators with verified recyclers.' },
    ],
  },
  'abs-recycling': {
    heroSubtitle: 'Buy & Sell ABS plastic worldwide at WasteTrade. We specialise in ABS Recycling in the UK, where you get the best prices for your ABS plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [
      { patterns: ['2022/05/ABS-1.jpeg', '2022/05/ABS-1-scaled.jpeg'], alt: 'ABS plastic material', afterSection: 0 },
    ],
    faqs: [
      { question: 'What is ABS plastic?', answer: 'ABS (Acrylonitrile Butadiene Styrene) is a thermoplastic polymer made from three monomers: acrylonitrile, butadiene, and styrene. It is stiff, strong, and impact resistant.' },
      { question: 'What is ABS used for?', answer: 'ABS is used for computer keyboards, LEGO bricks, power tool housings, luggage, automotive trim, plug socket faces, and 3D printing filament.' },
      { question: 'Can ABS be recycled?', answer: 'Yes, ABS can be recycled through mechanical recycling. The process involves sorting, grinding using froth flotation, and melting to reform into sheets or filament.' },
    ],
  },
  'acrylic-recycling': {
    heroSubtitle: 'Buy & Sell Acrylic plastic worldwide at WasteTrade. We specialise in Acrylic Recycling in the UK, where you get the best prices for your Acrylic plastic scrap materials.',
    materialCategory: 'Plastic',
    images: [],
    faqs: [
      { question: 'What is acrylic used for?', answer: 'Acrylic is used in signage, displays, aquariums, skylights, medical equipment such as incubators and surgical devices, and as a lightweight alternative to glass in many applications.' },
      { question: 'What is acrylic made out of?', answer: 'Acrylic (PMMA - Polymethyl Methacrylate) is made from methyl methacrylate monomer through polymerisation. It is a transparent thermoplastic.' },
      { question: 'What are the advantages of acrylic?', answer: 'Acrylic offers high optical clarity, is lightweight (about half the weight of glass), UV resistant, shatter resistant, and can be easily shaped and fabricated.' },
      { question: 'Is acrylic better than plastic?', answer: 'Acrylic is a type of plastic with superior optical clarity and weather resistance compared to many other plastics. It transmits 92% of visible light, more than glass.' },
      { question: 'Is acrylic a cheap material?', answer: 'Acrylic is more expensive than common plastics like polyethylene or polypropylene, but it is significantly cheaper than glass while offering similar optical properties and better impact resistance.' },
    ],
  },
  'tyres-recycling': {
    heroSubtitle: 'Buy & Sell Tyre waste worldwide at WasteTrade. We specialise in Tyres Recycling, where you get the best prices for scrap Tyre materials.',
    materialCategory: 'Rubber',
    images: [],
    faqs: [
      { question: 'Can Tyres be Recycled?', answer: 'Yes, tyres can be recycled. The recycling process involves breaking down the tyre into its component parts — rubber, steel and fibre — which can all be recovered and reused in various applications.' },
      { question: 'How to Recycle Tyres?', answer: 'Tyres are recycled by collecting and transporting them to specialist processing facilities where they undergo size reduction, material separation, and preparation for reuse. WasteTrade connects businesses with verified tyre recycling partners.' },
      { question: 'How to Recycle Old Tyres?', answer: 'Old tyres should be taken to licensed recycling facilities. Through WasteTrade, businesses can access a network of vetted recycling partners who handle tyre waste responsibly and compliantly.' },
      { question: 'Are Car Tyres Recyclable?', answer: 'Yes, car tyres are recyclable. They yield rubber crumb for surfacing, steel for scrap metal recycling, and textile fibre. Recycled tyre rubber is used in playground surfaces, sports fields, and construction.' },
      { question: 'Where to Recycle Car Tyres?', answer: 'Car tyres can be recycled through licensed tyre recycling facilities. WasteTrade helps businesses find verified recycling partners worldwide who offer competitive prices for tyre waste.' },
      { question: 'Where to Recycle Bike Tyres?', answer: 'Bike tyres can be recycled at specialist rubber recycling facilities. While smaller in volume than car tyres, they follow similar recycling routes and can be processed alongside other rubber waste.' },
      { question: 'Can You Take Tyres to Recycling Centre?', answer: 'Many household waste recycling centres accept used tyres, though quantities may be limited. For commercial volumes, WasteTrade provides access to dedicated tyre recycling services.' },
    ],
  },
};

async function main() {
  console.log('Material Landing Pages — Full Update');
  console.log(`Remote: ${REMOTE_URL}\n`);

  await login();
  console.log('Logged in.\n');

  const pages = await getExistingPages();
  console.log(`Found ${pages.length} existing material pages.\n`);

  for (const page of pages) {
    const slug = page.slug;
    const data = materialData[slug];
    if (!data) {
      console.log(`  ⊘ No update data for slug: ${slug}`);
      continue;
    }

    console.log(`\n  ▸ Updating: ${page.title} (${slug})`);

    // Upload images for this material
    const uploadedImages = [];
    for (const imgDef of data.images) {
      const localPath = findImage(imgDef.patterns);
      if (!localPath) {
        console.log(`    ⚠ Image not found: ${imgDef.patterns.join(', ')}`);
        continue;
      }
      try {
        console.log(`    ↑ Uploading: ${path.basename(localPath)}`);
        const uploaded = await uploadImage(localPath, imgDef.alt);
        uploadedImages.push({ ...imgDef, media: uploaded });
        console.log(`    ✓ Uploaded: id=${uploaded.id}`);
      } catch (err) {
        console.log(`    ✗ Upload failed: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    // Rebuild content with images inserted after the corresponding sections
    const existingContent = page.content || [];
    const newContent = [];
    let h2Count = 0;

    for (const block of existingContent) {
      newContent.push(block);

      if (block.type === 'heading' && block.level === 2) {
        // Find all images for this section (afterSection matches h2 index)
        const sectionImages = uploadedImages.filter(i => i.afterSection === h2Count);
        // Insert them right after the H2
        for (const img of sectionImages) {
          newContent.push(imageBlock(img.media));
        }
        h2Count++;
      }
    }

    // Update the page
    try {
      await updatePage(page.documentId, {
        heroSubtitle: data.heroSubtitle,
        materialCategory: data.materialCategory,
        content: newContent,
        faqs: data.faqs,
      });
      console.log(`  ✓ Updated: ${page.title}`);
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message;
      console.error(`  ✗ Update failed: ${page.title} — ${msg}`);
      if (err.response?.data?.error?.details) {
        console.error('    Details:', JSON.stringify(err.response.data.error.details, null, 2));
      }
    }
  }

  console.log('\n\nDone!');
}

main().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
