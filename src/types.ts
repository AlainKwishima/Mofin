export interface Feature {
  id: string;
  iconName: string;
  title: string;
  description: string;
  tag: string;
}

export interface Step {
  number: string;
  title: string;
  description: string;
}

export interface InstallStep {
  number: number;
  title: string;
  description: string;
}

export interface VersionRelease {
  version: string;
  label: string;
  isLatest?: boolean;
  date: string;
  features: string[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}
