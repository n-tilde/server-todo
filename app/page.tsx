"use client";

import React, { useState, useRef } from "react";

type todo = {
  id: number;
  content: string;
  finished: number;
};

export default function Home() {
  console.log("✨ Evaluating");
  const [todos, setTodos] = useState<todo[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const createTodo = async () => {
    if (!inputRef.current) return;
    const payload = { content: inputRef.current.value };
    await fetch("/api/todos", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    fetchTodos();
  };

  const fetchTodos = async () => {
    const res = await fetch("/api/todos", { method: "GET" });
    const todos = await res.json();
    setTodos(todos);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <button onClick={createTodo}>CREATE</button>
      <button onClick={fetchTodos}>FETCH</button>
      <input type="text" ref={inputRef} />
      <div>
        {todos.map((todo) => {
          return <p>{JSON.stringify(todo)}</p>;
        })}
      </div>
    </main>
  );
}
