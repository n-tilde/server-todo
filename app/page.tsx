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
import React, { useState, useRef, ReactNode, FormEventHandler } from "react";
import { CheckedState } from "@radix-ui/react-checkbox";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

type todo = {
  id: number;
  content: string;
  finished: number;
};

function TodoCardContextMenu({
  children,
  deleteHandler,
}: {
  children: ReactNode;
  deleteHandler: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-black text-white  text-">
        <ContextMenuItem className="text-white">Finish</ContextMenuItem>
        <ContextMenuItem className="text-white">Edit</ContextMenuItem>
        <ContextMenuItem onClick={deleteHandler} className="text-red-800">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function TodoCard({
  todo,
  refetch,
  setTodos,
}: {
  todo: todo;
  refetch: () => void;
  setTodos: React.Dispatch<React.SetStateAction<todo[]>>;
}) {
  const [toggled, setToggled] = useState<boolean>(Boolean(todo.finished));

  const toggleTodoFinished = (evt: CheckedState) => {
    setToggled(Boolean(evt));
    fetch(`/api/todos`, {
      method: "PATCH",
      body: JSON.stringify({ id: todo.id, finished: evt }),
    });
  };

  const deleteTodo = async () => {
    setTodos((p) => p.filter((td) => td.id != todo.id));
    await fetch(`/api/todos`, {
      method: "DELETE",
      body: JSON.stringify({ id: todo.id }),
    });
    refetch();
  };

  return (
    <TodoCardContextMenu deleteHandler={deleteTodo}>
      <Card className="w-[350px] bg-black text-primary-foreground mb-2">
        <CardContent className="flex flex-row p-4">
          <div className="flex justify-center align-center w-8 mr-2">
            <Checkbox
              className="m-auto"
              onCheckedChange={toggleTodoFinished}
              checked={toggled}
            />
          </div>
          <div>
            <p className="text-sm font-medium leading-none">{todo.content}</p>
            <p className="text-sm text-muted-foreground">
              {String(todo.id).padStart(5, "0")}
            </p>
          </div>
        </CardContent>
      </Card>
    </TodoCardContextMenu>
  );
}

export default function Home() {
  console.log("✨ Evaluating");
  const [todos, setTodos] = useState<todo[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const createTodo = async () => {
    if (!inputRef.current) return;
    const payload = { content: inputRef.current.value };

    const placeholder: todo = {
      content: String(inputRef.current?.value),
      id: 0,
      finished: 0,
    };
    setTodos((p) => [...p, placeholder]);
    inputRef.current.value = "";
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
            <TodoCard todo={todo} refetch={fetchTodos} setTodos={setTodos} />
          ))}
        </div>
      </div>
    </main>
  );
}
