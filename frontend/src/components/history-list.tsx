function handleRemakeRequest(record: RequestHistory) {
	// TODO: Implement actual remake logic (e.g., call API or update form)
	// For now, just log the record
	console.log("Remake request:", record);
}
("use client");

import React from "react";
import useSWRInfinite from "swr/infinite";
import type { HistoryResponse, RequestHistory } from "../../types";
import { formatDate, pretty, downloadBase64 } from "../../utills";
import { Button } from "@/components/ui/button";

import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";

const fetcher = async (url: string): Promise<HistoryResponse> => {
	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch history: ${res.status}`);
	}
	return res.json();
};

type Props = {
	initialLimit?: number;
};

export default function HistoryList({ initialLimit = 10 }: Props) {
	const limit = initialLimit;
	const getKey = (
		pageIndex: number,
		previousPageData: HistoryResponse | null,
	) => {
		if (previousPageData && previousPageData.records.length === 0) return null;
		const page = pageIndex + 1;
		const apiUrl = import.meta.env.VITE_API_URL;
		if (!apiUrl) {
			throw new Error("VITE_API_URL is not defined in environment variables.");
		}
		return `${apiUrl}/api/history?page=${page}&limit=${limit}`;
	};

	const { data, error, size, setSize, isValidating, mutate } =
		useSWRInfinite<HistoryResponse>(getKey, fetcher, {
			revalidateOnFocus: false,
			revalidateFirstPage: false,
		});

	// Flatten records
	const pages = data || [];
	console.log("pahge", pages);
	const records = pages.flatMap((p) => p.records);
	const total = pages[0]?.total ?? 0;

	// Expanded state for details
	const [expanded, setExpanded] = React.useState<Set<number>>(new Set());

	function toggle(id: number) {
		setExpanded((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	const canLoadMore = records.length < total;
	const loadingMore =
		isValidating && size > 0 && data && typeof data[size - 1] === "undefined";

	return (
		<section>
			<Card>
				<CardHeader>
					<CardTitle>History</CardTitle>
					<CardDescription>Browse and expand past requests.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{error ? (
						<div className="text-sm text-destructive">
							Error loading history: {error.message}
						</div>
					) : null}
					{!data && !error ? (
						<div className="text-sm text-muted-foreground">Loading...</div>
					) : null}

					<div className="flex flex-col gap-3">
						{records.map((r: RequestHistory) => (
							<div key={r.id} className="rounded-lg border">
								<button
									type="button"
									onClick={() => toggle(r.id)}
									aria-expanded={expanded.has(r.id)}
									className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors"
								>
									<span className="truncate">
										<span className="font-medium">[{r.method}]</span> {r.url}
									</span>
									<span className="text-sm text-muted-foreground ml-4">
										status {r.status} — {formatDate(r.createdAt)}
									</span>
								</button>

								{expanded.has(r.id) ? (
									<div className="px-4 py-3 border-t">
										<div className="flex flex-col gap-4">
											<div>
												<div className="text-sm font-semibold mb-1">
													Request
												</div>
												<div className="text-sm">Method: {r.method}</div>
												<div className="text-sm">URL: {r.url}</div>
												<div className="mt-2">
													<div className="text-sm font-medium mb-1">
														Request Headers
													</div>
													<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
														{r.requestHeaders
															? pretty(r.requestHeaders)
															: "(none)"}
													</pre>
												</div>
												<div className="mt-2">
													<div className="text-sm font-medium mb-1">
														Request Body ({r.requestBodyType || "text"})
													</div>
													<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
														{r.requestBodyType === "json"
															? pretty(r.requestBody ?? "(none)")
															: (r.requestBody ?? "(none)")}
													</pre>
												</div>
											</div>

											<div>
												<div className="text-sm font-semibold mb-1">
													Response
												</div>
												<div className="text-sm">Status: {r.status}</div>
												<div className="mt-2">
													<div className="text-sm font-medium mb-1">
														Response Headers
													</div>
													<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
														{r.responseHeaders
															? pretty(r.responseHeaders)
															: "(none)"}
													</pre>
												</div>
												<div className="mt-2">
													<div className="text-sm font-medium mb-1">
														Response Body ({r.responseBodyType || "text"})
													</div>
													{r.responseBodyType === "binary" ? (
														<div className="flex items-center justify-between rounded-md border p-3">
															<div className="text-sm">
																binary data (base64)
															</div>
															<Button
																variant="outline"
																size="sm"
																onClick={() =>
																	downloadBase64(
																		r.responseBody || "",
																		"response.bin",
																		typeof r.responseHeaders === "object"
																			? (
																					r.responseHeaders as Record<
																						string,
																						string
																					>
																				)["content-type"] ||
																					(
																						r.responseHeaders as Record<
																							string,
																							string
																						>
																					)["Content-Type"] ||
																					""
																			: "",
																	)
																}
															>
																Download
															</Button>
														</div>
													) : r.responseBodyType === "json" ? (
														<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
															{pretty(r.responseBody ?? "(none)")}
														</pre>
													) : (
														<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
															{r.responseBody ?? "(none)"}
														</pre>
													)}
												</div>
												<div className="flex justify-end mt-2">
													<Button
														variant="secondary"
														size="sm"
														onClick={() => handleRemakeRequest(r)}
													>
														Remake Request
													</Button>
												</div>
											</div>
										</div>
									</div>
								) : null}
							</div>
						))}
					</div>

					<div className="flex items-center gap-3">
						<Button
							onClick={() => setSize(size + 1)}
							disabled={!canLoadMore || loadingMore}
							variant="default"
						>
							{canLoadMore
								? loadingMore
									? "Loading..."
									: "Load More"
								: "No more"}
						</Button>
						<Button
							onClick={() => mutate()}
							disabled={isValidating}
							variant="outline"
						>
							Refresh
						</Button>
						<div className="text-sm text-muted-foreground ml-auto">
							Showing {records.length} of {total}
						</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
