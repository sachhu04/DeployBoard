"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNamespaces } from "@/lib/hooks/use-namespaces";
import { useNamespaceContext } from "./namespace-context";
import { Layers } from "lucide-react";

export function NamespaceSwitcher() {
  const { namespace, setNamespace } = useNamespaceContext();
  const { data: namespaces } = useNamespaces();

  const nsList = namespaces || [
    { name: "default", status: "Active", age: "" },
    { name: "production", status: "Active", age: "" },
    { name: "staging", status: "Active", age: "" },
    { name: "monitoring", status: "Active", age: "" },
    { name: "kube-system", status: "Active", age: "" },
  ];

  return (
    <Select value={namespace} onValueChange={(v) => v && setNamespace(v)}>
      <SelectTrigger className="w-[180px] h-9 text-sm bg-white/[0.04] border-white/[0.08]">
        <div className="flex items-center gap-2">
          <Layers className="h-3.5 w-3.5 text-muted-foreground" />
          <SelectValue placeholder="Namespace" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {nsList.map((ns) => (
          <SelectItem key={ns.name} value={ns.name}>
            {ns.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
