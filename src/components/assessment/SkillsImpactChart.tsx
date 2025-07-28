'use client';

import { useState, useEffect } from 'react';

interface SkillImpact {
  skill: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  futureRelevance: number;
  description: string;
}

interface SkillsImpactChartProps {
  skills: string[];
  animated?: boolean;
}

export default function SkillsImpactChart({ skills, animated = true }: SkillsImpactChartProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [animated]);

  // Mock skill impact analysis - in real implementation, this would come from LLM analysis
  const generateSkillImpact = (skill: string): SkillImpact => {
    const techSkills = ['JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'API Development'];
    const softSkills = ['Communication', 'Leadership', 'Problem Solving', 'Critical Thinking'];
    const designSkills = ['UI Design', 'UX Design', 'Figma', 'Adobe XD'];
    
    let riskLevel: 'Low' | 'Medium' | 'High';
    let futureRelevance: number;
    let description: string;

    if (techSkills.some(tech => skill.toLowerCase().includes(tech.toLowerCase()))) {
      riskLevel = 'Low';
      futureRelevance = 85 + Math.random() * 10;
      description = 'High demand, evolving with AI integration';
    } else if (softSkills.some(soft => skill.toLowerCase().includes(soft.toLowerCase()))) {
      riskLevel = 'Low';
      futureRelevance = 90 + Math.random() * 8;
      description = 'Essential human skills, AI-resistant';
    } else if (designSkills.some(design => skill.toLowerCase().includes(design.toLowerCase()))) {
      riskLevel = 'Medium';
      futureRelevance = 70 + Math.random() * 15;
      description = 'Creative aspects safe, tools evolving';
    } else {
      riskLevel = Math.random() > 0.6 ? 'Low' : Math.random() > 0.3 ? 'Medium' : 'High';
      futureRelevance = riskLevel === 'Low' ? 80 + Math.random() * 15 : 
                      riskLevel === 'Medium' ? 50 + Math.random() * 25 : 
                      30 + Math.random() * 20;
      description = 'Skill assessment based on current market trends';
    }

    return { skill, riskLevel, futureRelevance, description };
  };

  const skillsData = skills.map(generateSkillImpact);

  const getRiskColor = (riskLevel: 'Low' | 'Medium' | 'High') => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'text-green-600';
    if (relevance >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskIcon = (riskLevel: 'Low' | 'Medium' | 'High') => {
    switch (riskLevel) {
      case 'Low': return '🛡️';
      case 'Medium': return '⚠️';
      case 'High': return '🚨';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {skillsData.map((skillData, index) => (
          <div
            key={skillData.skill}
            className={`p-4 bg-white border rounded-lg transition-all duration-500 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{skillData.skill}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getRiskColor(skillData.riskLevel)}`}>
                    {getRiskIcon(skillData.riskLevel)} {skillData.riskLevel} Risk
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{skillData.description}</p>
                
                {/* Future Relevance Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-700">Future Relevance</span>
                    <span className={`text-sm font-bold ${getRelevanceColor(skillData.futureRelevance)}`}>
                      {Math.round(skillData.futureRelevance)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                        skillData.futureRelevance >= 80 ? 'bg-green-500' :
                        skillData.futureRelevance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ 
                        width: isVisible ? `${skillData.futureRelevance}%` : '0%',
                        transitionDelay: `${index * 100 + 500}ms`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
        <h5 className="font-semibold text-gray-900 mb-3">Skills Portfolio Summary</h5>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-600">
              {skillsData.filter(s => s.riskLevel === 'Low').length}
            </div>
            <div className="text-xs text-gray-600">Low Risk Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {skillsData.filter(s => s.riskLevel === 'Medium').length}
            </div>
            <div className="text-xs text-gray-600">Medium Risk Skills</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {skillsData.filter(s => s.riskLevel === 'High').length}
            </div>
            <div className="text-xs text-gray-600">High Risk Skills</div>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <div className="text-lg font-bold text-blue-600">
            {Math.round(skillsData.reduce((acc, skill) => acc + skill.futureRelevance, 0) / skillsData.length)}%
          </div>
          <div className="text-xs text-gray-600">Average Future Relevance</div>
        </div>
      </div>
    </div>
  );
}