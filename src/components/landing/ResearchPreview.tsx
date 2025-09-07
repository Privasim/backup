import Section from './system/Section';
import SectionHeading from './system/SectionHeading';
import JobLossVizClient from './JobLossVizClient';

export default function ResearchPreview() {
  return (
    <Section id="research" ariaLabel="Global AI Job Loss Visualization">
      <SectionHeading eyebrow="Data-backed insights">Global Job Impact</SectionHeading>
      <div className="px-0">
        <JobLossVizClient />
      </div>
    </Section>
  );
}
