import { NextResponse } from "next/server";
import { prisma } from "./prisma";
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  const category = searchParams.get("category");
  const take = Math.min(Math.max(Number(searchParams.get("limit") ?? 24), 1), 100);
  try {
    const products = await prisma.product.findMany({
      where: {
        active: true,
        ...(q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { brand: { contains: q, mode: "insensitive" } }, { sku: { contains: q, mode: "insensitive" } }] } : {}),
        ...(category ? { category: { slug: category } } : {})
      },
      take, orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
    });
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Product service is not configured. Set DATABASE_URL and run Prisma setup." }, { status: 503 });
  }
}
