"use client";

import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

type CameraScannerProps = {
	onScan: (code: string) => void;
	disabled?: boolean;
};

// Camera-based QR scanner built on @zxing/browser, which decodes in pure JS
// and therefore works across all modern browsers — including iOS Safari and
// Firefox, where the native BarcodeDetector API is unavailable.
//
// Behavior:
// - Off by default to save battery; user taps to enable.
// - Prefers the rear ("environment") camera on phones.
// - On a successful scan, calls onScan, then cools down (1.2s) so the same
//   ticket isn't re-submitted while it's still in frame.
const COOLDOWN_MS = 1200;

export default function CameraScanner({ onScan, disabled = false }: CameraScannerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const controlsRef = useRef<IScannerControls | null>(null);
	const cooldownUntilRef = useRef<number>(0);
	const onScanRef = useRef(onScan);
	const disabledRef = useRef(disabled);

	const [active, setActive] = useState(false);
	const [starting, setStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Keep the latest callbacks/flags without restarting the camera
	useEffect(() => { onScanRef.current = onScan; }, [onScan]);
	useEffect(() => { disabledRef.current = disabled; }, [disabled]);

	const stopCamera = () => {
		if (controlsRef.current) {
			controlsRef.current.stop();
			controlsRef.current = null;
		}
		setActive(false);
	};

	useEffect(() => stopCamera, []);

	const startCamera = async () => {
		setError(null);
		setStarting(true);
		try {
			const reader = new BrowserQRCodeReader();
			const controls = await reader.decodeFromConstraints(
				{ video: { facingMode: { ideal: "environment" } }, audio: false },
				videoRef.current!,
				(result) => {
					if (!result || disabledRef.current) return;
					if (Date.now() < cooldownUntilRef.current) return;
					const value = result.getText().trim();
					if (value) {
						cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
						onScanRef.current(value);
					}
				},
			);
			controlsRef.current = controls;
			setActive(true);
		} catch (err: unknown) {
			setError(
				err instanceof Error && err.name === "NotAllowedError"
					? "Camera permission denied. Grant access in your browser settings."
					: "Couldn't open the camera. Use the typed input or try another device.",
			);
			stopCamera();
		} finally {
			setStarting(false);
		}
	};

	return (
		<div
			style={{
				background: "var(--bg-surface)",
				border: "1px solid var(--border-dim)",
				borderRadius: "var(--radius-lg)",
				padding: "16px",
				display: "flex",
				flexDirection: "column",
				gap: "12px",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
					<Camera className="w-4 h-4" style={{ color: "var(--gold)" }} />
					Camera scanner
					{active && (
						<span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
							• Live
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={active ? stopCamera : startCamera}
					disabled={disabled || starting}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "6px",
						background: active ? "transparent" : "var(--gold)",
						color: active ? "var(--text-secondary)" : "#000",
						border: active ? "1px solid var(--border-dim)" : "none",
						padding: "6px 14px",
						borderRadius: "var(--radius-md)",
						fontWeight: 600,
						fontSize: "13px",
						cursor: disabled || starting ? "not-allowed" : "pointer",
						opacity: disabled || starting ? 0.5 : 1,
					}}
				>
					{active ? (
						<><CameraOff className="w-3.5 h-3.5" /> Stop</>
					) : (
						<><Camera className="w-3.5 h-3.5" /> {starting ? "Starting…" : "Start camera"}</>
					)}
				</button>
			</div>

			{/* Video stays mounted so the ref exists when decoding starts */}
			<div
				style={{
					position: "relative",
					borderRadius: "var(--radius-md)",
					overflow: "hidden",
					background: "#000",
					aspectRatio: "4 / 3",
					display: active ? "block" : "none",
				}}
			>
				<video
					ref={videoRef}
					playsInline
					muted
					style={{ width: "100%", height: "100%", objectFit: "cover" }}
				/>
				<div
					style={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: "60%",
						aspectRatio: "1",
						border: "2px solid rgba(255, 107, 53, 0.85)",
						borderRadius: "16px",
						pointerEvents: "none",
						boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)",
					}}
				/>
			</div>

			{error && (
				<p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--red)", margin: 0 }}>
					<AlertCircle className="w-4 h-4" /> {error}
				</p>
			)}
		</div>
	);
}
