import {
  defineConfig,
  presetUno,
  presetAttributify,
  presetWind, // ← 关键！提供完整的 Tailwind 类名支持
  presetIcons,
} from "unocss";

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
    presetWind(), // ✅ 启用完整 Tailwind 兼容（含色板、spacing、variants）
  ],
  theme: {
    colors: {
      primary: "#3b82f6",
      secondary: "#64748b",
    },
  },
  shortcuts: {
    btn: "px-4 py-2 rounded-lg font-medium transition-colors",
    "btn-primary": "btn bg-primary text-white hover:bg-blue-600",
    card: "p-6 rounded-xl shadow-lg border border-gray-200",
  },
});
