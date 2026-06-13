"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, AlertCircle } from "lucide-react";

type CameraScannerProps = {
	onScan: (code: string) => void;
	disabled?: boolean;
};

type BarcodeDetectorLike = {
	detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

// Camera-based QR scanner using the BarcodeDetector API.
// Chromium-based browsers (Chrome, Edge, Brave, Samsung Internet) support it
// natively. Safari/Firefox users still have the typed-code fallback above
// this component on the check-in page.
//
// Behavior:
// - Off by default to save battery; user taps to enable.
// - Once enabled, polls for QR codes ~4x/sec.
// - On a successful scan, calls onScan, briefly cools down (1.2s) to avoid
//   re-scanning the same ticket while it's still in frame.
const SCAN_INTERVAL_MS = 250;
const COOLDOWN_MS = 1200;

export default function CameraScanner({ onScan, disabled = false }: CameraScannerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const detectorRef = useRef<BarcodeDetectorLike | null>(null);
	const scanTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const cooldownUntilRef = useRef<number>(0);

	const [active, setActive] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [supported, setSupported] = useState(true);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const BarcodeDetectorCtor = (window as unknown as {
			BarcodeDetector?: new (options: { formats: string[] }) => BarcodeDetectorLike;
		}).BarcodeDetector;
		if (!BarcodeDetectorCtor) {
			setSupported(false);
			return;
		}
		try {
			detectorRef.current = new BarcodeDetectorCtor({ formats: ["qr_code"] });
		} catch {
			setSupported(false);
		}
	}, []);

	const stopCamera = () => {
		if (scanTimerRef.current) {
			clearInterval(scanTimerRef.current);
			scanTimerRef.current = null;
		}
		if (streamRef.current) {
			streamRef.current.getTracks().forEach((track) => track.stop());
			streamRef.current = null;
		}
		setActive(false);
	};

	useEffect(() => stopCamera, []);

	const startCamera = async () => {
		setError(null);
		if (!detectorRef.current) {
			setError("Camera scanning isn't supported in this browser. Use the typed input.");
			return;
		}
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: { ideal: "environment" } },
				audio: false,
			});
			streamRef.current = stream;
			if (videoRef.current) {
				videoRef.current.srcObject = stream;
				await videoRef.current.play();
			}
			setActive(true);

			scanTimerRef.current = setInterval(async () => {
				if (!videoRef.current || !detectorRef.current || disabled) return;
				if (Date.now() < cooldownUntilRef.current) return;
				try {
					const codes = await detectorRef.current.detect(videoRef.current);
					if (codes.length > 0) {
						const value = codes[0].rawValue.trim();
						if (value) {
							cooldownUntilRef.current = Date.now() + COOLDOWN_MS;
							onScan(value);
						}
					}
				} catch {
					// Detection errors are transient (frame not ready, etc.) — keep going.
				}
			}, SCAN_INTERVAL_MS);
		} catch (err: unknown) {
			setError(
				err instanceof Error && err.name === "NotAllowedError"
					? "Camera permission denied. Grant access in your browser settings."
					: "Couldn't open the camera. Use the typed input or try another device.",
			);
			stopCamera();
		}
	};

	if (!supported) {
		return (
			<div
				style={{
					background: "var(--bg-surface)",
					border: "1px dashed var(--border-dim)",
					borderRadius: "var(--radius-lg)",
					padding: "16px",
					textAlign: "center",
					fontSize: "13px",
					color: "var(--text-muted)",
					display: "flex",
					alignItems: "center",
					gap: "10px",
					justifyContent: "center",
				}}
			>
				<AlertCircle className="w-4 h-4" />
				Camera scanning isn&apos;t supported in this browser. Try Chrome on Android, or use the typed input.
			</div>
		);
	}

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
					disabled={disabled}
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
						cursor: disabled ? "not-allowed" : "pointer",
						opacity: disabled ? 0.5 : 1,
					}}
				>
					{active ? <><CameraOff className="w-3.5 h-3.5" /> Stop</> : <><Camera className="w-3.5 h-3.5" /> Start camera</>}
				</button>
			</div>

			{active && (
				<div style={{ position: "relative", borderRadius: "var(--radius-md)", overflow: "hidden", background: "#000", aspectRatio: "4 / 3" }}>
					<video
						ref={videoRef}
						playsInline
						muted
						style={{ width: "100%", height: "100%", objectFit: "cover" }}
					/>
					{/* Centered framing reticle */}
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
			)}

			{error && (
				<p style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--red)", margin: 0 }}>
					<AlertCircle className="w-4 h-4" /> {error}
				</p>
			)}
		</div>
	);
}
