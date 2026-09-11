import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { MessMenuItem } from "@/types/mess";

export function MenuCard({ item }: { item: MessMenuItem }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">{item.meal_type}</CardTitle>
        <span className="text-xs text-slate-500">{item.timing}</span>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-4 text-xs space-y-1 text-slate-600">
          {item.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
