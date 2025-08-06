import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { DirectoryMap } from "@/types/tree-customization"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// JSON structure type for export
export type DirectoryNode = {
  type: "file" | "folder"
  name: string
  children?: DirectoryNode[]
}

// Convert Map structure to JSON-friendly format
export const convertMapToJson = (map: DirectoryMap): DirectoryNode[] => {
  const result: DirectoryNode[] = []

  for (const [name, value] of map.entries()) {
    if (value && typeof value === "object" && "type" in value && value.type === "file") {
      result.push({
        type: "file",
        name,
      })
    } else if (value instanceof Map) {
      result.push({
        type: "folder",
        name,
        children: convertMapToJson(value),
      })
    }
  }

  return result
}
