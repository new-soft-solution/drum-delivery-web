import type { ChildrenType } from "@/types/component-props.type";
import Image from "next/image";
import logoLight from "@/assets/images/logo-light.png";

const HIGHLIGHTS = [
  { icon: "📦", text: "Track every drum from port to site" },
  { icon: "🚚", text: "Schedule and monitor truck deliveries" },
  { icon: "📋", text: "Keep orders and shipments in sync" },
];

export default function AuthLayout({ children }: ChildrenType) {
  return (
    <div className="d-flex min-vh-100">
      <div
        className="d-none d-lg-flex flex-column justify-content-between p-5"
        style={{
          width: "42%",
          background:
            "linear-gradient(155deg, #040d23 0%, #203975 55%, #4073ec 100%)",
          color: "#fff",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <Image
            src={logoLight}
            alt="Drum Tracer"
            width={36}
            height={36}
            style={{ objectFit: "contain" }}
          />
          <div>
            <div className="fw-bold">Drum Tracer</div>
            <div className="small opacity-75">Midal Cables</div>
          </div>
        </div>

        <div>
          <h2 className="fw-bold mb-3" style={{ lineHeight: 1.25 }}>
            Track every drum,
            <br />
            every shipment.
          </h2>
          <div className="d-flex flex-column gap-3 mt-4">
            {HIGHLIGHTS.map((h) => (
              <div key={h.text} className="d-flex align-items-center gap-3">
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {h.icon}
                </span>
                <span className="opacity-90">{h.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="small opacity-60">
          © {new Date().getFullYear()} Midal Cables. All rights reserved.
        </div>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <div style={{ width: "100%", maxWidth: 400 }}>{children}</div>
      </div>
    </div>
  );
}
