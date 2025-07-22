"use client"

import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"

interface DiagramEditorProps {
  value: string
}

export function DiagramEditor({ value }: DiagramEditorProps) {
  const { theme } = useTheme()

  return (
    <Card className="flex-1 bg-muted/50 relative overflow-hidden">
      <pre className="p-4 text-sm font-mono">
        {value || "Your diagram will appear here..."}
      </pre>
    </Card>
  )
}