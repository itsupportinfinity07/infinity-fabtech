import React from "react";
import Hero from "@/components/home/Hero";
import CompanyOverview from "@/components/home/CompanyOverview";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import ServicesOverview from "@/components/home/ServicesOverview";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import ProjectsOverview from "@/components/home/ProjectsOverview";
import ManufacturingExcellence from "@/components/home/ManufacturingExcellence";
import ProductApplications from "@/components/home/ProductApplications";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import RequestQuoteCTA from "@/components/home/RequestQuoteCTA";
import RoofExplorer from "@/components/home/RoofExplorer";
import Frames3DTeaser from "@/components/home/Frames3DTeaser";
import { getFeaturedProjects } from "@/lib/content";
import { getTestimonials } from "@/lib/content/site";
import { descriptionToText } from "@/lib/richtext";

export default async function Home() {
  const testimonials = await getTestimonials();
  const featured = (await getFeaturedProjects(2)).map((p) => ({ ...p, description: descriptionToText(p.description) }));
  return (
    <>
      <Hero />
      <CompanyOverview />
      <RoofExplorer />
      <Frames3DTeaser />
      <FeaturedProducts />
      <ServicesOverview />
      <WhyChooseUs />
      <ProjectsOverview projects={featured} />
      <ManufacturingExcellence />
      <ProductApplications />
      {testimonials.length > 0 && <TestimonialsSection />}
      <RequestQuoteCTA />
    </>
  );
}

