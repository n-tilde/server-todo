"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useRef, ReactNode } from "react";

type todo = {
  id: number;
  content: string;
  finished: number;
};

function TodoCard({ todo }: { todo: todo }) {
  return (
    <Card className="w-[350px] bg-black text-primary-foreground mb-2">
      <CardContent className="flex flex-row p-4">
        <div className="flex justify-center align-center w-8 mr-2">
          <Checkbox className="m-auto" />
        </div>
        <div>
          <p className="text-sm font-medium leading-none">{todo.content}</p>
          <p className="text-sm text-muted-foreground">
            {String(todo.id).padStart(5, "0")}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

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
    <main className="bg-black flex min-h-screen max-h-screen overflow-hidden flex-col items-center justify-between p-12">
      <div>
        <Card className="w-[350px] bg-black text-primary-foreground mb-2">
          <CardHeader>
            <Input
              placeholder="Task"
              type="text"
              ref={inputRef}
              className="bg-black"
            />
          </CardHeader>
          <CardFooter className="flex flex-row justify-between">
            <Button onClick={createTodo}>CREATE</Button>
            <Button onClick={fetchTodos}>FETCH</Button>
          </CardFooter>
        </Card>
        <div className="overflow-auto h-96">
          {todos.map((todo) => (
            <TodoCard todo={todo} />
          ))}
        </div>
      </div>
    </main>
  );
}
