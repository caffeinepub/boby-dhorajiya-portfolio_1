import ReactDOM from "react-dom/client";
import App from "./App";
import { InternetIdentityProvider } from "./hooks/useInternetIdentity";
import "../index.css";

BigInt.prototype.toJSON = function () {
  return this.toString();
};

declare global {
  interface BigInt {
    toJSON(): string;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <InternetIdentityProvider>
    <App />
  </InternetIdentityProvider>,
);
