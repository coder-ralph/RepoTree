import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderTreeIcon, DownloadIcon, BookOpenIcon } from 'lucide-react';

interface AboutCardProps {
  icon: React.ElementType; // Define the icon type
  title: string;
  description: string;
}

const AboutCard = ({ icon: Icon, title, description }: AboutCardProps) => (
  <Card className="p-4 rounded-lg bg-blue-100 shadow-lg transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
    <CardHeader className="flex flex-col items-center space-y-4">
      <Icon className="w-24 h-24 sm:w-16 sm:h-16 text-blue-500" /> 
      <CardTitle className="font-semibold text-gray-800 text-lg sm:text-lg md:text-xl lg:text-xl">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-gray-600 text-center text-lg sm:text-base md:text-lg lg:text-md">{description}</p>
    </CardContent>
  </Card>
);

const About = () => {
  const features = [
    {
      icon: FolderTreeIcon,
      title: "Preview Structure",
      description: "Enter GitHub repo URL to preview structure.",
    },
    {
      icon: DownloadIcon,
      title: "Quick Download",
      description: "Download as README.md with one click.",
    },
    {
      icon: BookOpenIcon,
      title: "Effortless Documentation",
      description: "Simplify project documentation effortlessly.",
    },
  ];

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-center mb-4">
        Repo<span className="text-blue-600 font-bold">Tree</span>
      </h2>
      <p className="text-lg md:text-xl lg:text-2xl text-center mb-8">
        <span className="text-blue-600 font-bold">Generate, preview,</span> and <span className="text-blue-600 font-bold">download</span> repository structure in seconds.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <AboutCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </div>
  );
};

export default About;
