import { DeskFallback } from "../desk-controls";
import { initialDesk } from "@/lib/configurator/desk";
export function ProductArt({ kind = "desk" }: { kind?: string }) {
  if (kind === "desk")
    return <DeskFallback config={{ ...initialDesk, colour: "forest" }} />;
  return (
    <svg className="nx-product-art" viewBox="0 0 400 320" aria-hidden="true">
      <defs>
        <linearGradient id={`surface-${kind}`} x2="1" y2="1">
          <stop stopColor="#ece7dc" />
          <stop offset="1" stopColor="#b7b2a6" />
        </linearGradient>
      </defs>
      <ellipse cx="205" cy="271" rx="95" ry="12" fill="#46463b" opacity=".08" />
      {kind === "chair" ? (
        <g
          stroke="#786e5a"
          strokeWidth="9"
          fill={`url(#surface-${kind})`}
          strokeLinejoin="round"
        >
          <path d="m145 175-7 90m111-88 19 88m-22-154 10 66m-101-62-15 66" />
          <path d="M133 82q68-37 135 0l-9 77q-57 26-113 0Z" />
          <path d="m144 177 76 25 70-34-72-24Z" />
        </g>
      ) : kind === "lamp" ? (
        <g>
          <ellipse cx="200" cy="261" rx="62" ry="10" fill="#766c57" />
          <path d="M194 117h12v143h-12Z" fill="#9c8b69" />
          <path d="M111 128q88-156 178 0Z" fill={`url(#surface-${kind})`} />
          <ellipse cx="200" cy="128" rx="89" ry="9" fill="#f6edce" />
        </g>
      ) : kind === "ring" ? (
        <g transform="translate(200 176) rotate(-25)">
          <ellipse
            rx="62"
            ry="80"
            fill="none"
            stroke="#af9462"
            strokeWidth="17"
          />
          <path
            d="m-30-65 12-35h36l12 35L0-41Z"
            fill="#d9e4e4"
            stroke="#a4b7b6"
            strokeWidth="2"
          />
          <path
            d="m-18-100 18 59 18-59M-30-65h60"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g fill={`url(#surface-${kind})`} stroke="#a4a79d" strokeWidth="2">
          <path d="M162 114q-20-54 38-63 57 9 38 63l33 107q15 45-71 45t-71-45Z" />
          <ellipse cx="200" cy="68" rx="33" ry="12" fill="#818d80" />
          {[145, 163, 181, 199, 217, 235].map((y) => (
            <path
              key={y}
              d={`M${150 - (y - 145) * 0.18} ${y}q50 22 ${100 + (y - 145) * 0.36} 0`}
              fill="none"
              stroke="#c2c3b7"
            />
          ))}
        </g>
      )}
    </svg>
  );
}
