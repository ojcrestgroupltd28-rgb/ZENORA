import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1).max(50)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid email and at least one item." }, { status: 400 });
  try {
    const ids = [...new Set(parsed.data.items.map(i => i.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: ids }, active: true } });
    const byId = new Map(products.map(p => [p.id, p]));
    let subtotalKobo = 0;
    const orderItems = [];
    for (const item of parsed.data.items) {
      const product = byId.get(item.productId);
      if (!product) return NextResponse.json({ error: "A product is unavailable." }, { status: 409 });
      if (product.stock < item.quantity) return NextResponse.json({ error: `Insufficient stock for ${product.name}.` }, { status: 409 });
      subtotalKobo += product.priceKobo * item.quantity;
      orderItems.push({ productId: product.id, productName: product.name, unitPriceKobo: product.priceKobo, quantity: item.quantity });
    }
    // Flat illustrative delivery charge; replace with your delivery provider's server-side quote.
    const deliveryKobo = subtotalKobo >= 15000000 ? 0 : 150000;
    const totalKobo = subtotalKobo + deliveryKobo;
    const reference = `ZEN-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return NextResponse.json({ error: "Checkout is not configured. Add PAYSTACK_SECRET_KEY on the server." }, { status: 503 });
    const order = await prisma.order.create({
      data: { reference, email: parsed.data.email, subtotalKobo, deliveryKobo, totalKobo, paystackReference: reference, items: { create: orderItems } }
    });
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data.email, amount: totalKobo, currency: "NGN", reference, callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin}/checkout/complete` })
    });
    const data = await response.json();
    if (!response.ok || !data.status) {
      await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
      return NextResponse.json({ error: data.message ?? "Unable to initialize payment." }, { status: 502 });
    }
    return NextResponse.json({ authorizationUrl: data.data.authorization_url, reference });
  } catch {
    return NextResponse.json({ error: "Unable to create checkout. Please try again." }, { status: 500 });
  }
}
