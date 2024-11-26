// tailwindcss.d.ts
declare module 'tailwindcss' {
  export interface Config {
    darkMode?: string[];
    content?: string[];
    theme?: {
      extend?: Record<string, any>;
    };
    plugins?: any[];
  }
}

declare module 'tailwindcss/lib/util/flattenColorPalette' {
  const flattenColorPalette: (
    palette: Record<string, string>,
  ) => Record<string, string>;
  export = flattenColorPalette;
}
