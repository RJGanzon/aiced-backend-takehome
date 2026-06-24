import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { asUser, asOwner, pool, ALICE, BOB, CAROL, ACME, GLOBEX } from "./helpers";

beforeAll(async () => {
  // Clean slate, then seed one note per group
  await asOwner("delete from notes");
  await asOwner(
    "insert into notes (group_id, author_id, body) values ($1, $2, $3)",
    [ACME, ALICE, "Acme note"]
  );
  await asOwner(
    "insert into notes (group_id, author_id, body) values ($1, $2, $3)",
    [GLOBEX, BOB, "Globex note"]
  );
});

afterAll(async () => {
  await asOwner("delete from notes");
  await pool.end();
});

describe("notes", () => {
  it("alice sees only her own group's notes (Acme)", async () => {
    const rows = await asUser(ALICE, async (q) =>
      (await q("select * from notes")).rows
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].body).toBe("Acme note");
  });

  it("bob sees only his own group's notes (Globex)", async () => {
    const rows = await asUser(BOB, async (q) =>
      (await q("select * from notes")).rows
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].body).toBe("Globex note");
  });

  it("carol sees both groups' notes (she belongs to both)", async () => {
    const rows = await asUser(CAROL, async (q) =>
      (await q("select * from notes")).rows
    );
    expect(rows).toHaveLength(2);
  });

  it("bob cannot insert a note into Acme (not his group)", async () => {
    await asUser(BOB, async (q) => {
      await expect(
        q("insert into notes (group_id, author_id, body) values ($1, $2, $3)", [
          ACME, BOB, "Bob's sneaky note",
        ])
      ).rejects.toThrow();
    });
  });

  it("alice cannot insert a note into Globex (not her group)", async () => {
    await asUser(ALICE, async (q) => {
      await expect(
        q("insert into notes (group_id, author_id, body) values ($1, $2, $3)", [
          GLOBEX, ALICE, "Alice's sneaky note",
        ])
      ).rejects.toThrow();
    });
  });

  it("a user cannot impersonate another user on insert", async () => {
    await asUser(BOB, async (q) => {
      await expect(
        q("insert into notes (group_id, author_id, body) values ($1, $2, $3)", [
          GLOBEX, ALICE, "Bob pretending to be Alice",
        ])
      ).rejects.toThrow();
    });
  });
});