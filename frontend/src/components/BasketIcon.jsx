export default function BasketIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.943-4.593 2.256-6.75H5.106M7.5 14.25L5.106 5.25M7.5 14.25L6.75 18m10.5-3.75L18 18m-12 3.75h.008v.008H6.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm.375 0h.008v.008h-.008v-.008z" />
    </svg>
  );
}
