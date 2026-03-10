import React from "react";
import Card from "./Card";
import Badge from "./Badge";

const StudyPlanTimeline = ({ plan }) => {
  if (!plan || plan.length === 0) return null;

  return (
    <div className="relative mt-8">
      <div className="absolute left-6 top-10 bottom-10 w-px border-l-2 border-dashed border-primary-500/30 hidden md:block"></div>

      <div className="space-y-6">
        {plan.map((stepItem, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row gap-4 items-start relative z-10"
          >
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-surface border-2 border-primary-500 text-primary-500 flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(99,102,241,0.2)]">
              {stepItem.step}
            </div>

            <Card glow className="flex-1 p-5 w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h4 className="text-lg font-bold text-textPrimary">
                  {stepItem.topic}
                </h4>
              </div>
              <p className="text-textSecondary mb-4 leading-relaxed">
                {stepItem.action}
              </p>

              {stepItem.resources && stepItem.resources.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {stepItem.resources.map((res, i) => (
                    <Badge key={i} variant="indigo" className="px-3 py-1">
                      {res}
                    </Badge>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyPlanTimeline;
