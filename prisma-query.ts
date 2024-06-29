import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = prisma.product.findMany({
  where: {
    price: {
      gt: 1000,
    },
  },
  include: {
    ProductCategory: {
      select: {
        product: {
          include: {
            ProductCategory: true,
          },
        },
      },
    },
  },
});

const relatedProducts = prisma.productCategory.findMany({
  where: {
    categoryId: "gg",
    NOT: {
      productId: "ff",
    },
  },
  include: {
    product: {
      include: {
        ProductCategory: true,
      },
    },
  },
});
