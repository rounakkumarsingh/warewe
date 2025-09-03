"use client";

import React from "react";
import RequestForm from "./request-form";
import ResponseViewer from "./response-viewer";
import HistoryList from "./history-list";
import type { RequestHistory } from "../../types";

export default function PostmanApp() {
	const [lastResult, setLastResult] = React.useState<RequestHistory | null>(
		null,
	);

	return (
		<main className="max-w-6xl mx-auto p-6 md:py-10">
			<header className="mb-6">
				<h1 className="text-3xl font-semibold tracking-tight">Postman Lite</h1>
				<p className="text-sm text-muted-foreground mt-1">
					Build requests, inspect responses, and browse your history.
				</p>
			</header>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="flex flex-col gap-6 lg:col-span-2">
					<RequestForm
						onResult={(r) => setLastResult(r)}
						onHistoryRefresh={() => {
							/* history component has a Refresh button */
						}}
					/>
					<ResponseViewer record={lastResult} title="Latest Response" />
				</div>

				<div className="flex flex-col gap-6">
					<HistoryList initialLimit={10} />
				</div>
			</div>
		</main>
	);
}
