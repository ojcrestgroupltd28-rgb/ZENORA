import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get("reference");
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret) return NextResponse.json({ error: "Missing reference or payment configuration." }, { status: 400 });
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secret}` }, cache: "no-store"
    });
    const result = await response.json();
    if (!response.ok || !result.status) return NextResponse.json({ error: "Unable to verify transaction." }, { status: 502 });
    const transaction = result.data;
    const order = await prisma.order.findUnique({ where: { reference } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    // Amount and currency are checked against the server-created order; never trust the browser callback alone.
    if (transaction.status !== "success" || transaction.amount !== order.totalKobo || transaction.currency !== order.currency) {
      await prisma.order.update({ where: { reference }, data: { paymentStatus: "FAILED" } });
      return NextResponse.json({ verified: false, status: transaction.status }, { status: 400 });
    }
    await prisma.order.update({ where: { reference }, data: { paymentStatus: "SUCCESS", status: "PAID" } });
    return NextResponse.json({ verified: true, orderReference: reference, status: "PAID" });
  } catch {
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
