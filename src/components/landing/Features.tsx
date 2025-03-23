
import { SectionContainer } from "./common/SectionContainer";
import { FeatureList } from "./features/FeatureList";

export function Features() {
  return (
    <SectionContainer
      title="Why Choose SkyGuide?"
      subtitle="Get instant, accurate answers to your contract questions with our advanced AI technology."
      className="bg-feature-gradient"
    >
      <FeatureList />
    </SectionContainer>
  );
}
