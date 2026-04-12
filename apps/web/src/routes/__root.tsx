import { TanStackDevtools } from "@tanstack/react-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { i18n } from "../lib/i18n";
import { applyThemeToDocument, readWebSettings } from "../lib/web-settings";

export const Route = createRootRoute({
	component: RootComponent,
});

function RootComponent() {
	useEffect(() => {
		const settings = readWebSettings();
		applyThemeToDocument(settings.theme);
		void i18n.changeLanguage(settings.language);
	}, []);

	return (
		<>
			<Outlet />
			<Toaster richColors={true} />
			<TanStackDevtools
				config={{
					position: "bottom-right",
				}}
				plugins={[
					{
						name: "Tanstack Router",
						render: <TanStackRouterDevtoolsPanel />,
					},
				]}
			/>
		</>
	);
}
