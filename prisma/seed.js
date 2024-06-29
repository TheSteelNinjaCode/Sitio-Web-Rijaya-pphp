import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// UserRole
const userRoleData = [
  {
    name: "Admin",
  },
  {
    name: "User",
  },
];

// User
const userData = [
  {
    name: "Juan",
    email: "j@gmail.com",
    password: "$2b$10$mgjotYzIXwrK1MCWmu4tgeUVnLcb.qzvqwxOq4FXEL8k2obwXivDi", // TODO: template password 1234 (bcrypt) testing only
    roleName: "Admin",
  },
];

// Categories
const categoryData = [
  {
    name: "Plásticos",
    description: "Productos hechos de plástico.",
    image: "assets/images/Bote 120.png",
  },
  {
    name: "Estantes",
    description: "Diferentes tipos de estantes para almacenamiento.",
    image: "assets/images/ESTANTE_PEQUEÑO.png",
  },
  {
    name: "Sillas",
    description: "Diversas sillas para uso en oficina y hogar.",
    image: "assets/Productos/Lo mas buscado/SILLA_ISO_ROJA.png",
  },
  {
    name: "Archivadores",
    description: "Archivadores de diferentes tamaños y capacidades.",
    image: "assets/Productos/Lo mas buscado/guardavisibles con (1).png",
  },
];

// Products
const productData = [
  {
    name: "Gaveta 1 Europlast",
    description: "Gaveta de plástico para almacenamiento.",
    price: 50.0,
    categoryName: "Plásticos",
  },
  {
    name: "Estante Aerosoles",
    description: "Estante metálico para aerosoles.",
    price: 75.0,
    categoryName: "Estantes",
  },
  {
    name: "Caja Canado con Tapa",
    description: "Caja de plástico con tapa.",
    price: 45.0,
    categoryName: "Plásticos",
  },
  {
    name: "Caja Bamba'o",
    description: "Caja de plástico para múltiples usos.",
    price: 55.0,
    categoryName: "Plásticos",
  },
  {
    name: "Archivador Lap. 3 Gavetas",
    description: "Archivador metálico con 3 gavetas.",
    price: 95.0,
    categoryName: "Archivadores",
  },
  {
    name: "Archivador Lap. 4 Gavetas",
    description: "Archivador metálico con 4 gavetas.",
    price: 55.0,
    categoryName: "Archivadores",
  },
  {
    name: "Guarda Visible 20 Gavetas",
    description: "Organizador con 20 gavetas visibles.",
    price: 30.0,
    categoryName: "Archivadores",
  },
  {
    name: "Silla Iso Tela",
    description: "Silla cómoda con tapizado de tela.",
    price: 120.0,
    categoryName: "Sillas",
  },
];

// Product Images
const productImageData = [
  {
    productName: "Gaveta 1 Europlast",
    image: "assets/Productos/Muebles de almacenaje/GAVETA_1_EUROPLAST_AZUL.png",
  },
  {
    productName: "Gaveta 1 Europlast",
    image:
      "assets/Productos/Muebles de almacenaje/GAVETA_1_EUROPLAST_AMARILLO.png",
  },
  {
    productName: "Gaveta 1 Europlast",
    image: "assets/Productos/Muebles de almacenaje/GAVETA_1_EUROPLAST_GRIS.png",
  },
  {
    productName: "Gaveta 1 Europlast",
    image: "assets/Productos/Muebles de almacenaje/GAVETA_1_EUROPLAST_ROJA.png",
  },
  {
    productName: "Estante Aerosoles",
    image: "assets/Productos/Muebles de almacenaje/ESTANTE_AEROSOLES.png",
  },
  {
    productName: "Caja Canado con Tapa",
    image: "assets/Productos/Muebles de almacenaje/CAJA_CANADA_CON_TAPA.png",
  },
  {
    productName: "Caja Bamba'o",
    image: "assets/Productos/Muebles de almacenaje/CAJA_BAMBA_O.png",
  },
  {
    productName: "Archivador Lap. 3 Gavetas",
    image: "assets/Productos/Lo mas buscado/Archivero lap 3 gav.png",
  },
  {
    productName: "Archivador Lap. 4 Gavetas",
    image: "assets/Productos/Lo mas buscado/ARCHIVERO_LAP.4GAV_38X53.5X50.png",
  },
  {
    productName: "Guarda Visible 20 Gavetas",
    image: "assets/Productos/Lo mas buscado/guardavisibles con (1).png",
  },
  {
    productName: "Silla Iso Tela",
    image: "assets/Productos/Lo mas buscado/SILLA_ISO_ROJA.png",
  },
];

async function main() {
  // UserRole
  await prisma.userRole.deleteMany();
  await prisma.userRole.createMany({ data: userRoleData });

  // Fetch created roles
  const roles = await prisma.userRole.findMany();
  const roleMap = {};
  roles.forEach((role) => {
    roleMap[role.name] = role.id;
  });

  // User
  await prisma.user.deleteMany();
  for (const user of userData) {
    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        roleId: roleMap[user.roleName],
      },
    });
  }

  // Categories
  await prisma.category.deleteMany();
  await prisma.category.createMany({
    data: categoryData,
  });

  // Fetch created categories
  const categories = await prisma.category.findMany();
  const categoryMap = {};
  categories.forEach((category) => {
    categoryMap[category.name] = category.id;
  });

  // Products
  await prisma.product.deleteMany();
  const productMap = {};

  for (const product of productData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: product.name,
        description: product.description,
        price: product.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        categories: {
          connect: { id: categoryMap[product.categoryName] },
        },
      },
    });
    productMap[product.name] = createdProduct.id;
  }

  // Product Category
  await prisma.productCategory.deleteMany();

  for (const product of productData) {
    const productId = productMap[product.name];
    const categoryId = categoryMap[product.categoryName];
    await prisma.productCategory.create({
      data: {
        productId: productId,
        categoryId: categoryId,
      },
    });
  }

  // Product Images
  await prisma.productImage.deleteMany();

  for (const productImage of productImageData) {
    const productId = productMap[productImage.productName];
    await prisma.productImage.create({
      data: {
        image: productImage.image,
        createdAt: new Date(),
        updatedAt: new Date(),
        productId: productId,
      },
    });
  }
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
