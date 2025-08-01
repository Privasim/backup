'use client';

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import OccupationSearch from './OccupationSearch';
import IndustryExposureChart from './IndustryExposureChart';
import RiskComparisonChart from './RiskComparisonChart';
import OccupationInsights from './OccupationInsights';
import { useTopRiskOccupations, useTaskAutomationData } from '@/hooks/useResearchData';
import { OccupationMatch } from '@/lib/research/service';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export interface ResearchDashboardProps {
  className?: string;
}

export function ResearchDashboard({ className = '' }: ResearchDashboardProps) {
  const [selectedOccupation, setSelectedOccupation] = useState<OccupationMatch | null>(null);
  const { occupations: topRiskOccupations, isLoading: isLoadingTop } = useTopRiskOccupations(15);
  const { tasks: taskData, isLoading: isLoadingTasks } = useTaskAutomationData();

  const tabs = [
    { name: 'Occupation Explorer', id: 'explorer' },
    { name: 'Industry Analysis', id: 'industry' },
    { name: 'Task Automation', id: 'tasks' },
    { name: 'Top Risk Occupations', id: 'top-risk' },
  ];

  const handleOccupationSelect = (occupation: OccupationMatch) => {
    setSelectedOccupation(occupation);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AI Employment Risk Research Dashboard
        </h2>
        <p className="text-gray-600">
          Explore comprehensive data on AI's impact on employment across occupations and industries
        </p>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-gray-100 p-1 m-6 rounded-lg">
          {tabs.map((tab) => (
            <Tab
              key={tab.id}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-800'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="p-6">
          {/* Occupation Explorer */}
          <Tab.Panel className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Search and Explore Occupations
              </h3>
              <OccupationSearch
                onSelect={handleOccupationSelect}
                placeholder="Search for any occupation (e.g., Software Developer, Teacher, Nurse)..."
                className="mb-6"
                maxResults={8}
              />
            </div>

            {selectedOccupation && (
              <div className="grid lg:grid-cols-2 gap-6">
                <RiskComparisonChart
                  data={{
                    userRisk: selectedOccupation.occupation.riskScore,
                    benchmarkRisk: 0.5, // Average benchmark
                    occupation: selectedOccupation.occupation.name,
                    percentile: 50, // Would be calculated from service
                  }}
                  height={250}
                />
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Quick Facts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">SOC Code:</span>
                      <span className="font-medium">{selectedOccupation.occupation.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Score:</span>
                      <span className="font-medium">
                        {(selectedOccupation.occupation.riskScore * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Match Score:</span>
                      <span className="font-medium">{selectedOccupation.matchScore.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedOccupation && (
              <OccupationInsights
                occupationRisk={{
                  occupation: selectedOccupation.occupation,
                  riskLevel: selectedOccupation.occupation.riskScore >= 0.8 ? 'very_high' :
                           selectedOccupation.occupation.riskScore >= 0.6 ? 'high' :
                           selectedOccupation.occupation.riskScore >= 0.4 ? 'medium' : 'low',
                  percentile: 50, // Would be calculated
                  similarOccupations: [], // Would be fetched
                }}
              />
            )}
          </Tab.Panel>

          {/* Industry Analysis */}
          <Tab.Panel>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Industry-Level AI Exposure Analysis
              </h3>
              <p className="text-gray-600 mb-6">
                Compare AI exposure levels across different industries based on employment-weighted 
                occupation exposure scores.
              </p>
              <IndustryExposureChart
                height={500}
                limit={20}
                showEmployment={true}
              />
            </div>
          </Tab.Panel>

          {/* Task Automation */}
          <Tab.Panel>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Task Category Automation Potential
              </h3>
              <p className="text-gray-600 mb-6">
                Analysis of different task categories and their susceptibility to AI automation.
              </p>
              
              {isLoadingTasks ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4">
                  {taskData.map((task, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-900">{task.taskCategory}</h4>
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs font-medium ${
                            task.automationPotential >= 0.8 ? 'bg-red-100 text-red-800' :
                            task.automationPotential >= 0.6 ? 'bg-orange-100 text-orange-800' :
                            task.automationPotential >= 0.4 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {(task.automationPotential * 100).toFixed(0)}% Risk
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Human Complementarity:</span>
                          <span className="ml-2 font-medium">{task.humanComplementarity}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Timeline:</span>
                          <span className="ml-2 font-medium">{task.timeline}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>

          {/* Top Risk Occupations */}
          <Tab.Panel>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Highest Risk Occupations
              </h3>
              <p className="text-gray-600 mb-6">
                Occupations with the highest AI exposure scores based on task analysis.
              </p>
              
              {isLoadingTop ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topRiskOccupations.map((occupation, index) => (
                    <div
                      key={occupation.code}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleOccupationSelect({ 
                        occupation, 
                        matchScore: 100, 
                        matchReasons: ['Top risk occupation'] 
                      })}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          <span className="text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{occupation.name}</div>
                          <div className="text-sm text-gray-500">SOC: {occupation.code}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                          occupation.riskScore >= 0.9 ? 'bg-red-100 text-red-800' :
                          occupation.riskScore >= 0.8 ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {(occupation.riskScore * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

export default ResearchDashboard;