import React from "react";
import DashboardProvider from "./provider";

function DashBoardLayout({ children }) {
  return (
    <div>
      <DashboardProvider>{children}</DashboardProvider>
    </div>
  );
}

export default DashBoardLayout;
