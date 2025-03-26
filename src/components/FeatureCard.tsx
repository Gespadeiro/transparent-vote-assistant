
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
  onClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  index,
  onClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "neo-card group cursor-pointer hover:shadow-xl transform hover:-translate-y-1",
        onClick ? "cursor-pointer" : ""
      )}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="mb-4 text-election-blue bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 group-hover:text-election-blue transition-colors duration-300">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
