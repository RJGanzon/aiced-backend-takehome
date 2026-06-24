# NOTES.md

## RLS Approach

I added two RLS policies on the notes table as per the requirements: 'members can only see their group notes' for SELECT and 'user can only create note for their group' for INSERT. Both policies use a subquery against the memberships table keyed on auth.uid() so tenant isolation is enforced at the database level, not in application code. The INSERT policy also includes an author_id = auth.uid() check to prevent a user from impersonating another user when creating a note. This pattern is straightforward and something I'm already familiar with since I've used RLS on my current work.

## AI Usage

For the GET and POST routes I did not use any AI tool as I'm already familiar with Next.js API routes and Supabase. The only thing new to me was Zod since it's my first time encountering it, so I used Claude (claude.ai) to understand how it works and how to use safeParse and flatten the field errors. I also used Claude to help scaffold the test file since the harness was unfamiliar, but I made sure I understood everything, double checked the logic, and verified it against the helpers before running it. All 7 tests passed.
