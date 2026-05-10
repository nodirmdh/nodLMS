import ReactDOM from "react-dom/client";
import { Providers } from "@/app/providers";
import { routes } from "./routes";
import "./index.css";
import "./i18n";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Providers router={routes} />,
);
