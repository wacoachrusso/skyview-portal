
import { ReactNode } from "react";
import { RocketIcon, AccuracyIcon, GlobeIcon, ClockIcon } from "./FeatureIcons";

export interface FeatureItem {
  iconSvg: ReactNode;
  title: string;
  description: string;
  details: string;
}

export const featuresData: FeatureItem[] = [
  {
    iconSvg: RocketIcon(),
    title: "Instant Answers",
    description: "Get immediate responses to your contract questions, 24/7",
    details: "Our next-generation technology processes your queries in real-time, providing accurate interpretations of complex contract clauses instantly."
  },
  {
    iconSvg: AccuracyIcon(),
    title: "High Accuracy",
    description: "Trained on your specific contract for precise interpretations",
    details: "Our advanced contract interpretation technology ensures responses are tailored to your exact situation and airline-specific agreements."
  },
  {
    iconSvg: GlobeIcon(),
    title: "Always Available",
    description: "Access from anywhere, on any device, whenever you need it",
    details: "Whether you're at home or on layover, get instant contract clarification with cutting-edge technology accessible from any device."
  },
  {
    iconSvg: ClockIcon(),
    title: "Time Saving",
    description: "Save hours searching through contract documents",
    details: "Stop spending hours reading through contract pages. Our next-generation interpretation system delivers the answers you need in seconds."
  }
];
