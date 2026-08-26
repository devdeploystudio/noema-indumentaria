export const PRODUCTS = [
  { id: 'p1', name: 'Camisa de lino premium', category: 'hombre', price: 46000, oldPrice: 58000, badge: 'Sale', img: 'assets/img/products/product-camisa-lino.jpg', color: 'Crudo', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 6, M: 0, L: 5, XL: 3 }, desc: 'Lino 100% natural, corte relajado y botones de nácar. Se lava y mejora con cada uso.' },
  { id: 'p2', name: 'Blazer negro de lana', category: 'hombre', price: 185000, badge: 'Nuevo', demoAlwaysNew: true, img: 'assets/img/products/product-blazer-negro.jpg', color: 'Negro', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 2, M: 4, L: 3, XL: 0 }, desc: 'Lana italiana con forro de viscosa. Un básico estructurado para todo el año.' },
  { id: 'p3', name: 'Sweater de punto grafito', category: 'hombre', price: 72000, img: 'assets/img/products/product-sweater-grafito.jpg', color: 'Grafito', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 5, M: 6, L: 0, XL: 2 }, desc: 'Punto medio de lana merino, cuello redondo y calce entallado sin ajustar.' },
  { id: 'p4', name: 'Campera bomber verde', category: 'hombre', price: 96000, badge: 'Nuevo', demoAlwaysNew: true, img: 'assets/img/products/product-campera-bomber.jpg', color: 'Verde militar', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 0, M: 3, L: 4, XL: 2 }, desc: 'Exterior resistente al agua, puños y cintura elastizados, forro acolchado liviano.' },
  { id: 'p18', name: 'Polo piqué azul marino', category: 'hombre', price: 52000, img: 'assets/img/products/product-polo-azul.jpg', color: 'Azul marino', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 8, M: 7, L: 5, XL: 4 }, desc: 'Piqué de algodón peinado, cuello tejido y calce clásico.' },
  { id: 'p19', name: 'Camisa de lino oxford', category: 'hombre', price: 58000, img: 'assets/img/products/product-camisa-lino-beige.jpg', color: 'Beige', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 4, M: 0, L: 3, XL: 2 }, desc: 'Trama oxford en lino, ideal para combinar con o sin corbata.' },
  { id: 'p20', name: 'Buzo crewneck marrón', category: 'hombre', price: 68000, badge: 'Nuevo', demoAlwaysNew: true, img: 'assets/img/products/product-sweatshirt-marron.jpg', color: 'Marrón', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 5, M: 4, L: 0, XL: 3 }, desc: 'Frisa de algodón pesado, puño y cintura acanalados, calce oversize.' },

  { id: 'p5', name: 'Vestido midi de seda', category: 'mujer', price: 145000, img: 'assets/img/products/product-vestido-seda.jpg', color: 'Champagne', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 3, M: 0, L: 2, XL: 1 }, desc: 'Seda natural con caída fluida, breteles regulables y forro completo.' },
  { id: 'p6', name: 'Trench camel clásico', category: 'mujer', price: 168000, img: 'assets/img/products/product-trench-camel.jpg', color: 'Camel', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 2, M: 3, L: 2, XL: 0 }, desc: 'Gabardina de algodón con cinturón anudado, corte atemporal.' },
  { id: 'p7', name: 'Jean recto tiro alto', category: 'mujer', price: 68000, oldPrice: 82000, badge: 'Sale', img: 'assets/img/products/product-jean-recto.jpg', color: 'Azul claro', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 5, M: 0, L: 4, XL: 3 }, desc: 'Denim rígido de tiro alto y pierna recta, se afloja con el uso.' },
  { id: 'p8', name: 'Hoodie oversize beige', category: 'mujer', price: 64000, img: 'assets/img/products/product-hoodie-beige.jpg', color: 'Beige', sizeType: null, sizes: ['Único'], stock: { 'Único': 9 }, desc: 'Frisa liviana de algodón orgánico, calce oversize unisex.' },
  { id: 'p9', name: 'Blusa de seda ecru', category: 'mujer', price: 78000, badge: 'Nuevo', demoAlwaysNew: true, img: 'assets/img/products/product-blusa-seda.jpg', color: 'Ecru', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 6, M: 5, L: 0, XL: 2 }, desc: 'Seda natural con botones forrados y mangas con puño abotonado.' },
  { id: 'p10', name: 'Falda plisada midi', category: 'mujer', price: 62000, oldPrice: 89000, badge: 'Sale', img: 'assets/img/products/product-falda-plisada.jpg', color: 'Beige', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 0, M: 4, L: 3, XL: 2 }, desc: 'Plisado permanente y cintura elastizada en la mitad trasera.' },
  { id: 'p11', name: 'Botas de cuero negro', category: 'mujer', price: 142000, img: 'assets/img/products/product-botas-cuero.jpg', color: 'Negro', sizeType: 'calzado', sizes: ['36', '37', '38', '39', '40', '41'], stock: { '36': 2, '37': 0, '38': 3, '39': 4, '40': 0, '41': 1 }, desc: 'Caña corta de cuero natural, forro de cuero y suela de cuero con taco de goma.' },
  { id: 'p12', name: 'Cardigan de punto beige', category: 'mujer', price: 82000, img: 'assets/img/products/product-cardigan-punto.jpg', color: 'Beige', sizeType: 'ropa', sizes: ['S', 'M', 'L', 'XL'], stock: { S: 4, M: 0, L: 3, XL: 2 }, desc: 'Punto abierto de lana y algodón, con botones de nácar.' },

  { id: 'p13', name: 'Cartera estructurada de cuero', category: 'accesorios', price: 156000, img: 'assets/img/products/product-cartera-cuero.jpg', color: 'Beige', sizeType: null, sizes: ['Único'], stock: { 'Único': 6 }, desc: 'Cuero vacuno con herrajes dorados y bandolera desmontable.' },
  { id: 'p14', name: 'Cinturón de cuero italiano', category: 'accesorios', price: 36000, oldPrice: 52000, badge: 'Sale', img: 'assets/img/products/product-cinturon-cuero.jpg', color: 'Negro', sizeType: null, sizes: ['Único'], stock: { 'Único': 10 }, desc: 'Cuero italiano de grano completo con hebilla metálica cepillada.' },
  { id: 'p15', name: 'Aros de oro', category: 'accesorios', price: 38000, badge: 'Nuevo', demoAlwaysNew: true, img: 'assets/img/products/product-aros-oro.jpg', color: 'Dorado', sizeType: null, sizes: ['Único'], stock: { 'Único': 15 }, desc: 'Baño de oro 18k sobre acero quirúrgico, hipoalergénicos.' },
  { id: 'p16', name: 'Lentes de sol carey', category: 'accesorios', price: 48000, oldPrice: 64000, badge: 'Sale', img: 'assets/img/products/product-lentes-sol.jpg', color: 'Carey', sizeType: null, sizes: ['Único'], stock: { 'Único': 8 }, desc: 'Marco de acetato con protección UV400 y funda incluida.' },
  { id: 'p17', name: 'Pañuelo de seda estampado', category: 'accesorios', price: 52000, img: 'assets/img/products/product-panuelo-seda.jpg', color: 'Beige', sizeType: null, sizes: ['Único'], stock: { 'Único': 12 }, desc: 'Seda natural estampada a mano, 90x90cm, dobladillo cosido a mano.' },
];

export const FEATURED_IDS = ['p2', 'p6', 'p13', 'p9', 'p20'];

export const COUPONS = { BIENVENIDA15: { rate: 0.15, expires: null } };

// Códigos de pedido de demo (sin backend real): se sortea uno al finalizar
// la compra y "seguir mi envío" lo busca acá. stage 0 = recién pagando,
// stage 1 = ya preparando el pedido — recién comprado, todavía no despachó.
export const DEMO_ORDERS = {
  'NOE-104822': { stage: 0, label: 'En proceso de pago' },
  'NOE-217965': { stage: 0, label: 'En proceso de pago' },
  'NOE-338410': { stage: 1, label: 'Preparando pedido' },
  'NOE-451093': { stage: 1, label: 'Preparando pedido' },
  'NOE-562784': { stage: 1, label: 'Preparando pedido' },
};
