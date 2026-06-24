import { NextRequest, NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase";
import { z } from "zod";

export async function GET(req: NextRequest) {
  const supabase = createUserClient(req);

    const { data: { user }, error: authorizationError } = await supabase.auth.getUser();

    if (authorizationError) {
        return NextResponse.json({ error: authorizationError.message }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ error: "User Not Logged In" }, { status: 401 });
    }

  const { data, error } = await supabase
    .from("notes")
    .select("id, group_id, body, author_id, created_at, updated_at");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: data });
}

//Input Validator
const CreateNoteSchema = z.object({
  group_id: z.string().uuid({ message: "group_id must be a valid UUID" }),
  body: z.string().min(1, { message: "body must not be empty" }),
});

export async function POST(req: NextRequest) {
  const supabase = createUserClient(req);

  const { data: { user }, error: authorizationError } = await supabase.auth.getUser();

  if (authorizationError) {
    return NextResponse.json({ error: authorizationError.message }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "User Not Logged In" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = CreateNoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("notes")
    .insert({
        group_id: parsed.data.group_id,
        body: parsed.data.body,
        author_id: user.id,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ note: 'Note has been created successfully' }, {status: 201});


}