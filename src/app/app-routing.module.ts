import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NavGuardService } from "components/NavGuard";

const routes: Routes = [
  { path: "login", loadChildren: "./pages/login/login.module#LoginPageModule" },
  {
    path: "register",
    loadChildren: "./pages/register/register.module#RegisterPageModule",
  },
  { path: "about", loadChildren: "./pages/about/about.module#AboutPageModule" },
  {
    path: "settings",
    loadChildren: "./pages/settings/settings.module#SettingsPageModule",
  },
  {
    path: "edit-profile",
    loadChildren:
      "./pages/edit-profile/edit-profile.module#EditProfilePageModule",
  },
  {
    path: "profile",
    loadChildren: "./pages/profile/profile.module#ProfilePageModule",
  },
  { path: "pesan", loadChildren: "./pages/pesan/pesan.module#PesanPageModule" },
  {
    path: "pesan/:search",
    loadChildren: "./pages/pesan/pesan.module#PesanPageModule",
  },
  {
    path: "pesan_form/:type",
    loadChildren: "./pages/pesan/form/pesan-form.module#PesanFormPageModule",
  },
  {
    path: "pesan_thread/:id",
    loadChildren:
      "./pages/pesan/thread/pesan-thread.module#PesanThreadPageModule",
  },
  {
    path: "projects",
    loadChildren: "./pages/projects/projects.module#ProjectsPageModule",
  },
  {
    path: "project-overview/:id",
    loadChildren:
      "./pages/projects/overview/project-overview.module#ProjectOverviewPageModule",
  },
  {
    path: "project-progress/:id",
    loadChildren:
      "./pages/analytics/progress/project-progress.module#ProjectProgressPageModule",
  },
  {
    path: "project-workers/:id",
    loadChildren:
      "./pages/analytics/workers/ProjectWorker.module#ProjectWorkerModule",
  },
  {
    path: "project-subcon/:id",
    loadChildren:
      "./pages/analytics/subcon/ProjectSubcon.module#ProjectSubconModule",
  },
  {
    path: "project-materials/:id",
    loadChildren:
      "./pages/analytics/materials/project-materials.module#ProjectMaterialsPageModule",
  },
  {
    path: "project-troubles/:id",
    loadChildren:
      "./pages/analytics/troubles/project-troubles.module#ProjectTroublesPageModule",
  },
  {
    path: "project-equipments/:id",
    loadChildren:
      "./pages/analytics/equipments/project-equipments.module#ProjectEquipmentsPageModule",
  },
  {
    path: "project-weathers/:id",
    loadChildren:
      "./pages/analytics/weathers/project-weathers.module#ProjectWeathersPageModule",
  },
  {
    path: "project-cost/:id",
    loadChildren: "./pages/analytics/cost/ProjectCost.module#ProjectCostModule",
  },
  {
    path: "daily-report/:id",
    loadChildren:
      "./pages/daily-report/daily-report.module#DailyReportPageModule",
  },
  {
    path: "projects-reports/:pid/:date/:rid",
    loadChildren:
      "./pages/daily-report/views/projects-reports.module#ProjectsReportsPageModule",
  },
  {
    path: "change_password",
    loadChildren:
      "./pages/change-password/change-password.module#ChangePasswordPageModule",
  },
  {
    path: "insights",
    loadChildren: "./pages/insights/insights.module#InsightsPageModule",
  },
  {
    path: "insights/:tab",
    loadChildren: "./pages/insights/insights.module#InsightsPageModule",
  },
  {
    path: "stakeholders",
    loadChildren:
      "./pages/stakeholders/stakeholders.module#StakeholdersPageModule",
  },
  {
    path: "stakeholders/:search/:id",
    loadChildren:
      "./pages/stakeholders/stakeholders.module#StakeholdersPageModule",
  },
  {
    path: "tutorial",
    loadChildren: "./pages/tutorial/tutorial.module#TutorialPageModule",
  },

  { path: "users", loadChildren: "./pages/users/Users.module#UsersModule" },
  {
    path: "users/:pid",
    loadChildren: "./pages/users/Users.module#UsersModule",
  },
  {
    path: "project-planners/:id",
    loadChildren:
      "./pages/project-planners/ProjectPlanners.module#ProjectPlannersModule",
  },
  {
    path: "project-admins/:id",
    loadChildren:
      "./pages/project-admins/ProjectAdmins.module#ProjectAdminsModule",
  },

  {
    path: "subcon-task/:id/:task",
    loadChildren:
      "./pages/analytics/subcon/tasks/SubconTask.module#SubconTaskModule",
  },
  {
    path: "subcons/:id",
    loadChildren: "./pages/subcon/contacts/Subcon.module#SubconModule",
  },

  {
    path: "input-field-trouble/:pid",
    loadChildren:
      "./pages/analytics/troubles/inputs/field/InputFieldTrouble.module#InputFieldTroubleModule",
  },
  {
    path: "input-field-trouble/:pid/:id",
    loadChildren:
      "./pages/analytics/troubles/inputs/field/InputFieldTrouble.module#InputFieldTroubleModule",
  },
  {
    path: "input-safety-trouble/:pid",
    loadChildren:
      "./pages/analytics/troubles/inputs/safety/InputSafetyTrouble.module#InputSafetyTroubleModule",
  },
  {
    path: "input-safety-trouble/:pid/:id",
    loadChildren:
      "./pages/analytics/troubles/inputs/safety/InputSafetyTrouble.module#InputSafetyTroubleModule",
  },

  //Planning
  {
    path: "planning/:id",
    loadChildren: "./pages/planning/Planning.module#PlanningModule",
  },
  {
    path: "materials-planning/:pid/:bid",
    loadChildren:
      "./pages/planning/materials/MaterialsPlanning.module#MaterialsPlanningModule",
  },
  {
    path: "equipments-planning/:pid/:bid",
    loadChildren:
      "./pages/planning/equipments/EquipmentsPlanning.module#EquipmentsPlanningModule",
  },
  {
    path: "workers-planning/:pid/:bid",
    loadChildren:
      "./pages/planning/workers/WorkersPlanning.module#WorkersPlanningModule",
  },
  {
    path: "methods/:pid",
    loadChildren: "./pages/planning/methods/Methods.module#MethodsModule",
  },
  {
    path: "method-details/:id",
    loadChildren:
      "./pages/planning/methods/details/MethodDetails.module#MethodDetailsModule",
  },

  //Inputs
  //Task Batch
  {
    path: "input-daily-task-batch/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/task-batch/InputDailyTaskBatch.module#InputDailyTaskBatchModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-daily-task-batch/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/task-batch/InputDailyTaskBatch.module#InputDailyTaskBatchModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-daily-task-batch/:pid/:date/:mode",
    loadChildren:
      "./pages/daily-report/inputs/task-batch/InputDailyTaskBatch.module#InputDailyTaskBatchModule",
    canDeactivate: [NavGuardService],
  },
  // Material Received
  {
    path: "input-material-received/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/material-received/InputMaterialReceived.module#InputMaterialReceivedModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-material-received/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/material-received/InputMaterialReceived.module#InputMaterialReceivedModule",
    canDeactivate: [NavGuardService],
  },
  //Material Used
  {
    path: "input-material-used/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/material-used/InputMaterialUsed.module#InputMaterialUsedModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-material-used/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/material-used/InputMaterialUsed.module#InputMaterialUsedModule",
    canDeactivate: [NavGuardService],
  },
  //Equipment Mob.
  {
    path: "input-equipment-mob/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/equipment-mob/InputEquipmentMob.module#InputEquipmentMobModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-equipment-mob/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/equipment-mob/InputEquipmentMob.module#InputEquipmentMobModule",
    canDeactivate: [NavGuardService],
  },
  //Equipment DeMob.
  {
    path: "input-equipment-demob/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/equipment-demob/InputEquipmentDemob.module#InputEquipmentDemobModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-equipment-demob/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/equipment-demob/InputEquipmentDemob.module#InputEquipmentDemobModule",
    canDeactivate: [NavGuardService],
  },
  //Weather.
  {
    path: "input-weather/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/weather/InputWeather.module#InputWeatherModule",
    canDeactivate: [NavGuardService],
  },
  {
    path: "input-weather/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/weather/InputWeather.module#InputWeatherModule",
    canDeactivate: [NavGuardService],
  },
  //Media
  {
    path: "input-media/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/media/InputMedia.module#InputMediaModule",
  },
  {
    path: "input-media/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/media/InputMedia.module#InputMediaModule",
  },
  //Worker
  {
    path: "input-worker/:pid/:date",
    loadChildren:
      "./pages/daily-report/inputs/worker/InputWorker.module#InputWorkerModule",
  },
  {
    path: "input-worker/:pid/:date/:item",
    loadChildren:
      "./pages/daily-report/inputs/worker/InputWorker.module#InputWorkerModule",
  },

  //Subcon Menus
  {
    path: "subcon-projects",
    loadChildren: "./pages/subcon/SubconProjects.module#SubconProjectsModule",
  },
  {
    path: "subcon-daily-report/:id",
    loadChildren:
      "./pages/subcon/daily-report/SubconDailyReport.module#SubconDailyReportModule",
  },
  {
    path: "subcon-reports/:pid/:date/:rid",
    loadChildren:
      "./pages/subcon/daily-report/views/SubconReports.module#SubconReportsModule",
  },
  {
    path: "subcon-input-task/:pid/:date/:mode",
    loadChildren:
      "./pages/subcon/daily-report/inputs/InputSubconTask.module#InputSubconTaskModule",
  },
  {
    path: "subcon-input-task/:pid/:date",
    loadChildren:
      "./pages/subcon/daily-report/inputs/InputSubconTask.module#InputSubconTaskModule",
  },
  {
    path: "subcon-input-media/:pid/:date",
    loadChildren:
      "./pages/subcon/daily-report/inputs/InputSubconMedia.module#InputSubconMediaModule",
  },
  //Checklist
  {
    path: "checklist/:pid",
    loadChildren: "./pages/checklist/Checklist.module#ChecklistModule",
  },
  {
    path: "checklist-details/:id",
    loadChildren:
      "./pages/checklist/details/ChecklistDetails.module#ChecklistDetailsModule",
  },
  //Pengajuan Capaian
  {
    path: "pengajuan-capaian/:pid",
    loadChildren:
      "./pages/pengajuan-capaian/PengajuanCapaian.module#PengajuanCapaianModule",
  },
  {
    path: "pengajuan-capaian-details/:pid/:id",
    loadChildren:
      "./pages/pengajuan-capaian/details/PengajuanCapaianDetails.module#PengajuanCapaianDetailsModule",
  },
  //Doc. Control
  {
    path: "document-control",
    loadChildren:
      "./pages/document-control/DocumentControl.module#DocumentControlModule",
  },
  {
    path: "document-control/rfi",
    loadChildren:
      "./pages/document-control/Rfi/home/RfiHome.module#RfiHomeModule",
  },
  {
    path: "document-control/rfi/Ajukan",
    loadChildren:
      "./pages/document-control/Rfi/input/InputRfi.module#InputRfiModule",
  },
  {
    path: "document-control/rfi/Ajukan/:id",
    loadChildren:
      "./pages/document-control/Rfi/input/InputRfi.module#InputRfiModule",
  },
  {
    path: "document-control/rfi/:id",
    loadChildren:
      "./pages/document-control/Rfi/detail/RfiDetail.module#RfiDetailModule",
  },
  {
    path: "document-control/submittal",
    loadChildren:
      "./pages/document-control/Submittal/home/SubmittalHome.module#SubmittalHomeModule",
  },
  {
    path: "document-control/submittal/Ajukan",
    loadChildren:
      "./pages/document-control/Submittal/input/InputSubmittal.module#InputSubmittalModule",
  },
  {
    path: "document-control/submittal/Ajukan/:id",
    loadChildren:
      "./pages/document-control/Submittal/input/InputSubmittal.module#InputSubmittalModule",
  },
  {
    path: "document-control/submittal/:id",
    loadChildren:
      "./pages/document-control/Submittal/detail/SubmittalDetail.module#SubmittalDetailModule",
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
