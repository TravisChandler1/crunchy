import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { reference } = await req.json();
  if (!reference) {
    return NextResponse.json({ error: "No reference supplied" }, { status: 400 });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "No Paystack secret key set" }, { status: 500 });
  }

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
  });

  const data = await verifyRes.json();

  if (data.status && data.data.status === "success") {
    // Payment is successful, you can do further processing here (e.g., save to DB)
    return NextResponse.json({ success: true, data: data.data });
  } else {
    return NextResponse.json({ success: false, data: data.data, message: data.message }, { status: 400 });
  }
} 