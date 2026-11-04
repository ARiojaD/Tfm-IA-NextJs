import { CatalogImageSchema } from "@/domain/entities/CatalogImage";

// The images topics can use. To add one:
//   1. Choose an image with a free licence (Wikimedia Commons: public domain or CC BY / CC BY-SA).
//   2. Save it as .jpg in public/images/topics (specific) or public/images/catalog (general).
//   3. Add it here with its real width and height and its credit (the test checks the file and its size).
// Validated with the domain schema when the module loads: a wrong entry fails at once, not in a page.
export const IMAGE_CATALOG = CatalogImageSchema.array().parse([
  {
    id: "julio-cesar-busto",
    src: "/images/topics/julio-cesar.jpg",
    width: 960,
    height: 1694,
    credit: "Foto: Ángel M. Felicísimo · Dominio público",
    era: "ROMAN",
    kind: "SPECIFIC",
    alt: "Busto de mármol de Julio César, de frente, con el rostro delgado y arrugado",
    caption: "Retrato de Túsculo. Museo de Antigüedades de Turín.",
  },
  {
    id: "rendicion-de-vercingetorix",
    src: "/images/topics/asedio-de-alesia.jpg",
    width: 960,
    height: 640,
    credit: "Dominio público",
    era: "ROMAN",
    kind: "SPECIFIC",
    alt: "Vercingétorix, a caballo, arroja sus armas ante Julio César, sentado con un manto rojo entre sus legionarios",
    caption: "Vercingétorix arroja sus armas a los pies de Julio César (Lionel Royer, 1899).",
  },
  // General images: any topic of their civilization can use them while it has no image of its own.
  {
    id: "roma-foro",
    src: "/images/catalog/roma-foro.jpg",
    width: 1280,
    height: 466,
    credit: "Foto: BeBo86 · CC BY-SA 3.0",
    era: "ROMAN",
    kind: "GENERAL",
    alt: "Panorámica del Foro romano con el arco de Septimio Severo y las columnas del templo de Saturno",
    caption: "El Foro romano, centro de la vida pública de Roma.",
  },
  {
    id: "roma-coliseo",
    src: "/images/catalog/roma-coliseo.jpg",
    width: 1280,
    height: 673,
    credit: "Foto: Paolo Costa Baldi · CC BY-SA 3.0",
    era: "ROMAN",
    kind: "GENERAL",
    alt: "Interior del Coliseo de Roma, con las gradas en ruinas y los pasillos bajo la antigua arena",
    caption: "El interior del Coliseo, el gran anfiteatro de Roma.",
  },
  {
    id: "grecia-partenon",
    src: "/images/catalog/grecia-partenon.jpg",
    width: 1280,
    height: 549,
    credit: "Foto: Jebulon · CC0",
    era: "ANCIENT_GREECE",
    kind: "GENERAL",
    alt: "La Acrópolis de Atenas con el Partenón en lo alto de la colina, entre andamios de restauración",
    caption: "La Acrópolis de Atenas, coronada por el Partenón.",
  },
  {
    id: "hispania-teatro-merida",
    src: "/images/catalog/hispania-teatro-merida.jpg",
    width: 1280,
    height: 729,
    credit: "Foto: Luis Miguel Bugallo Sánchez · CC BY-SA 4.0",
    era: "HISPANIA",
    kind: "GENERAL",
    alt: "Teatro romano de Mérida: gradas de piedra frente al escenario de dos pisos de columnas",
    caption: "El teatro romano de Augusta Emerita (Mérida).",
  },
  {
    id: "numancia-ultimo-dia",
    src: "/images/catalog/hispania-numancia.jpg",
    width: 1280,
    height: 852,
    credit: "Dominio público",
    era: "HISPANIA",
    kind: "SPECIFIC",
    alt: "Pintura: numantinos heridos entre el humo y las ruinas mientras los legionarios romanos entran en la ciudad",
    caption: "El último día de Numancia (Alejo Vera, 1881).",
  },
]);
