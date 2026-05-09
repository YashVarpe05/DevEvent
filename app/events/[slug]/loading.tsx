import React from "react";
import { Loader2 } from "lucide-react";

const Loading = () => {
	return (
		<div
			className="w-full min-h-screen flex items-center justify-center"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			<Loader2 className="animate-spin" size={48} color="var(--gold)" />
		</div>
	);
};

export default Loading;
