import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const url = new URL(req.url);
  const withUserId = url.searchParams.get("userId");

  try {
    if (user.role === "admin") {
      if (withUserId) {
        // Fetch customer messages
        const { data: customerMsgs, error: e1 } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_id", withUserId)
          .eq("sender_role", "customer")
          .order("created_at", { ascending: true });

        if (e1) { console.error("messages fetch error:", e1); return NextResponse.json([], { status: 200 }); }

        // Fetch admin replies to this customer
        const { data: adminMsgs, error: e2 } = await supabase
          .from("messages")
          .select("*")
          .eq("sender_role", "admin")
          .eq("recipient_id", withUserId)
          .order("created_at", { ascending: true });

        if (e2) { console.error("admin messages fetch error:", e2); return NextResponse.json(customerMsgs ?? [], { status: 200 }); }

        // Merge and sort
        const all = [...(customerMsgs ?? []), ...(adminMsgs ?? [])];
        all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        return NextResponse.json(all);
      }

      // Admin fetching all — return all customer messages only (for thread list)
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_role", "customer")
        .order("created_at", { ascending: false });

      if (error) { console.error("all messages error:", error); return NextResponse.json([], { status: 200 }); }
      return NextResponse.json(data ?? []);

    } else {
      // Customer: fetch their own messages
      const { data: myMsgs, error: e1 } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_id", user.id)
        .eq("sender_role", "customer")
        .order("created_at", { ascending: true });

      if (e1) { console.error("customer messages error:", e1); return NextResponse.json([], { status: 200 }); }

      // Fetch admin replies to this customer
      const { data: adminReplies, error: e2 } = await supabase
        .from("messages")
        .select("*")
        .eq("sender_role", "admin")
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: true });

      if (e2) { console.error("admin replies error:", e2); return NextResponse.json(myMsgs ?? [], { status: 200 }); }

      const all = [...(myMsgs ?? []), ...(adminReplies ?? [])];
      all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      return NextResponse.json(all);
    }
  } catch (err) {
    console.error("messages GET error:", err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  const user = token ? verifyToken(token) : null;
  if (!user) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  try {
    const { message, recipientId } = await req.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

    if (user.role === "admin" && !recipientId) {
      return NextResponse.json({ error: "Recipient is required." }, { status: 400 });
    }

    const { data, error } = await supabase.from("messages").insert({
      sender_id: user.id,
      sender_name: user.firstName,
      sender_role: user.role,
      message: message.trim(),
      recipient_id: user.role === "admin" ? recipientId : null,
    }).select().single();

    if (error) {
      console.error("message insert error:", error);
      return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("messages POST error:", err);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
