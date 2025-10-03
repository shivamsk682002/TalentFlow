
import { useParams } from "react-router-dom";
import KanbanBoard from "./kanbanBoard";

export default function KanbanPage() {
  const { jobId = "" } = useParams();
  return <KanbanBoard jobId={jobId} />;
}
