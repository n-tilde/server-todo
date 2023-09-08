"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import React, { useState, useRef, ReactNode, FormEvent, useEffect } from "react";
import { CheckedState } from "@radix-ui/react-checkbox";
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@/components/ui/context-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

type todo = {
  id: number;
  content: string;
  finished: number;
};

function TodoCardContextMenu({
  children,
  deleteHandler,
  setEditMode,
  setToggle,
}: {
  children: ReactNode;
  deleteHandler: () => void;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  setToggle: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-black text-white  text-">
        <ContextMenuItem onClick={() => setToggle(true)} className="text-white">
          Finish
        </ContextMenuItem>
        <ContextMenuItem onClick={() => setEditMode(true)} className="text-white">
          Edit
        </ContextMenuItem>
        <ContextMenuItem onClick={deleteHandler} className="text-red-800">
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function TodoCardEditForm({
  todo,
  setEditMode,
  className,
  refetch,
}: {
  todo: todo;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;
  className?: string;
  refetch: () => Promise<void>;
}) {
  const [input, setInput] = useState<string>(todo.content);
  const submitHandler = async (evt: FormEvent) => {
    evt.preventDefault();
    await fetch("/api/todos", {
      method: "PATCH",
      body: JSON.stringify({ id: todo.id, content: input }),
    });
    await refetch();
    setEditMode(false);
  };

  return (
    <form onSubmit={submitHandler} className={className}>
      <Input type="text" className="bg-black h-7" value={input} onChange={(e) => setInput(e.target.value)} />
    </form>
  );
}

function TodoCard({
  todo,
  refetch,
  setTodos,
}: {
  todo: todo;
  refetch: () => Promise<void>;
  setTodos: React.Dispatch<React.SetStateAction<todo[]>>;
  className?: string;
}) {
  const [toggled, setToggled] = useState<boolean>(Boolean(todo.finished));
  const [editMode, setEditMode] = useState<boolean>(false);

  const toggleTodoFinished = async (evt: CheckedState) => {
    setToggled(Boolean(evt));
    await fetch(`/api/todos`, {
      method: "PATCH",
      body: JSON.stringify({ id: todo.id, finished: evt }),
    });
    refetch();
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
    <TodoCardContextMenu setToggle={setToggled} setEditMode={setEditMode} deleteHandler={deleteTodo}>
      <Card className="w-full bg-black text-primary-foreground mb-2 min-h-16 snap-center">
        <CardContent className="flex flex-row p-4">
          <div className="flex justify-center align-center w-8 mr-2">
            <Checkbox className="m-auto" onCheckedChange={toggleTodoFinished} checked={toggled} />
          </div>
          <div className="w-full">
            <div className="w-full h-8 flex align-center">
              {editMode ? (
                <TodoCardEditForm refetch={refetch} todo={todo} setEditMode={setEditMode} className="my-auto w-full" />
              ) : (
                <p className="text-sm font-medium leading-none my-auto">{todo.content}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{String(todo.id).padStart(5, "0")}</p>
          </div>
        </CardContent>
      </Card>
    </TodoCardContextMenu>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<todo[]>([]);
  const [skeleton, setSkeleton] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchTodos();
  }, []);

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
    setSkeleton(false);
  };

  return (
    <main className="bg-black flex min-h-screen max-h-screen overflow-hidden flex-col items-center justify-between p-12">
      <div className="w-[350px]">
        <Card className="bg-black text-primary-foreground mb-2">
          <CardHeader>
            <Input placeholder="Task" type="text" ref={inputRef} className="bg-black" />
          </CardHeader>
          <CardFooter className="flex flex-row justify-between">
            <Button onClick={createTodo}>CREATE</Button>
            <Button onClick={fetchTodos}>FETCH</Button>
          </CardFooter>
        </Card>
        <ScrollArea className="h-96 snap-both snap-mandatory">
          {skeleton
            ? new Array(8)
                .fill(null)
                .map((_) => <Skeleton key={Math.random()} className="w-full mb-2 h-20 bg-zinc-800" />)
            : todos
                .sort((todo) => (todo.finished ? 1 : -1))
                .map((todo) => <TodoCard key={todo.id} todo={todo} refetch={fetchTodos} setTodos={setTodos} />)}
        </ScrollArea>
      </div>
    </main>
  );
}
