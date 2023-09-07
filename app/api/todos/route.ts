import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { NextRequest } from "next/server";

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export const GET = async () => {
  if (!db) {
    db = await open({
      filename: "./db/database.db",
      driver: sqlite3.Database,
    });
  }

  const todos = await db.all("SELECT * FROM todos");

  return new Response(JSON.stringify(todos), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
};

export const POST = async (req: NextRequest) => {
  if (!db) {
    db = await open({
      filename: "./db/database.db",
      driver: sqlite3.Database,
    });
  }
  const body = await req.json();

  const insertTodoQuery = `
    INSERT INTO todos (content, finished) VALUES (?, 0)
  `;

  db.run(insertTodoQuery, [body.content], function (err: Error) {
    if (err) {
      console.log("Error creating todo", err);
      return new Response(null, { status: 400 });
    }
  });

  return new Response("OK", { status: 200 });
};
