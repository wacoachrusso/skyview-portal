import Navbar from "@/components/navbar/Navbar";
import { Footer } from "@/components/landing/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          <div className="prose prose-invert mx-auto">
            <p className="text-lg">
              SkyGuide was founded by Mike Russo and his wife, Yorlenny, to help aviation professionals navigate their union contracts with clarity and ease. With Mike's experience as a long-time flight attendant and union member, SkyGuide was created to address the frustrations of accessing accurate information when it's needed most.
            </p>
            <p className="text-lg">
              Our mission is simple: to empower flight attendants and pilots by making complex workplace agreements easier to understand, so you can focus on your career with confidence.
            </p>
            <p className="text-lg font-semibold">
              SkyGuide: Built by aviation professionals, for aviation professionals.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}