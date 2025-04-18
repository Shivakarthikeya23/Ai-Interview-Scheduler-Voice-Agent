import React from "react";
import DashboardProvider from "./provider";

function DashBoardLayout({ children }) {
  return (
    <div className="bg-secondary">
      <DashboardProvider>
        <div className="p-10">{children}</div>
      </DashboardProvider>
    </div>
  );
}

export default DashBoardLayout;
