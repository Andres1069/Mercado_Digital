export default function BrandMark({ className = "" }) {
  return (
    <div
      className={`rounded-[1.2rem] flex items-center justify-center shadow-sm flex-shrink-0 ${className}`}
      style={{ backgroundColor: "#6B8E4E" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M4 5H6L8.2 14.2C8.31 14.66 8.8 15 9.31 15H18.4C18.87 15 19.29 14.73 19.47 14.32L21 10.75"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 19.2C9.55 19.2 10 18.75 10 18.2C10 17.65 9.55 17.2 9 17.2C8.45 17.2 8 17.65 8 18.2C8 18.75 8.45 19.2 9 19.2Z"
          fill="white"
        />
        <path
          d="M18 19.2C18.55 19.2 19 18.75 19 18.2C19 17.65 18.55 17.2 18 17.2C17.45 17.2 17 17.65 17 18.2C17 18.75 17.45 19.2 18 19.2Z"
          fill="white"
        />
        <path
          d="M10 8.5H19"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
