import { NextResponse } from "next/server";
import { listProducts } from "@/lib/catalog";

export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",").map(Number).filter((n) => n > 0).slice(0, 60);
  if (!ids.length) return NextResponse.json([]);
  return NextResponse.json(await listProducts({ ids, limit: 60 }));
}
