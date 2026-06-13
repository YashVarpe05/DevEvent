import Navbar from "@/components/Navbar";
import Footer from "@/app/sections/Footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	);
}
