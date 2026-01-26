import FileUpload from "@/components/file-upload";

export default function DashboardAnalyzeSection({ panelClassName, onAnalysisComplete }) {
  return (
    <div>
      <FileUpload panelClassName={panelClassName} onAnalysisComplete={onAnalysisComplete} />
    </div>
  );
}
