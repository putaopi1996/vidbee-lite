import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import packageJson from "./package.json";

const config = defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(packageJson.version),
	},
	plugins: [
		devtools({
			eventBusConfig: {
				enabled: false,
			},
		}),
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		Icons({
			compiler: "jsx",
			jsx: "react",
		}),
		tailwindcss(),
		TanStackRouterVite(),
		viteReact(),
	],
	server: {
		proxy: {
			"/events": {
				target: "http://localhost:3100",
				changeOrigin: true,
			},
			"/rpc": {
				target: "http://localhost:3100",
				changeOrigin: true,
			},
			"/images": {
				target: "http://localhost:3100",
				changeOrigin: true,
			},
		},
	},
});

export default config;
