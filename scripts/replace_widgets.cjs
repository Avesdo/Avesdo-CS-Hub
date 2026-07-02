const fs = require('fs');

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf-8');

const startString = "              {/* Client Health Hub */}";
const endString = "                </div>\n              </div>\n            </div>";

const startIndex = content.indexOf(startString);
let endIndex = content.indexOf(endString, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  endIndex = endIndex + endString.length;
  
  const replacement = `              <ClientHealthWidget
                totalScored={totalScored}
                activeClients={activeClients}
                healthyThresh={healthyThresh}
                warningThresh={warningThresh}
                healthyCount={healthyCount}
                warningCount={warningCount}
                riskCount={riskCount}
                openDrawer={openDrawer}
                suspendedProjects={suspendedProjects}
                atRiskClients={atRiskClients}
                hasSus={hasSus}
                hasRisk={hasRisk}
                settings={settings}
                movers={movers}
                isFetchingHistory={isFetchingHistory}
              />

              <ProjectDeliveryWidget
                onboardingPhases={onboardingPhases}
                settings={settings}
                filteredProjects={filteredProjects}
                projects={projects}
                openDrawer={openDrawer}
                deliveryTimelines={deliveryTimelines}
              />

              <FeatureAdoptionWidget
                featureAdoptionCombined={featureAdoptionCombined}
                filteredProjects={filteredProjects}
                openDrawer={openDrawer}
              />
            </div>

            {/* RIGHT COLUMN: People & Activity (1/3 Width) */}
            <div className="flex flex-col gap-5 h-full lg:block lg:relative">
              <div className="flex flex-col gap-5 lg:absolute lg:inset-0">
                <ManagerWorkloadWidget
                  managerWorkload={managerWorkload}
                  settings={settings}
                  filteredProjects={filteredProjects}
                  openDrawer={openDrawer}
                />

                <UpcomingActivityWidget
                  upcomingActivity={upcomingActivity}
                  getServiceIcon={getServiceIcon}
                  settings={settings}
                  openDrawer={openDrawer}
                />

                <RecentActivityWidget
                  recentActivity={recentActivity}
                  recentServices={recentServices}
                  recentLaunches={recentLaunches}
                  getServiceIcon={getServiceIcon}
                  settings={settings}
                  openDrawer={openDrawer}
                />`;
  
  content = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log("Success");
} else {
  console.log("Failed to find boundaries");
}
