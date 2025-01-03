import { Link } from "react-router-dom";
import { Search, FileText, Settings, MessageSquare, Bug } from "lucide-react";
import { ActionCard } from "./ActionCard";
import { useContractHandler } from "./useContractHandler";
import { useState } from "react";
import { ReportIssueDialog } from "../shared/ReportIssueDialog";

export const QuickActions = () => {
  const { handleContractClick } = useContractHandler();
  const [showReportDialog, setShowReportDialog] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground/90">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/chat" className="block">
          <ActionCard
            icon={MessageSquare}
            title="Ask SkyGuide"
            description="Start a conversation"
          />
        </Link>

        <Link to="/search" className="block">
          <ActionCard
            icon={Search}
            title="Search"
            description="Find information"
          />
        </Link>

        <a href="#" onClick={handleContractClick} className="block">
          <ActionCard
            icon={FileText}
            title="Contract"
            description="View contract"
          />
        </a>

        <Link to="/settings" className="block">
          <ActionCard
            icon={Settings}
            title="Settings"
            description="Manage preferences"
          />
        </Link>

        <div className="block">
          <ActionCard
            icon={Bug}
            title="Report Issue"
            description="Submit feedback"
            onClick={() => setShowReportDialog(true)}
          />
        </div>
      </div>

      <ReportIssueDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog}
      />
    </div>
  );
};