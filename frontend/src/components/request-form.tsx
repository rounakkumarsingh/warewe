"use client";

import React from "react";
import type { HttpMethod, RequestHistory, RequestPayload } from "../../types";
import { safeJSONParse } from "../../utills";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type Props = {
	onResult: (result: RequestHistory) => void;
	onHistoryRefresh?: () => void;
};

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "DELETE"];

export default function RequestForm({ onResult, onHistoryRefresh }: Props) {
	// Form state
	const [url, setUrl] = React.useState<string>("");
	const [method, setMethod] = React.useState<HttpMethod>("GET");
	const [headersText, setHeadersText] = React.useState<string>(
		'{\n  "Content-Type": "application/json"\n}',
	);
	const [bodyText, setBodyText] = React.useState<string>("");
	const [status, setStatus] = React.useState<string>("");
	const [headersError, setHeadersError] = React.useState<string | null>(null);
	const [bodyParseNote, setBodyParseNote] = React.useState<string | null>(null);
	const [loading, setLoading] = React.useState<boolean>(false);

	// Unique IDs for accessibility
	const headersId = React.useId();
	const bodyId = React.useId();
	const urlId = React.useId();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setStatus("");
		setHeadersError(null);
		setBodyParseNote(null);

		// Parse headers JSON (graceful errors)
		let headers: Record<string, string> | undefined;
		const trimmed = headersText.trim();
		if (trimmed.length) {
			const { value, error } = safeJSONParse<Record<string, string>>(trimmed);
			if (error) {
				setHeadersError(`Header JSON error: ${error}`);
				return;
			}
			headers = value;
		}

		// Prepare body: try JSON if headers indicate JSON and body looks like JSON
		let body: unknown;
		if (method !== "GET" && bodyText.trim().length > 0) {
			const contentType = (
				headers?.["Content-Type"] ||
				headers?.["content-type"] ||
				""
			).toLowerCase();
			const looksJson =
				bodyText.trim().startsWith("{") || bodyText.trim().startsWith("[");
			if (contentType.includes("application/json") && looksJson) {
				const parsed = safeJSONParse(bodyText);
				if (parsed.error) {
					// Graceful: send as text but leave a note
					setBodyParseNote(
						`Body is not valid JSON; sending as plain text. (${parsed.error})`,
					);
					body = bodyText;
				} else {
					body = parsed.value;
				}
			} else {
				body = bodyText;
			}
		}

		const payload: RequestPayload = { method, url, headers, body };

		setLoading(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!res.ok) {
				setStatus(`Request failed with status ${res.status}`);
				return;
			}
			const data = (await res.json()) as RequestHistory;
			onResult(data);
			setStatus(`Request sent. Status: ${data.status}`);
			// Optionally refresh history
			onHistoryRefresh?.();
		} catch (err) {
			setStatus(
				`Network error: ${err instanceof Error ? err.message : String(err)}`,
			);
		} finally {
			setLoading(false);
		}
	}

	return (
		<section>
			<Card>
				<CardHeader>
					<CardTitle>Request</CardTitle>
					<CardDescription>
						Choose a method, set headers/body, and send.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div className="flex items-center gap-3">
							<div className="min-w-32">
								<Select
									value={method}
									onValueChange={(v) => setMethod(v as HttpMethod)}
								>
									<SelectTrigger id={`${bodyId}-method`} className="w-32">
										<SelectValue placeholder="Method" />
									</SelectTrigger>
									<SelectContent>
										{METHODS.map((m) => (
											<SelectItem key={m} value={m}>
												{m}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Input
								id={urlId}
								type="text"
								value={url}
								onChange={(e) => setUrl(e.currentTarget.value)}
								placeholder="https://api.example.com/resource"
							/>
						</div>

						<div className="flex items-center">
							<Button type="submit" disabled={loading}>
								{loading ? "Sending..." : "Send"}
							</Button>
						</div>
						<div className="flex flex-col gap-2">
							<Label htmlFor={headersId}>Headers (JSON)</Label>
							<Textarea
								id={headersId}
								value={headersText}
								onChange={(e) => setHeadersText(e.currentTarget.value)}
								rows={6}
								placeholder='{"Content-Type": "application/json"}'
								className="font-mono"
							/>
							{headersError ? (
								<div className="text-sm text-destructive">
									Error: {headersError}
								</div>
							) : null}
						</div>

						<div className="flex flex-col gap-2">
							<Label htmlFor={bodyId}>Body (raw JSON/text/base64)</Label>
							<Textarea
								id={bodyId}
								value={bodyText}
								onChange={(e) => setBodyText(e.currentTarget.value)}
								rows={8}
								placeholder='{"name": "Ada"} or plain text or base64'
								className="font-mono"
							/>
							{bodyParseNote ? (
								<output className="text-sm text-muted-foreground">
									Note: {bodyParseNote}
								</output>
							) : null}
						</div>

						{status ? (
							<output className="text-sm text-muted-foreground">
								{status}
							</output>
						) : null}
					</form>
				</CardContent>
			</Card>
		</section>
	);
}
