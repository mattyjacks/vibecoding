import { NextResponse } from "next/server";
// Phase 1 browser-local demo. Supabase helpers are retained for Phase 2.
export function proxy() { return NextResponse.next(); }
