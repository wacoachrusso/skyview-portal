
import { SectionContainer } from "./common/SectionContainer";
import { TestimonialList } from "./testimonials/TestimonialList";

export function Testimonials() {
  return (
    <SectionContainer
      title="What Aviation Professionals Say"
      subtitle="Trusted by pilots and flight attendants across major airlines"
      className="bg-testimonial-gradient"
    >
      <TestimonialList />
    </SectionContainer>
  );
}
