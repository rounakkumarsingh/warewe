"use client";
import type { RequestHistory } from "../../types";
import { pretty, downloadBase64 } from "../../utills";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
	record?: RequestHistory | null;
	title?: string;
};

export default function ResponseViewer({ record, title = "Response" }: Props) {
	if (!record) {
		return (
			<section>
				<Card>
					<CardHeader>
						<CardTitle>{title}</CardTitle>
						<CardDescription>No response yet.</CardDescription>
					</CardHeader>
				</Card>
			</section>
		);
	}

	const responseHeadersText =
		record.responseHeaders != null
			? pretty(record.responseHeaders)
			: "(no headers)";

	const bodyType = record.responseBodyType || "text";
	const contentTypeHeader =
		(typeof record.responseHeaders === "object" &&
			record.responseHeaders &&
			((record.responseHeaders as any)["content-type"] ||
				(record.responseHeaders as any)["Content-Type"])) ||
		"";

	function renderBody() {
		if (record?.responseBody == null)
			return (
				<pre className="bg-muted p-3 rounded-md text-sm font-mono">
					(no body)
				</pre>
			);

		if (bodyType === "json") {
			try {
				return (
					<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
						{pretty(record.responseBody)}
					</pre>
				);
			} catch {
				return (
					<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
						{pretty(record.responseBody)}
					</pre>
				);
			}
		} else if (bodyType === "html") {
			// Render HTML visually. In production, sanitize HTML to avoid XSS.
			return (
				<div
					className="bg-muted p-3 rounded-md overflow-auto"
					style={{ minHeight: "100px" }}
					dangerouslySetInnerHTML={{ __html: record.responseBody }}
				/>
			);
		} else if (bodyType === "text") {
			return (
				<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
					{record.responseBody}
				</pre>
			);
		} else if (bodyType === "binary") {
			return (
				<div className="flex items-center justify-between rounded-md border p-3">
					<div className="text-sm">binary data (base64)</div>
					<Button
						variant="outline"
						size="sm"
						onClick={() =>
							downloadBase64(
								record.responseBody as string,
								"response.bin",
								String(contentTypeHeader),
							)
						}
					>
						Download
					</Button>
				</div>
			);
		}
		return (
			<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
				{record.responseBody}
			</pre>
		);
	}

	return (
		<section>
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					<CardDescription className="flex items-center gap-2">
						Status: <span className="font-medium">{record.status}</span>
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<div>
						<div className="text-sm font-medium mb-2">Response Headers</div>
						<pre className="bg-muted p-3 rounded-md overflow-auto text-sm font-mono">
							{responseHeadersText}
						</pre>
					</div>
					<div>
						<div className="text-sm font-medium mb-2">Response Body</div>
						<div className="rounded-md overflow-hidden">{renderBody()}</div>
					</div>
				</CardContent>
			</Card>
		</section>
	);
}
