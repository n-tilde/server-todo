import sqlite3 from "sqlite3";

export const bootstrapDb = async () => {
  console.log("💷 Bootstrapping DB");

  const db = new sqlite3.Database("./db/database.db");

  const createTodosTable = `
    CREATE TABLE IF NOT EXISTS todos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      finished INTEGER
    )
  `;

  try {
    await new Promise((resolve, reject) => {
      db.run(createTodosTable, (err: Error) => {
        err ? reject(err) : resolve({});
      });
    });
  } catch (err: any) {
    console.log("Error creating table:", err);
  } finally {
    db.close();
  }
};

bootstrapDb();
