"use client";

import { store } from "@/lib/store";
import { useCallback, useRef, useState } from "react";
import { DownloadIcon } from "./icons";
import { OverlayPanel } from "./ui/overlay-panel";
import { PixelButton } from "./ui/pixel-button";

export function ZoneSharePanel({
	open,
	onClose,
}: { open: boolean; onClose: () => void }) {
	const [importText, setImportText] = useState("");
	const [status, setStatus] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const fileRef = useRef<HTMLInputElement>(null);

	const showStatus = useCallback((message: string) => {
		setError(null);
		setStatus(message);
		setTimeout(() => setStatus(null), 2500);
	}, []);

	const handleExportJson = useCallback(() => {
		const data = store.exportJson();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `zones-world-clock-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
		showStatus("JSON file downloaded.");
	}, [showStatus]);

	const handleCopyShareLink = useCallback(async () => {
		const url = store.getShareUrl();
		try {
			await navigator.clipboard.writeText(url);
			showStatus("Share link copied to clipboard.");
		} catch {
			setStatus(null);
			setError("Could not copy to clipboard. Try exporting JSON instead.");
		}
	}, [showStatus]);

	const handleImport = useCallback(() => {
		const result = store.importJson(importText);
		if (!result.ok) {
			setStatus(null);
			setError(result.error);
			return;
		}
		setImportText("");
		setError(null);
		showStatus("Time zone set imported.");
		onClose();
	}, [importText, onClose, showStatus]);

	const handleFileChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const file = e.target.files?.[0];
			if (!file) return;
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === "string") {
					setImportText(reader.result);
					setError(null);
				}
			};
			reader.readAsText(file);
			e.target.value = "";
		},
		[],
	);

	return (
		<OverlayPanel
			open={open}
			onClose={onClose}
			title="Export & Import"
			width="md"
		>
			<div className="p-4 sm:p-5 space-y-4">
				<div className="space-y-2">
					<p className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
						Export your current time zone set
					</p>
					<div className="flex flex-wrap gap-2">
						<PixelButton
							variant="outline"
							size="sm"
							icon={<DownloadIcon size={12} />}
							onClick={handleExportJson}
						>
							Download JSON
						</PixelButton>
						<PixelButton
							variant="outline"
							size="sm"
							onClick={handleCopyShareLink}
						>
							Copy share link
						</PixelButton>
					</div>
				</div>

				<div className="border-t border-(--color-border) pt-4 space-y-2">
					<p className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
						Import a time zone set
					</p>
					<textarea
						value={importText}
						onChange={(e) => {
							setImportText(e.target.value);
							setError(null);
						}}
						placeholder="Paste JSON or a share link here…"
						rows={4}
						className="w-full font-mono text-[11px] p-3 border-2 border-(--color-border) bg-(--color-surface) text-(--color-foreground) placeholder:text-(--color-muted-foreground) outline-none resize-none"
					/>
					<div className="flex flex-wrap items-center gap-2">
						<PixelButton variant="primary" size="sm" onClick={handleImport}>
							Import
						</PixelButton>
						<PixelButton
							variant="outline"
							size="sm"
							onClick={() => fileRef.current?.click()}
						>
							Choose file
						</PixelButton>
						<input
							ref={fileRef}
							type="file"
							accept="application/json,.json"
							className="hidden"
							onChange={handleFileChange}
						/>
					</div>
				</div>

				{status && (
					<p className="font-mono text-[9px] text-(--color-delta-positive)">
						{status}
					</p>
				)}
				{error && (
					<p className="font-mono text-[9px] text-(--color-delta-negative)">
						{error}
					</p>
				)}
			</div>
		</OverlayPanel>
	);
}
